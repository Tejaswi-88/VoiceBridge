from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID 

from app.db.session import SessionLocal
from app.models.contact import Contact
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.utils.security import decode_access_token

router = APIRouter(prefix="/contacts", tags=["Contacts"])

# Roles allowed to manage contacts (ADMIN, STAFF, FACULTY etc.)
ALLOWED_MANAGEMENT_ROLES = {4}


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
@router.post("/", response_model=ContactResponse)
def create_contact(
    payload: ContactCreate,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    if user.role_id not in ALLOWED_MANAGEMENT_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed to create contacts")
    
    # If marking as primary, unset existing primary
    if payload.is_primary:
        db.query(Contact).filter(
            Contact.college_id == payload.college_id,
            Contact.is_primary == True
        ).update({"is_primary": False})

    contact = Contact(
        college_id=payload.college_id,
        created_by=user.id,
        name=payload.name,
        category=payload.category,
        college_email=payload.college_email,
        phone_number=payload.phone_number,
        personal_email=payload.personal_email,
        designation=payload.designation,
        office_location=payload.office_location,
        availability=payload.availability,
        is_primary=payload.is_primary,
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


# GET
@router.get("/{college_id}", response_model=List[ContactResponse])
def get_contacts(college_id: str, db: Session = Depends(get_db)):
    return db.query(Contact).filter(
        Contact.college_id == college_id,
        Contact.is_active == True
    ).all()

# UPDATE
# UPDATE
@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: str,
    payload: ContactUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    # ✅ ADMIN ONLY
    if user.role_id != 4:
        raise HTTPException(
            status_code=403,
            detail="Only admins can update contacts"
        )

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # ✅ OWNERSHIP CHECK
    if contact.college_id != user.college_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update contacts of your own college"
        )

    # 🔒 CRITICAL: BLOCK PRIMARY CONTACT EDITING
    if contact.is_primary:
        raise HTTPException(
            status_code=403,
            detail="Primary contact cannot be edited from Contact Management"
        )

    # ✅ SAFE FIELD UPDATE
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    return contact



@router.put("/{contact_id}/set-primary")
def set_primary_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    # Admin only
    if user.role_id != 4:
        raise HTTPException(status_code=403, detail="Admin only")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # College ownership check
    if contact.college_id != user.college_id:
        raise HTTPException(status_code=403, detail="Wrong college")

    # Unset existing primary
    db.query(Contact).filter(
        Contact.college_id == contact.college_id,
        Contact.is_primary == True
    ).update({"is_primary": False})

    contact.is_primary = True
    db.commit()

    return {"message": "Primary contact updated successfully"}


# DELETE
@router.delete("/{contact_id}")
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    if user.role_id not in ALLOWED_MANAGEMENT_ROLES:
        raise HTTPException(status_code=403, detail="Not allowed to delete contacts")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    contact.is_active = False
    db.commit()

    return {"message": "Contact deleted successfully"}
