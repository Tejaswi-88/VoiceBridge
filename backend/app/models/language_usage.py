from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class LanguageUsage(Base):
    __tablename__ = "language_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=False)

    language_code = Column(String, nullable=False)  # en, hi, te, ko, ja, etc
    usage_count = Column(Integer, default=0)

    last_used_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("college_id", "language_code", name="uq_college_language"),
    )
