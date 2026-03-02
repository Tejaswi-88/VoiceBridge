# app/schemas/college.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class CollegeMiniResponse(BaseModel):
    id: UUID
    name: str
    abbreviation: Optional[str]
    code: str

    class Config:
        from_attributes = True


class CollegeUpdate(BaseModel):
    name: Optional[str]
    abbreviation: Optional[str]
    institution_type: Optional[str]
    website_url: Optional[str]
    street_address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
