from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterRequest(BaseModel):
    username: str
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    password: str
    college_id: str
    role_id: int
    gender: str = Field(..., pattern="^(MALE|FEMALE|OTHER)$")   

class LoginRequest(BaseModel):
    identifier: str   # email or username
    password: str