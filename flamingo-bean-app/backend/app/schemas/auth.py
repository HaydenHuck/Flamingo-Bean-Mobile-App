from pydantic import BaseModel


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    active: bool


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    admin: AdminUserResponse
