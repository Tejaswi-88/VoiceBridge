# app/schemas/role.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class RoleMiniResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
