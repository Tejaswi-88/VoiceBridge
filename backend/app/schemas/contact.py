from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class ContactCreate(BaseModel):
    college_id: UUID
    name: str
    category: str

    college_email: EmailStr
    phone_number: str
    personal_email: Optional[EmailStr] = None

    designation: Optional[str] = None
    office_location: Optional[str] = None
    availability: Optional[str] = None

    is_primary: Optional[bool] = False


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

    college_email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    personal_email: Optional[EmailStr] = None

    designation: Optional[str] = None
    office_location: Optional[str] = None
    availability: Optional[str] = None

    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class ContactResponse(BaseModel):
    id: UUID
    name: str
    category: str

    college_email: EmailStr
    phone_number: str
    personal_email: Optional[EmailStr]

    designation: Optional[str]
    office_location: Optional[str]
    availability: Optional[str]

    is_primary: bool
    is_active: bool
    is_verified: bool

    class Config:
        orm_mode = True
