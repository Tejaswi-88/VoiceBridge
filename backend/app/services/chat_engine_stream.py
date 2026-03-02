from app.models.chat_message import ChatMessage
from app.models.chat_conversation import ChatConversation
from app.services.language_service import detect_language
from app.services.tone_service import build_tone_prompt
from app.services.rag_service import run_rag_pipeline
from app.services.streaming_ai import stream_ai_response


async def run_chat_engine_stream(db, conversation_id, user, user_message):

    convo = db.query(ChatConversation).filter_by(id=conversation_id).first()

    if not convo:
        yield "⚠️ Conversation not found"
        return

    if convo.user_id and convo.user_id != user.id:
        yield "⚠️ Unauthorized conversation"
        return



    history = (
        db.query(ChatMessage)
        .filter_by(conversation_id=conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    # lang = detect_language(user_message)
    # tone = build_tone_prompt(user.role_id, lang)

    lang = detect_language(user_message)

    rag = await run_rag_pipeline(
        db=db,
        user_query=user_message,
        college_id=convo.college_id,
        role_id=user.role_id,
        memory=[
            {"role": "user" if m.sender == "user" else "assistant", "content": m.message}
            for m in history[-10:]
        ]
    )

    system_prompt = system_prompt = f"""
You are VoiceBridge AI.

STRICT RULES:
- Answer ONLY using college knowledge
- If missing info, say so honestly
- ALWAYS respond in English

Knowledge Context:
{rag.get("sources")}
"""


    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    # Save user message
    db.add(ChatMessage(
        conversation_id=conversation_id,
        sender="user",
        message=user_message
    ))
    db.commit()

    bot_text = ""

    async for token in stream_ai_response(messages):
        bot_text += token
        yield token

    # Save streamed bot message
    db.add(ChatMessage(
        conversation_id=conversation_id,
        sender="bot",
        message=bot_text,
        language=lang
    ))

    convo.language = lang
    db.commit()
