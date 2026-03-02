from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.session import Base
from sqlalchemy import Index

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    name = Column(String, nullable=False)
    category = Column(String, nullable=False)

    college_email = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    personal_email = Column(String)

    designation = Column(String)
    office_location = Column(String)
    availability = Column(String)

    # New field: primary contact flag
    is_primary = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=text("NOW()"))
    updated_at = Column(TIMESTAMP, server_default=text("NOW()"), onupdate=text("NOW()"))

    __table_args__ = (
        Index(
            "unique_primary_contact_per_college",
            "college_id",
            unique=True,
            postgresql_where=text("is_primary = TRUE"),
        ),
    )

