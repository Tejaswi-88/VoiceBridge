from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base


class StudentSemesterResult(Base):
    __tablename__ = "student_semester_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        String,
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    semester = Column(String, nullable=False)
    total_credits = Column(Float)
    sgpa = Column(Float)
    cgpa = Column(Float)
    backlogs = Column(Integer)
