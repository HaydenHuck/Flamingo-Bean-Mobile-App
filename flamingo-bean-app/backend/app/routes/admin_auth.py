from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_current_admin_user, verify_password
from app.database import get_db
from app.models.admin_user import AdminUser
from app.schemas.auth import AdminLoginRequest, AdminLoginResponse, AdminUserResponse

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post("/login", response_model=AdminLoginResponse)
def login_admin(credentials: AdminLoginRequest, db: Session = Depends(get_db)) -> AdminLoginResponse:
    admin_user = db.query(AdminUser).filter(AdminUser.email == credentials.email.lower().strip()).first()

    if not admin_user or not verify_password(credentials.password, str(admin_user.password_hash)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials.")

    if not admin_user.active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin user is inactive.")

    return AdminLoginResponse(
        access_token=create_access_token(admin_user),
        token_type="bearer",
        admin=to_admin_user_response(admin_user),
    )


@router.get("/me", response_model=AdminUserResponse)
def get_current_admin(admin_user: AdminUser = Depends(get_current_admin_user)) -> AdminUserResponse:
    return to_admin_user_response(admin_user)


def to_admin_user_response(admin_user: AdminUser) -> AdminUserResponse:
    return AdminUserResponse(
        id=int(admin_user.id),
        email=str(admin_user.email),
        role=str(admin_user.role),
        active=bool(admin_user.active),
    )
