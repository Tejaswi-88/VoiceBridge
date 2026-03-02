from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.session import Base

class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    category = Column(String, nullable=False)
    language = Column(String, nullable=False)

    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=text("NOW()"))
    updated_at = Column(
        TIMESTAMP, server_default=text("NOW()"), onupdate=text("NOW()")
    )
