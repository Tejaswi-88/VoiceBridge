# backend/app/services/chat_context_builder.py

from sqlalchemy.orm import Session
from app.services.student_query_service import handle_student_query


async def build_chat_context(
    *,
    db: Session,
    user_message: str,  # ⚠️ ALWAYS ENGLISH FROM PHASE 2 ONWARDS
    college_id,
    role_id,
    rag_runner,
    memory
):
    # 1️⃣ Try DB first (ENGLISH)
    db_answer = handle_student_query(db, user_message)
    if db_answer:
        return {
            "reply": db_answer,
            "confidence": 0.95,
            "sources": ["Database"]
        }

    # 2️⃣ Fallback to RAG (ENGLISH)
    return await rag_runner(
        db=db,
        user_query=user_message,
        college_id=college_id,
        role_id=role_id,
        memory=memory
    )
