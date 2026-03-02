from sqlalchemy import Column, Text, Boolean, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class KnowledgeFile(Base):
    __tablename__ = "knowledge_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"))
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    file_name = Column(Text, nullable=False)
    file_type = Column(Text, nullable=False)
    file_extension = Column(Text, nullable=False)
    file_size_kb = Column(Integer, nullable=False)

    storage_path = Column(Text, nullable=False)

    file_hash = Column(Text, nullable=False, index=True)

    tags = Column(Text, nullable=True)

    description = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    is_processed = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)

    uploaded_at = Column(TIMESTAMP, server_default=func.now())
