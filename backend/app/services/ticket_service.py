from sqlalchemy.orm import Session
from app.models.unanswered_ticket import UnansweredTicket


def is_unanswered_response(reply: str, confidence: float, sources: list) -> bool:
    """
    Decide whether a response counts as 'unanswered'.
    """

    if confidence <= 0.3:
        return True

    if not sources:
        return True

    r = reply.lower()

    trigger_phrases = [
        "i don't have information",
        "i do not have information",
        "no information available",
        "could not find",
        "not available",
        "not present in the knowledge base"
    ]

    return any(p in r for p in trigger_phrases)


def create_unanswered_ticket(
    db: Session,
    *,
    college_id,
    category,
    user_language,
    original_query,
    normalized_query,
    bot_reply
):
    """
    Store unanswered query as a ticket.
    Must NEVER break chat.
    """
    try:
        ticket = UnansweredTicket(
            college_id=college_id,
            category=category,
            user_language=user_language,
            original_query=original_query,
            normalized_query=normalized_query,
            bot_reply=bot_reply
        )

        db.add(ticket)
        db.commit()

    except Exception as e:
        db.rollback()
        print("⚠️ Ticket creation failed:", e)
