from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.session import Base


class ChatTicket(Base):
    __tablename__ = "chat_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chat_conversations.id"))

    category = Column(Text)
    priority = Column(Text)
    language = Column(Text)

    status = Column(Text, default="open")

    created_at = Column(TIMESTAMP, server_default=func.now())
