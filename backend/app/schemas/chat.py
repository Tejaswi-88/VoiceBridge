from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class ConversationOut(BaseModel):
    id: UUID
    language: Optional[str]
    is_anonymous: bool

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    message: str


class MessageOut(BaseModel):
    id: UUID
    sender: str
    message: str
    language: Optional[str]
    confidence: Optional[float]
    response_time_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
