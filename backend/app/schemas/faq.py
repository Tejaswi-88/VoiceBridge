from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class FAQBase(BaseModel):
    college_id: UUID
    category: str
    language: str
    question: str
    answer: str

class FAQCreate(FAQBase):
    pass

class FAQUpdate(FAQBase):
    pass

class FAQResponse(BaseModel):
    id: UUID
    category: str
    language: str
    question: str
    answer: str
    is_active: bool
    is_approved: bool

    class Config:
        from_attributes = True  # pydantic v2 fix
