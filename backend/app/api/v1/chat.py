from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import Body

from app.db.session import SessionLocal
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage
from app.schemas.chat import ConversationOut, MessageCreate, MessageOut

from app.services.chat_engine import run_chat_engine
from app.services.embedding_service import generate_embedding

from app.api.v1.users import get_current_user, get_token
from app.models.user import User
from app.models.college import College

router = APIRouter(prefix="/chat", tags=["Chat"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= CREATE CONVERSATION =================
@router.post("/conversation", response_model=ConversationOut)
def create_conversation(
    college_id: UUID,
    token: str = Depends(get_token),
    db: Session = Depends(get_db)
):
    user: User = get_current_user(token, db)

    convo = ChatConversation(
        user_id=user.id,
        college_id=college_id,
        role_id=user.role_id,
        is_anonymous=False
    )

    db.add(convo)
    db.commit()
    db.refresh(convo)

    return convo


# ================= SEND MESSAGE =================
@router.post("/{conversation_id}/message", response_model=MessageOut)
async def send_message(
    conversation_id: UUID,
    payload: MessageCreate = Body(...),  # ✅ EXPLICIT BODY
    token: str = Depends(get_token),
    db: Session = Depends(get_db)
):
    user: User = get_current_user(token, db)

    convo = db.query(ChatConversation).filter_by(id=conversation_id).first()
    if not convo:
        raise HTTPException(404, "Conversation not found")

    college = db.query(College).filter_by(id=convo.college_id).first()
    college_name = college.name if college else "the college"

    # Load history
    history = (
        db.query(ChatMessage)
        .filter_by(conversation_id=conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conversation_id,
        sender="user",
        message=payload.message,
        embedding=await generate_embedding(payload.message)
    )

    db.add(user_msg)
    db.commit()

    # Run AI Engine
    ai_result = await run_chat_engine(
        user_message=payload.message,
        history=history,
        role_id=user.role_id,
        college_id=convo.college_id,
        db=db,
        convo=convo
    )


    # Save bot message
    bot_msg = ChatMessage(
        conversation_id=conversation_id,
        sender="bot",
        message=ai_result["reply"],
        language=ai_result["language"],
        confidence=ai_result["confidence"],
        response_time_ms=ai_result["response_time_ms"],
        embedding=await generate_embedding(ai_result["reply"])
    )


    db.add(bot_msg)

    # Update conversation metadata
    convo.language = ai_result["language"]
    convo.last_message_at = bot_msg.created_at

    db.commit()
    db.refresh(bot_msg)

    return bot_msg


# ================= LIST MESSAGES =================
@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(conversation_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(ChatMessage)
        .filter_by(conversation_id=conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
