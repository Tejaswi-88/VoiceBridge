from sqlalchemy.orm import Session
from app.utils.security import decode_access_token
from app.models.user import User


def get_current_user_ws(token: str, db: Session):
    payload = decode_access_token(token)

    if not payload:
        return None

    user_id = payload.get("sub") or payload.get("user_id")

    if not user_id:
        return None

    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.is_active:
        return None

    return user
