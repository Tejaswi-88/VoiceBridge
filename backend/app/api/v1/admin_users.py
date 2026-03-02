from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, admin_only
from app.models.user import User
from app.schemas.admin_user import (
    AdminUserCreate,
    AdminUserUpdate,
    AdminUserResponse,
)
from app.utils.security import get_password_hash

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

# ================= LIST USERS =================

@router.get("", response_model=list[AdminUserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    return (
        db.query(User)
        .options(joinedload(User.role), joinedload(User.college))
        .all()
    )

# ================= CREATE USER =================

@router.post("", response_model=AdminUserResponse)
def create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    exists = (
        db.query(User)
        .filter((User.username == payload.username) | (User.email == payload.email))
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        first_name=payload.first_name,
        middle_name=payload.middle_name,
        last_name=payload.last_name,
        gender=payload.gender,
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role_id=payload.role_id,
        college_id=payload.college_id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # ⚠️ Return password ONCE
    user.temp_password = payload.password
    return user

# ================= UPDATE USER =================

@router.put("/{user_id}", response_model=AdminUserResponse)
def update_user(
    user_id: str,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(user, k, v)

    db.commit()
    db.refresh(user)
    return user

# ================= DELETE (SOFT) =================

@router.delete("/{user_id}")
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()

    return {"message": "User deactivated"}
