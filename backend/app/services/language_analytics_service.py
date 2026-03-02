from sqlalchemy.orm import Session
from app.models.language_usage import LanguageUsage


def increment_language_usage(
    db: Session,
    *,
    college_id,
    language_code: str
):
    """
    Increment language usage count.
    Must NEVER break chat flow.
    """
    try:
        record = (
            db.query(LanguageUsage)
            .filter_by(
                college_id=college_id,
                language_code=language_code
            )
            .first()
        )

        if record:
            record.usage_count += 1
        else:
            record = LanguageUsage(
                college_id=college_id,
                language_code=language_code,
                usage_count=1
            )
            db.add(record)

        db.commit()

    except Exception as e:
        db.rollback()
        # Fail silently — analytics must not affect chat
        print("⚠️ Language usage increment failed:", e)
