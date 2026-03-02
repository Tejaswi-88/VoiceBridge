from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID
import os

from app.db.session import SessionLocal
from app.models.knowledge_file import KnowledgeFile
from app.schemas.knowledge_file import KnowledgeFileOut
from app.utils.file_storage import save_file, generate_hash

from app.api.v1.users import get_current_user, get_token
from app.models.user import User

from app.services.kb_ingestion_service import ingest_text_into_kb
from app.services.document_loader import load_document
from app.models.knowledge_chunk import KnowledgeChunk

from app.services.excel_ingestion_service import ingest_semester_gpa_excel


router = APIRouter(prefix="/kb", tags=["Knowledge Base"])

ALLOWED_ROLES = {4, 5}
ALLOWED_EXTENSIONS = [
    "pdf", "docx", "doc", "xlsx", "xls",
    "txt", "ppt", "pptx",
    "jpg", "jpeg", "png"
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def is_image_extension(ext: str) -> bool:
    return ext.lower() in [".jpg", ".jpeg", ".png"]


# ========================= UPLOAD =========================
@router.post("/upload", response_model=KnowledgeFileOut)
async def upload_file(
    college_id: UUID = Form(...),
    tags: str | None = Form(None),
    description: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user: User = get_current_user(token, db)

    if user.role_id not in ALLOWED_ROLES:
        raise HTTPException(403, "Not allowed")

    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "File type not allowed")

    content = await file.read()
    size_kb = round(len(content) / 1024, 2)
    file_hash = generate_hash(content)

    duplicate = db.query(KnowledgeFile).filter(
        KnowledgeFile.college_id == college_id,
        KnowledgeFile.file_hash == file_hash,
        KnowledgeFile.is_active == True
    ).first()

    if duplicate:
        raise HTTPException(409, "This exact file already exists")

    path = save_file(content, file.filename, file_hash)

    record = KnowledgeFile(
        college_id=college_id,
        uploaded_by=user.id,
        file_name=file.filename,
        file_type=extension.upper(),
        file_extension=f".{extension}",
        file_size_kb=size_kb,
        storage_path=path,
        file_hash=file_hash,
        tags=tags,
        description=description,
        is_approved=(user.role_id == 4),
        is_processed=False,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # -------- INGEST --------
    try:
        ext = record.file_extension.lower()

        # 🟩 EXCEL → DATABASE INGESTION ONLY
        if ext in [".xlsx", ".xls"]:
            ingest_semester_gpa_excel(
                db=db,
                file_path=record.storage_path,
                branch=tags or "UNKNOWN"
            )
            record.is_processed = True
            db.commit()
            return record

        # 🖼 IMAGE → DESCRIPTION ONLY
        if is_image_extension(ext):
            extracted_text = f"""
EVENT NOTICE (IMAGE)

KEY DETAILS (AUTHORITATIVE – USE THESE FIRST):
{record.description or "No admin description provided."}
"""
        # 📄 DOCUMENT → RAG
        else:
            extracted_text = load_document(record.storage_path)

        await ingest_text_into_kb(
            db=db,
            knowledge_file_id=record.id,
            college_id=college_id,
            extracted_text=extracted_text,
            filename=record.file_name,
        )

        record.is_processed = True

    except Exception as e:
        db.rollback()  # 🔥 REQUIRED
        record.is_processed = False
        print("❌ KB ingestion failed:", e)


    finally:
        db.commit()
        db.refresh(record)

    return record


# ========================= LIST =========================
@router.get("/{college_id}", response_model=list[KnowledgeFileOut])
def list_files(college_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(KnowledgeFile)
        .filter(KnowledgeFile.college_id == college_id)
        .filter(KnowledgeFile.is_active == True)
        .order_by(KnowledgeFile.uploaded_at.desc())
        .all()
    )


# ========================= DOWNLOAD =========================
@router.get("/download/{file_id}")
def download_file(file_id: UUID, db: Session = Depends(get_db)):
    file = db.query(KnowledgeFile).filter(
        KnowledgeFile.id == file_id,
        KnowledgeFile.is_active == True
    ).first()

    if not file:
        raise HTTPException(404, "File not found")

    if not os.path.exists(file.storage_path):
        raise HTTPException(404, "File missing on disk")

    return FileResponse(
        path=file.storage_path,
        filename=file.file_name,
        media_type="application/octet-stream"
    )


# ========================= UPDATE =========================
@router.put("/{file_id}")
def update_file(
    file_id: UUID,
    new_name: str | None = None,
    tags: str | None = None,
    description: str | None = None,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    if user.role_id not in ALLOWED_ROLES:
        raise HTTPException(403, "Not allowed")

    file = db.query(KnowledgeFile).filter_by(id=file_id).first()
    if not file:
        raise HTTPException(404, "File not found")

    if new_name:
        file.file_name = new_name
    if tags is not None:
        file.tags = tags
    if description is not None:
        file.description = description

    db.commit()
    return {"success": True}


# ========================= DELETE =========================
@router.delete("/{file_id}")
def delete_file(
    file_id: UUID,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    if user.role_id not in ALLOWED_ROLES:
        raise HTTPException(403, "Not allowed")

    file = db.query(KnowledgeFile).filter_by(id=file_id).first()
    if not file:
        raise HTTPException(404, "File not found")

    file.is_active = False
    db.commit()

    return {"deleted": True}


# ========================= REPROCESS =========================
@router.post("/{file_id}/reprocess")
async def reprocess_file(
    file_id: UUID,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user: User = get_current_user(token, db)

    if user.role_id not in ALLOWED_ROLES:
        raise HTTPException(403, "Not allowed")

    file = db.query(KnowledgeFile).filter_by(id=file_id).first()
    if not file:
        raise HTTPException(404, "File not found")

    if not os.path.exists(file.storage_path):
        raise HTTPException(404, "File missing on disk")

    ext = file.file_extension.lower()

    try:
        # 🟩 EXCEL → DATABASE REPROCESS
        if ext in [".xlsx", ".xls"]:
            ingest_semester_gpa_excel(
                db=db,
                file_path=file.storage_path,
                branch=file.tags or "UNKNOWN"
            )
            file.is_processed = True
            db.commit()
            return {"reprocessed": True, "type": "excel"}

        # 🔥 DELETE CHUNKS ONLY FOR NON-EXCEL
        db.query(KnowledgeChunk).filter(
            KnowledgeChunk.knowledge_file_id == file.id
        ).delete()
        db.commit()

        if is_image_extension(ext):
            extracted_text = f"""
EVENT NOTICE (IMAGE)

KEY DETAILS (AUTHORITATIVE – USE THESE FIRST):
{file.description or "No admin description provided."}
"""
        else:
            extracted_text = load_document(file.storage_path)

        await ingest_text_into_kb(
            db=db,
            knowledge_file_id=file.id,
            college_id=file.college_id,
            extracted_text=extracted_text,
            filename=file.file_name,
        )

        file.is_processed = True

    except Exception as e:
        file.is_processed = False
        print("❌ KB reprocess failed:", e)

    db.commit()
    db.refresh(file)

    return {"reprocessed": True, "is_processed": file.is_processed}
