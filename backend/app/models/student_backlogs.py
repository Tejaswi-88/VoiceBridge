from sqlalchemy import Column, String, Text, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base


class StudentBacklog(Base):
    __tablename__ = "student_backlogs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        String,
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    semester = Column(Text)
    subject_code = Column(Text)
    subject_name = Column(Text)
    reason = Column(Text)
    attempts = Column(Integer)
    status = Column(Text)
    clearance_date = Column(Date)
