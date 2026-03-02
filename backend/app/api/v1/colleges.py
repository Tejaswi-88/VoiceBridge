from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import SessionLocal
from app.models.college import College
from app.models.user import User
from app.utils.security import decode_access_token
from app.schemas.college import CollegeUpdate

router = APIRouter(prefix="/colleges", tags=["Colleges"])

# Only SUPER ADMIN / COLLEGE ADMIN
ALLOWED_ADMIN_ROLES = {4}


# ---------------- DB ----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AUTH ----------------

def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    return authorization.split(" ")[1]


def get_current_user(token: str, db: Session):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------------- UPDATE COLLEGE ----------------

@router.put("/{college_id}")
def update_college(
    college_id: UUID,
    payload: CollegeUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    # ✅ Role check
    if user.role_id not in ALLOWED_ADMIN_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Only admins can edit college profile"
        )

    college = db.query(College).filter(College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    # ✅ College ownership check
    if user.college_id != college.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own college"
        )

    # ✅ Update only allowed fields
    allowed_fields = {
        "name",
        "abbreviation",
        "institution_type",
        "website_url",
        "street_address",
        "city",
        "state",
        "postal_code",
        "country",
    }

    update_data = payload.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(college, field, value)

    db.commit()
    db.refresh(college)

    # ✅ Frontend-friendly response
    return {
        "id": str(college.id),
        "name": college.name,
        "abbreviation": college.abbreviation,
        "code": college.code,
        "institution_type": college.institution_type,
        "website_url": college.website_url,
        "street_address": college.street_address,
        "city": college.city,
        "state": college.state,
        "postal_code": college.postal_code,
        "country": college.country,
    }


# ---------------- LIST COLLEGES ----------------

@router.get("/")
def list_colleges(db: Session = Depends(get_db)):
    colleges = (
        db.query(College)
        .filter(College.is_active == True)
        .order_by(College.name)
        .all()
    )

    return [
        {
            "id": str(college.id),
            "name": college.name,
            "abbreviation": college.abbreviation,
            "code": college.code,
            "institution_type": college.institution_type,
            "website_url": college.website_url,
            "street_address": college.street_address,
            "city": college.city,
            "state": college.state,
            "postal_code": college.postal_code,
            "country": college.country,
            "is_active": college.is_active,
            "created_at": college.created_at,
        }
        for college in colleges
    ]
