# backend/app/services/student_query_service.py

import re
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.student_semester_results import StudentSemesterResult
from app.models.student_marks import StudentMark
from app.models.placements import Placement


STUDENT_ID_REGEX = r"\b\d{2}[A-Z]{2}\d[A-Z]\d{4}\b"


def extract_student_id(text: str) -> str | None:
    match = re.search(STUDENT_ID_REGEX, text.upper())
    return match.group(0) if match else None


def is_sgpa_query(text: str) -> bool:
    return "sgpa" in text.lower()


def is_marks_query(text: str) -> bool:
    return "marks" in text.lower()


def get_student_sgpa(db: Session, student_id: str, semester: str | None = None):
    q = db.query(StudentSemesterResult).filter_by(student_id=student_id)

    if semester:
        q = q.filter_by(semester=semester)

    result = q.first()
    return result


def get_student_marks(db: Session, student_id: str):
    return (
        db.query(StudentMark)
        .filter_by(student_id=student_id)
        .all()
    )


def handle_student_query(db: Session, user_message: str) -> str | None:
    student_id = extract_student_id(user_message)
    if not student_id:
        return None

    if is_sgpa_query(user_message):
        semester_match = re.search(r"semester\s*(\d)", user_message.lower())
        semester = semester_match.group(1) if semester_match else None

        result = get_student_sgpa(db, student_id, semester)
        if not result:
            return f"No SGPA record found for student {student_id}."

        return (
            f"Student ID: {student_id}\n"
            f"Semester: {result.semester}\n"
            f"SGPA: {result.sgpa}\n"
            f"CGPA: {result.cgpa}\n"
            f"Backlogs: {result.backlogs}"
        )

    if is_marks_query(user_message):
        marks = get_student_marks(db, student_id)
        if not marks:
            return f"No marks found for student {student_id}."

        lines = [f"Marks for student {student_id}:"]
        for m in marks:
            lines.append(
                f"{m.subject_name} ({m.subject_code}) → "
                f"{m.marks_obtained}/{m.max_marks} | Grade: {m.grade}"
            )

        return "\n".join(lines)

    return None
