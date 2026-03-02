from sqlalchemy.orm import Session
from app.models.contact import Contact


def get_relevant_contacts(
    db: Session,
    query: str,
    college_id,
    limit: int = 5
):
    q = query.lower()

    contacts = (
        db.query(Contact)
        .filter(
            Contact.college_id == college_id,
            Contact.is_active == True,
        )
        .all()
    )

    matched = []
    for c in contacts:
        blob = " ".join([
            c.name or "",
            c.designation or "",
            c.category or "",
            c.college_email or "",
            c.phone_number or "",
        ]).lower()

        if any(word in blob for word in q.split()):
            matched.append(c)

    return matched[:limit]
