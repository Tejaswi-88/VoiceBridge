from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.schemas.college import CollegeMiniResponse
from app.schemas.role import RoleMiniResponse

class UserMeResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr

    role_id: int
    college_id: UUID

    first_name: str
    middle_name: Optional[str]
    last_name: str
    gender: str

    is_active: bool
    created_at: datetime

    role: Optional[RoleMiniResponse]
    college: Optional[CollegeMiniResponse]

    class Config:
        from_attributes = True



class UserMeUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None

    # Editable only by Admin & Volunteer
    email: Optional[EmailStr] = None
    username: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
