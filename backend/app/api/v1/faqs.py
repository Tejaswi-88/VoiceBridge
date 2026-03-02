from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import SessionLocal
from app.schemas.faq import FAQCreate, FAQResponse
from app.models.faq import FAQ
from app.models.user import User
from app.utils.security import decode_access_token

router = APIRouter(prefix="/faqs", tags=["FAQs"])

ALLOWED_CREATOR_ROLES = {4}   # Faculty, Admin, Volunteer


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.split(" ")[1]


def get_current_user(token: str, db: Session):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# CREATE
@router.post("/", response_model=FAQResponse)
def create_faq(payload: FAQCreate, db: Session = Depends(get_db), token: str = Depends(get_token)):
    user = get_current_user(token, db)

    if user.role_id not in ALLOWED_CREATOR_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed to create FAQs")

    faq = FAQ(
        college_id=payload.college_id,
        created_by=user.id,
        category=payload.category,
        language=payload.language,
        question=payload.question,
        answer=payload.answer,
        is_approved=True, # Admin auto approval
    )

    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


# READ
@router.get("/{college_id}", response_model=List[FAQResponse])
def get_faqs(college_id: UUID, db: Session = Depends(get_db)):
    return db.query(FAQ).filter(
        FAQ.college_id == college_id,
        FAQ.is_active == True,
        FAQ.is_approved == True
    ).all()


# UPDATE
@router.put("/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: UUID,
    payload: FAQCreate,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    faq = db.query(FAQ).filter(FAQ.id == faq_id, FAQ.is_active == True).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    if user.role_id not in ALLOWED_CREATOR_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed to update FAQs")

    faq.category = payload.category
    faq.language = payload.language
    faq.question = payload.question
    faq.answer = payload.answer

    # Re-approval logic
    faq.is_approved = (user.role_id == 4)

    db.commit()
    db.refresh(faq)
    return faq


# DELETE (SOFT DELETE)
@router.delete("/{faq_id}")
def delete_faq(
    faq_id: UUID,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    faq = db.query(FAQ).filter(FAQ.id == faq_id, FAQ.is_active == True).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    if user.role_id not in ALLOWED_CREATOR_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed to delete FAQs")

    faq.is_active = False
    db.commit()

    return {"message": "FAQ deleted successfully"}
