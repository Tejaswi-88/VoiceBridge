from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import UserMeResponse, UserMeUpdate, PasswordUpdate
from app.utils.security import (
    decode_access_token,
    verify_password,
    get_password_hash,
)

router = APIRouter(prefix="/users", tags=["Users"])

ADMIN_VOLUNTEER = {4, 5}


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
        raise HTTPException(status_code=401, detail="Missing token")
    return authorization.split(" ")[1]


def get_current_user(token: str, db: Session) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def get_current_user_ws(token: str, db: Session):
    payload = decode_access_token(token)
    if not payload:
        return None

    return db.query(User).filter(User.id == payload["sub"]).first()


# ---------------- ME ----------------


@router.get("/me", response_model=UserMeResponse)
def get_me(
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = (
        db.query(User)
        .options(
            joinedload(User.role),
            joinedload(User.college),
        )
        .filter(User.id == payload["sub"])
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user



@router.put("/me", response_model=UserMeResponse)
def update_me(
    payload: UserMeUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    update_data = payload.dict(exclude_unset=True)

    # Only Admin & Volunteer can edit identity fields
    if user.role_id not in ADMIN_VOLUNTEER:
        update_data.pop("email", None)
        update_data.pop("username", None)

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.put("/me/password")
def update_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    token: str = Depends(get_token),
):
    user = get_current_user(token, db)

    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Incorrect current password"
        )

    user.password_hash = get_password_hash(payload.new_password)
    db.commit()

    return {"message": "Password updated successfully"}
