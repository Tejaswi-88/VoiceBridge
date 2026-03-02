from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

from app.schemas.role import RoleMiniResponse
from app.schemas.college import CollegeMiniResponse


class AdminUserCreate(BaseModel):
    first_name: str
    middle_name: Optional[str]
    last_name: str
    gender: str = "OTHER"

    username: str
    email: EmailStr
    password: str

    role_id: int
    college_id: UUID

class AdminUserUpdate(BaseModel):
    first_name: Optional[str]
    middle_name: Optional[str]
    last_name: Optional[str]
    gender: Optional[str]

    username: Optional[str]
    email: Optional[EmailStr]
    role_id: Optional[int]
    is_active: Optional[bool]


class AdminUserResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr

    first_name: str
    middle_name: Optional[str]
    last_name: str
    gender: str

    is_active: bool

    role: RoleMiniResponse
    college: Optional[CollegeMiniResponse]

    temp_password: Optional[str] = None

    class Config:
        from_attributes = True

