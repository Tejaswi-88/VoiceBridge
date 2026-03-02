from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class UnansweredTicket(Base):
    __tablename__ = "unanswered_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=False)

    category = Column(String, nullable=False)

    user_language = Column(String, nullable=False)

    original_query = Column(Text, nullable=False)
    normalized_query = Column(Text, nullable=False)

    bot_reply = Column(Text, nullable=False)

    status = Column(String, default="PENDING")  
    # PENDING | IN_PROGRESS | SOLVED | IGNORED

    created_at = Column(TIMESTAMP, server_default=func.now())
