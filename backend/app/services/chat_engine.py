import time

from app.services.language_service import detect_language
from app.services.language_analytics_service import increment_language_usage
from app.services.translation_service import translate_text
from app.services.tone_service import build_tone_prompt
from app.services.rag_service import run_rag_pipeline
from app.services.chat_context_builder import build_chat_context
from app.services.intent_classifier import classify_intent
from app.services.category_analytics_service import increment_category_usage
from app.services.ticket_service import (
    is_unanswered_response,
    create_unanswered_ticket
)




async def run_chat_engine(user_message, history, role_id, college_id, db, convo=None):

    # ===============================
    # 1️⃣ LANGUAGE DETECTION (PER MESSAGE)
    # ===============================
    user_lang = detect_language(user_message)

    # Update conversation language metadata (optional)
    if convo and convo.language != user_lang:
        convo.language = user_lang
        db.commit()

    # ===============================
    # 2️⃣ LANGUAGE ANALYTICS
    # ===============================
    increment_language_usage(
        db,
        college_id=college_id,
        language_code=user_lang
    )

    # ===============================
    # 3️⃣ TRANSLATE USER INPUT → ENGLISH  ✅ NEW
    # ===============================
    normalized_query = translate_text(
        user_message,
        source_lang=user_lang,
        target_lang="en"
    )

    # ===============================
    # 3.5️⃣ CATEGORY CLASSIFICATION (ENGLISH)
    # ===============================
    category = classify_intent(normalized_query)

    increment_category_usage(
        db,
        college_id=college_id,
        category=category
    )


    # ===============================
    # 4️⃣ BUILD MEMORY (KEEP ORIGINAL)
    # ===============================
    memory = [
        {
            "role": "user" if m.sender == "user" else "assistant",
            "content": m.message
        }
        for m in history[-10:]
    ]

    start = time.time()

    # ===============================
    # 5️⃣ CORE CHAT LOGIC (ENGLISH)
    # ===============================
    result = await build_chat_context(
        db=db,
        user_message=normalized_query,   # 👈 ENGLISH
        college_id=college_id,
        role_id=role_id,
        rag_runner=run_rag_pipeline,
        memory=memory
    )

    response_time_ms = int((time.time() - start) * 1000)

    english_reply = result.get("reply", "")

    # ===============================
    # 6️⃣ TRANSLATE RESPONSE → USER LANGUAGE  ✅ NEW
    # ===============================
    final_reply = translate_text(
        english_reply,
        source_lang="en",
        target_lang=user_lang
    )

    # ===============================
    # 7️⃣ UNANSWERED QUERY → TICKET
    # ===============================
    if is_unanswered_response(
        reply=english_reply,
        confidence=result.get("confidence", 0.0),
        sources=result.get("sources", [])
    ):
        create_unanswered_ticket(
            db,
            college_id=college_id,
            category=category,
            user_language=user_lang,
            original_query=user_message,
            normalized_query=normalized_query,
            bot_reply=english_reply
        )


    return {
        "reply": final_reply,
        "language": user_lang,
        "confidence": result.get("confidence", 0.6),
        "response_time_ms": response_time_ms,
        "sources": result.get("sources", []),
    }
