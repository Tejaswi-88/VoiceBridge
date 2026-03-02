from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import SessionLocal
from app.models.unanswered_ticket import UnansweredTicket
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# GET ALL TICKETS (ADMIN)
# =========================
@router.get("/")
def list_tickets(
    college_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only admin roles allowed (adjust role_id if needed)
    if current_user.role_id not in [4, 5]:
        raise HTTPException(status_code=403, detail="Not authorized")

    tickets = (
        db.query(UnansweredTicket)
        .filter(UnansweredTicket.college_id == college_id)
        .order_by(UnansweredTicket.created_at.desc())
        .all()
    )

    return tickets


# =========================
# UPDATE TICKET STATUS
# =========================
@router.patch("/{ticket_id}")
def update_ticket_status(
    ticket_id: UUID,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role_id not in [4, 5]:
        raise HTTPException(status_code=403, detail="Not authorized")

    ticket = db.query(UnansweredTicket).filter(UnansweredTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = status
    db.commit()
    db.refresh(ticket)

    return {"message": "Ticket updated", "status": ticket.status}


# =========================
# DELETE TICKET (ADMIN)
# =========================
@router.delete("/{ticket_id}")
def delete_ticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role_id not in [4, 5]:
        raise HTTPException(status_code=403, detail="Not authorized")

    ticket = db.query(UnansweredTicket).filter(UnansweredTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.delete(ticket)
    db.commit()

    return {"message": "Ticket deleted"}
