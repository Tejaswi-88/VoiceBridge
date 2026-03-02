from sqlalchemy import Column, Text, Boolean, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.session import Base


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"), nullable=False)

    role_id = Column(Integer, nullable=True)

    is_anonymous = Column(Boolean, default=False)

    title = Column(Text, nullable=True)
    language = Column(Text, default="en")

    memory_summary = Column(Text, nullable=True)  # ✅ NEW

    started_at = Column(TIMESTAMP, server_default=func.now())
    last_message_at = Column(TIMESTAMP, server_default=func.now())

    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)

