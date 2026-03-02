from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    knowledge_file_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_files.id"))
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"))

    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(1536))

    source_file = Column(Text)
    page_number = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
