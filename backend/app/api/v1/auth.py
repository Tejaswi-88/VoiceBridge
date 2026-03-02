from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.college import College
from app.models.role import Role
from app.utils.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest
from app.schemas.auth import LoginRequest
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

ALLOWED_PUBLIC_ROLES = {1, 2}  # STUDENT, FAMILY

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):

    # 1️⃣ Username uniqueness
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    # 2️⃣ Email uniqueness
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # 3️⃣ Role allowed for public signup
    if payload.role_id not in ALLOWED_PUBLIC_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role not allowed for public registration"
        )

    # 4️⃣ College validation
    if not db.query(College).filter(College.id == payload.college_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid college"
        )

    # 5️⃣ Role validation
    if not db.query(Role).filter(Role.id == payload.role_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    # 6️⃣ Create user
    user = User(
        id=uuid.uuid4(),
        username=payload.username,
        first_name=payload.first_name,
        middle_name=payload.middle_name,
        last_name=payload.last_name,
        gender=payload.gender,
        email=payload.email,
        password_hash=hash_password(payload.password),
        college_id=payload.college_id,
        role_id=payload.role_id,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": str(user.id)
    }

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        (User.email == payload.identifier) | (User.username == payload.identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role_id,
        "college_id": str(user.college_id)
    })

    return {
        "message": f"Welcome {user.first_name}",
        "access_token": token,
        "role_id": user.role_id,
        "college_id": str(user.college_id)
    }