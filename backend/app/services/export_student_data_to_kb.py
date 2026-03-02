# backend/app/services/export_student_data_to_kb.py
from app.models.knowledge_file import KnowledgeFile
import uuid

import asyncio
from uuid import UUID
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.kb_ingestion_service import ingest_text_into_kb

from app.models.student import Student
from app.models.student_semester_results import StudentSemesterResult
from app.models.student_marks import StudentMark


COLLEGE_ID = UUID("742c54c2-6d1d-4a77-a0e5-3d7d56a7189c")
VIRTUAL_FILENAME = "Student Academic Database Export"


def build_student_semester_chunk(
    student: Student,
    result: StudentSemesterResult,
    marks: list[StudentMark],
) -> str:
    text = [
        "STUDENT ACADEMIC RECORD",
        f"Student ID: {student.student_id}",
        f"Student Name: {student.student_name}",
        f"Branch: {student.branch}",
        f"Semester: {result.semester}",
        "",
        "ACADEMIC PERFORMANCE:",
        f"- SGPA: {result.sgpa}",
        f"- CGPA: {result.cgpa}",
        f"- Total Credits: {result.total_credits}",
        f"- Backlogs: {result.backlogs}",
    ]

    if marks:
        text.append("")
        text.append("SUBJECT MARKS:")
        for m in marks:
            text.append(
                f"- {m.subject_name}: {m.marks_obtained}/{m.max_marks} "
                f"(Grade: {m.grade})"
            )

    return "\n".join(text)


def get_or_create_virtual_kb_file(db):
    file = (
        db.query(KnowledgeFile)
        .filter(KnowledgeFile.file_name == "Student Academic Database Export")
        .filter(KnowledgeFile.college_id == COLLEGE_ID)
        .first()
    )

    if file:
        return file

    file = KnowledgeFile(
        id=uuid.uuid4(),
        college_id=COLLEGE_ID,
        uploaded_by=None,
        file_name="Student Academic Database Export",
        file_type="SYSTEM",
        file_extension=".virtual",
        file_size_kb=0,
        storage_path="DATABASE",
        file_hash="STUDENT_DB_EXPORT",
        tags="students,academics,results",
        description="Auto-generated academic records from database",
        is_approved=True,
        is_processed=True,
        is_active=True,
    )

    db.add(file)
    db.commit()
    db.refresh(file)
    return file


async def main():
    db: Session = SessionLocal()

    try:
        results = (
            db.query(StudentSemesterResult, Student)
            .join(Student, Student.student_id == StudentSemesterResult.student_id)
            .all()
        )

        chunks = []

        for result, student in results:
            marks = (
                db.query(StudentMark)
                .filter(
                    StudentMark.student_id == student.student_id,
                    StudentMark.semester == result.semester
                )
                .all()
            )

            chunk_text = build_student_semester_chunk(
                student=student,
                result=result,
                marks=marks
            )

            chunks.append(chunk_text)

        print(f"📦 Exporting {len(chunks)} canonical student chunks")

        kb_file = get_or_create_virtual_kb_file(db)

        for text in chunks:
            await ingest_text_into_kb(
                db=db,
                knowledge_file_id=kb_file.id,   # ✅ FK satisfied
                college_id=COLLEGE_ID,
                extracted_text=text,
                filename=kb_file.file_name,
            )

        print("✅ Student academic data ingested correctly into RAG")

    finally:
        db.close()




if __name__ == "__main__":
    asyncio.run(main())
