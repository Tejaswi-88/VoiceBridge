from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class KnowledgeFileBase(BaseModel):
    file_name: str
    file_type: str
    file_extension: str
    file_size_kb: int
    tags: Optional[str] = None
    description: Optional[str] = None


class KnowledgeFileOut(KnowledgeFileBase):
    id: UUID
    college_id: UUID
    uploaded_by: Optional[UUID] = None

    is_active: bool
    is_processed: bool
    is_approved: bool

    uploaded_at: datetime

    class Config:
        from_attributes = True
