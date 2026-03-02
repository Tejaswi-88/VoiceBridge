from sqlalchemy.orm import Session
from app.models.faq import FAQ


def get_relevant_faqs(
    db: Session,
    query: str,
    college_id,
    limit: int = 5
):
    q = query.lower()

    faqs = (
        db.query(FAQ)
        .filter(
            FAQ.college_id == college_id,
            FAQ.is_active == True,
            FAQ.is_approved == True,
        )
        .all()
    )

    matched = []
    for faq in faqs:
        text = f"{faq.question} {faq.answer}".lower()
        if any(word in text for word in q.split()):
            matched.append(faq)

    return matched[:limit]
