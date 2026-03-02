# backend/app/services/excel_ingestion_service.py

import pandas as pd
import uuid
import re
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.student_semester_results import StudentSemesterResult


def _safe_int(value) -> int:
    """
    Convert values like:
    - 0
    - "0"
    - "3 - OS, DBMS, ML"
    - NaN
    into a safe integer.
    """
    if value is None or pd.isna(value):
        return 0

    # Extract first number found
    match = re.search(r"\d+", str(value))
    return int(match.group()) if match else 0


def _safe_float(value):
    if value is None or pd.isna(value):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def ingest_semester_gpa_excel(
    *,
    db: Session,
    file_path: str,
    branch: str,
):
    """
    Ingest Semester GPA Excel into student_semester_results table
    """

    df = pd.read_excel(file_path)

    required_columns = [
        "Student ID",
        "Student Name",
        "Semester",
        "Total Credits",
        "SGPA",
        "CGPA",
        "Backlogs",
    ]

    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")

    for _, row in df.iterrows():
        student_id = str(row["Student ID"]).strip()
        student_name = str(row["Student Name"]).strip()

        # ---------- Ensure student exists ----------
        student = db.query(Student).filter_by(student_id=student_id).first()
        if not student:
            student = Student(
                student_id=student_id,
                student_name=student_name,
                branch=branch,
            )
            db.add(student)
            db.flush()  # DO NOT COMMIT INSIDE LOOP

        # ---------- Insert semester result ----------
        result = StudentSemesterResult(
            id=uuid.uuid4(),
            student_id=student_id,
            semester=str(row["Semester"]).strip(),
            total_credits=_safe_float(row["Total Credits"]),
            sgpa=_safe_float(row["SGPA"]),
            cgpa=_safe_float(row["CGPA"]),
            backlogs=_safe_int(row["Backlogs"]),
        )

        db.add(result)

    db.commit()
