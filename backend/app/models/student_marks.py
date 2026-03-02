from sqlalchemy import Column, String, Text, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base


class StudentMark(Base):
    __tablename__ = "student_marks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        String,
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    subject_code = Column(Text)
    subject_name = Column(Text)
    semester = Column(Text)

    marks_obtained = Column(Float)
    max_marks = Column(Float)
    percentage = Column(Float)
    grade = Column(Text)
    remarks = Column(Text)
