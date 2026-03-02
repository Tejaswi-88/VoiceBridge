from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import uuid
import traceback

from app.models.knowledge_chunk import KnowledgeChunk
from app.services.kb_chunking_service import split_into_chunks
from app.services.embedding_service import generate_embedding

def is_image_file(filename: str) -> bool:
    return filename.lower().endswith((".jpg", ".jpeg", ".png"))

async def ingest_text_into_kb(
    *,
    db: Session,
    knowledge_file_id: UUID,   # ✅ existing KnowledgeFile
    college_id: UUID,
    extracted_text: str,
    filename: str,
    page_number: Optional[int] = None,
) -> dict:
    """
    Ingest raw extracted text into the knowledge base:
    - split into chunks
    - generate embeddings
    - store chunks in DB
    """

    if not extracted_text or not extracted_text.strip():
        # Image fallback: use description if available
        kb_file = db.query(KnowledgeFile).filter_by(id=knowledge_file_id).first()

        if kb_file and is_image_file(kb_file.file_name) and kb_file.description:
            extracted_text = f"""
            Image file: {kb_file.file_name}

            Description:
            {kb_file.description}
            """
        else:
            return {
                "chunks_total": 0,
                "chunks_inserted": 0,
                "chunks_failed": 0,
                "message": "Empty text provided",
            }


    chunks = split_into_chunks(extracted_text)

    inserted = 0
    failed = 0

    for idx, chunk_text in enumerate(chunks, start=1):
        try:
            embedding = await generate_embedding(chunk_text)

            if embedding is None:
                failed += 1
                print(f"⚠️ Chunk {idx}: embedding failed")
                continue

            db.add(
                KnowledgeChunk(
                    id=uuid.uuid4(),
                    knowledge_file_id=knowledge_file_id,
                    college_id=college_id,
                    chunk_text=chunk_text,
                    embedding=embedding,
                    source_file=filename,
                    page_number=page_number,
                )
            )

            inserted += 1

        except Exception as e:
            failed += 1
            print(f"❌ Chunk {idx} ingestion failed:", repr(e))
            traceback.print_exc()

    db.commit()

    return {
        "chunks_total": len(chunks),
        "chunks_inserted": inserted,
        "chunks_failed": failed,
        "file_id": str(knowledge_file_id),
    }
