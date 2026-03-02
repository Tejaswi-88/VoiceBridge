from sqlalchemy import Column, Text, Float, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid
from app.db.session import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chat_conversations.id"))

    sender = Column(Text)
    message = Column(Text)

    language = Column(Text)
    category = Column(Text)
    sentiment = Column(Text)

    confidence = Column(Float)

    embedding = Column(Vector(1536))

    response_time_ms = Column(Integer)

    created_at = Column(TIMESTAMP, server_default=func.now())
