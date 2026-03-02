from sqlalchemy import Column, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.db.session import Base


class Student(Base):
    __tablename__ = "students"

    student_id = Column(String, primary_key=True, index=True)
    student_name = Column(Text, nullable=False)
    branch = Column(Text, nullable=False)
    year = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
