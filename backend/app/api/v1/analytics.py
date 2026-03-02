from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy import func
from datetime import datetime, timedelta
from sqlalchemy import cast, Date, extract

from app.db.session import SessionLocal
from app.models.language_usage import LanguageUsage
from app.models.category_usage import CategoryUsage
from app.models.unanswered_ticket import UnansweredTicket
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage
from app.models.knowledge_file import KnowledgeFile

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{college_id}/kpis")
def get_kpis(college_id: UUID, db: Session = Depends(get_db)):
    total_conversations = (
        db.query(ChatConversation)
        .filter(ChatConversation.college_id == college_id)
        .count()
    )

    active_users = (
        db.query(ChatConversation.user_id)
        .filter(ChatConversation.college_id == college_id)
        .distinct()
        .count()
    )

    avg_response_time = (
        db.query(func.avg(ChatMessage.response_time_ms))
        .join(ChatConversation)
        .filter(ChatConversation.college_id == college_id)
        .scalar()
    )

    total_unanswered = (
        db.query(UnansweredTicket)
        .filter(UnansweredTicket.college_id == college_id)
        .count()
    )

    resolution_rate = 0.0
    if total_conversations > 0:
        resolution_rate = round(
            (1 - (total_unanswered / total_conversations)) * 100, 2
        )

    return {
        "total_conversations": total_conversations,
        "active_users": active_users,
        "avg_response_time_ms": round(avg_response_time or 0, 2),
        "resolution_rate": resolution_rate,
    }


@router.get("/{college_id}/languages")
def get_language_distribution(college_id: UUID, db: Session = Depends(get_db)):
    rows = (
        db.query(
            LanguageUsage.language_code,
            LanguageUsage.usage_count
        )
        .filter(LanguageUsage.college_id == college_id)
        .order_by(LanguageUsage.usage_count.desc())
        .all()
    )

    total = sum(r.usage_count for r in rows) or 1

    return [
        {
            "language": r.language_code,
            "count": r.usage_count,
            "percentage": round((r.usage_count / total) * 100, 2)
        }
        for r in rows
    ]


@router.get("/{college_id}/categories")
def get_category_distribution(college_id: UUID, db: Session = Depends(get_db)):
    rows = (
        db.query(
            CategoryUsage.category,
            CategoryUsage.usage_count
        )
        .filter(CategoryUsage.college_id == college_id)
        .order_by(CategoryUsage.usage_count.desc())
        .all()
    )

    total = sum(r.usage_count for r in rows) or 1

    return [
        {
            "category": r.category,
            "count": r.usage_count,
            "percentage": round((r.usage_count / total) * 100, 2)
        }
        for r in rows
    ]


@router.get("/{college_id}/unanswered")
def get_unanswered_summary(college_id: UUID, db: Session = Depends(get_db)):
    rows = (
        db.query(
            UnansweredTicket.category,
            func.count(UnansweredTicket.id).label("count")
        )
        .filter(UnansweredTicket.college_id == college_id)
        .group_by(UnansweredTicket.category)
        .all()
    )

    return [
        {
            "category": r.category,
            "count": r.count
        }
        for r in rows
    ]

@router.get("/{college_id}/kb/failed-files")
def get_failed_kb_files(college_id: UUID, db: Session = Depends(get_db)):
    rows = (
        db.query(KnowledgeFile)
        .filter(
            KnowledgeFile.college_id == college_id,
            KnowledgeFile.is_processed == False
        )
        .order_by(KnowledgeFile.uploaded_at.desc())
        .all()
    )

    return [
        {
            "id": str(f.id),
            "file_name": f.file_name,
            "file_type": f.file_type,
            "uploaded_at": f.uploaded_at
        }
        for f in rows
    ]

@router.get("/{college_id}/kb/summary")
def get_kb_summary(college_id: UUID, db: Session = Depends(get_db)):
    total_files = (
        db.query(KnowledgeFile)
        .filter(KnowledgeFile.college_id == college_id)
        .count()
    )

    failed_files = (
        db.query(KnowledgeFile)
        .filter(
            KnowledgeFile.college_id == college_id,
            KnowledgeFile.is_processed == False
        )
        .count()
    )

    file_types = (
        db.query(
            KnowledgeFile.file_type.label("type"),
            func.count(KnowledgeFile.id).label("count")
        )
        .filter(KnowledgeFile.college_id == college_id)
        .group_by(KnowledgeFile.file_type)
        .all()
    )

    file_categories = (
        db.query(
            UnansweredTicket.category,
            func.count(UnansweredTicket.id).label("count")
        )
        .filter(UnansweredTicket.college_id == college_id)
        .group_by(UnansweredTicket.category)
        .all()
    )

    return {
        "total_files": total_files,
        "failed_files": failed_files,
        "file_types": [
            {"type": r.type, "count": r.count}
            for r in file_types
        ],
        "file_categories": [
            {"category": r.category, "count": r.count}
            for r in file_categories
        ]
    }


@router.get("/{college_id}/response-times")
def get_response_time_trend(college_id: UUID, db: Session = Depends(get_db)):
    """
    Returns last 7 days average response time (ms) grouped by date.
    """

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    rows = (
        db.query(
            cast(ChatMessage.created_at, Date).label("date"),
            func.avg(ChatMessage.response_time_ms).label("avg_response_time"),
            func.count(ChatMessage.id).label("message_count"),
        )
        .join(ChatConversation)
        .filter(
            ChatConversation.college_id == college_id,
            ChatMessage.response_time_ms.isnot(None),
            ChatMessage.created_at >= seven_days_ago,
        )
        .group_by(cast(ChatMessage.created_at, Date))
        .order_by(cast(ChatMessage.created_at, Date))
        .all()
    )

    return [
        {
            "date": str(r.date),
            "avg_response_time_ms": round(r.avg_response_time or 0, 2),
            "message_count": r.message_count,
        }
        for r in rows
    ]

@router.get("/{college_id}/activity-patterns")
def get_activity_patterns(college_id: UUID, db: Session = Depends(get_db)):
    """
    Returns message distribution by hour (last 7 days).
    """

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    rows = (
        db.query(
            extract("hour", ChatMessage.created_at).label("hour"),
            func.count(ChatMessage.id).label("message_count"),
        )
        .join(ChatConversation)
        .filter(
            ChatConversation.college_id == college_id,
            ChatMessage.created_at >= seven_days_ago,
        )
        .group_by("hour")
        .order_by("hour")
        .all()
    )

    return [
        {
            "hour": int(r.hour),
            "message_count": r.message_count,
        }
        for r in rows
    ]