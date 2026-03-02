from sqlalchemy import Column, String, Text, Float, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base


class Placement(Base):
    __tablename__ = "placements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        String,
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    company_name = Column(Text)
    job_role = Column(Text)
    round_name = Column(Text)
    status = Column(Text)
    package = Column(Float)
    placement_date = Column(Date)
