from sqlalchemy.orm import Session
from app.models.category_usage import CategoryUsage


def increment_category_usage(
    db: Session,
    *,
    college_id,
    category: str
):
    """
    Increment category usage.
    Must never affect chat flow.
    """
    try:
        record = (
            db.query(CategoryUsage)
            .filter_by(
                college_id=college_id,
                category=category
            )
            .first()
        )

        if record:
            record.usage_count += 1
        else:
            record = CategoryUsage(
                college_id=college_id,
                category=category,
                usage_count=1
            )
            db.add(record)

        db.commit()

    except Exception as e:
        db.rollback()
        print("⚠️ Category usage increment failed:", e)
