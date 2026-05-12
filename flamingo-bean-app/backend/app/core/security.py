import os
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin_user import AdminUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(admin_user: AdminUser) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=get_jwt_expire_minutes())
    payload: dict[str, Any] = {
        "sub": str(admin_user.id),
        "email": admin_user.email,
        "role": admin_user.role,
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(payload, get_jwt_secret_key(), algorithm=get_jwt_algorithm())


def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing admin authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(credentials.credentials, get_jwt_secret_key(), algorithms=[get_jwt_algorithm()])
        admin_user_id = payload.get("sub")
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if not admin_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        parsed_admin_user_id = int(admin_user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    admin_user = db.query(AdminUser).filter(AdminUser.id == parsed_admin_user_id).first()

    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not admin_user.active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin user is inactive.")

    return admin_user


def get_jwt_secret_key() -> str:
    secret_key = os.getenv("JWT_SECRET_KEY")

    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY is required for admin authentication.")

    return secret_key


def get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def get_jwt_expire_minutes() -> int:
    raw_value = os.getenv("JWT_EXPIRE_MINUTES", "60")

    try:
        expire_minutes = int(raw_value)
    except ValueError as exc:
        raise RuntimeError("JWT_EXPIRE_MINUTES must be an integer.") from exc

    if expire_minutes <= 0:
        raise RuntimeError("JWT_EXPIRE_MINUTES must be greater than zero.")

    return expire_minutes
