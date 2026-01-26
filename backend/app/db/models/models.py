"""SQLAlchemy models for VVE Tooling.

Based on backlog epics and features:
- EPIC-001: Financieel overzicht beheren
- EPIC-002: Splitsingen beheren
- EPIC-005: Veiligheid & compliance
- EPIC-009: Multi-user toegang & rollen
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base


class TransactionCategory(str, Enum):
    """Transaction categories for VVE financial management (FEAT-001)."""

    CONTRIBUTION = "contribution"  # Contributie
    MAINTENANCE = "maintenance"  # Onderhoud
    ENERGY = "energy"  # Energie
    INSURANCE = "insurance"  # Verzekering
    ADMINISTRATIVE = "administrative"  # Administratief
    RESERVE = "reserve"  # Reserve
    OTHER = "other"  # Overig


class UserRole(str, Enum):
    """User roles for RBAC (FEAT-010)."""

    BEWONER = "bewoner"
    PENNINGMEESTER = "penningmeester"
    BESTUURSLID = "bestuurslid"
    BEHEERDER = "beheerder"


# ============================================================================
# VVE (Tenant) Model
# ============================================================================


class VVE(Base):
    """VVE (Vereniging Van Eigenaren) - the main tenant entity.

    Implements ADR-003: Multi-tenancy with data isolation.
    """

    __tablename__ = "vves"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(String(500))
    postal_code: Mapped[str | None] = mapped_column(String(10))
    city: Mapped[str | None] = mapped_column(String(100))
    kvk_number: Mapped[str | None] = mapped_column(String(20), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    members: Mapped[list["VVEMember"]] = relationship(
        "VVEMember", back_populates="vve", cascade="all, delete-orphan"
    )
    units: Mapped[list["Unit"]] = relationship(
        "Unit", back_populates="vve", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="vve", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="vve", cascade="all, delete-orphan"
    )


# ============================================================================
# User and Authentication Models
# ============================================================================


class User(Base):
    """User account model (FEAT-010: Authentication & RBAC)."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    cognito_sub: Mapped[str | None] = mapped_column(
        String(100), unique=True
    )  # AWS Cognito ID
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    memberships: Mapped[list["VVEMember"]] = relationship(
        "VVEMember", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_users_email", "email"),)


class VVEMember(Base):
    """VVE membership linking users to VVEs with roles.

    Implements EPIC-009: Multi-user toegang & rollen.
    A user can be a member of multiple VVEs with different roles.
    """

    __tablename__ = "vve_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), default=UserRole.BEWONER, nullable=False
    )
    unit_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("units.id", ondelete="SET NULL")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="memberships")
    vve: Mapped["VVE"] = relationship("VVE", back_populates="members")
    unit: Mapped["Unit | None"] = relationship("Unit", back_populates="owners")

    __table_args__ = (
        UniqueConstraint("user_id", "vve_id", name="uq_user_vve"),
        Index("ix_vve_members_vve_id", "vve_id"),
    )


# ============================================================================
# Property/Unit Models (EPIC-002: Splitsingen beheren)
# ============================================================================


class Unit(Base):
    """A unit (apartment/property) within a VVE.

    Implements FEAT-003: Splitsingssleutel configuratie.
    """

    __tablename__ = "units"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    unit_number: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    floor: Mapped[int | None] = mapped_column()
    area_sqm: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    # Splitsingsaandeel (STORY-002: Splitsingssleutel valideren)
    share_percentage: Mapped[Decimal] = mapped_column(
        Numeric(8, 5), nullable=False, default=Decimal("0.00000")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    vve: Mapped["VVE"] = relationship("VVE", back_populates="units")
    owners: Mapped[list["VVEMember"]] = relationship("VVEMember", back_populates="unit")
    contributions: Mapped[list["Contribution"]] = relationship(
        "Contribution", back_populates="unit", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("vve_id", "unit_number", name="uq_vve_unit_number"),
        Index("ix_units_vve_id", "vve_id"),
    )


# ============================================================================
# Financial Models (EPIC-001: Financieel overzicht beheren)
# ============================================================================


class Transaction(Base):
    """Financial transaction record (FEAT-001: Transactiebeheer).

    Implements STORY-001: Transactie toevoegen.
    """

    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    category: Mapped[TransactionCategory] = mapped_column(
        SQLEnum(TransactionCategory), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text)
    transaction_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    reserve_fund_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("reserve_funds.id", ondelete="SET NULL")
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    vve: Mapped["VVE"] = relationship("VVE", back_populates="transactions")
    reserve_fund: Mapped["ReserveFund | None"] = relationship(
        "ReserveFund", back_populates="transactions"
    )

    __table_args__ = (
        Index("ix_transactions_vve_id", "vve_id"),
        Index("ix_transactions_date", "transaction_date"),
    )


class ReserveFund(Base):
    """Reserve fund for VVE (FEAT-002: Reserves & saldo-overzicht)."""

    __tablename__ = "reserve_funds"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    target_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    current_balance: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="reserve_fund"
    )

    __table_args__ = (Index("ix_reserve_funds_vve_id", "vve_id"),)


class Contribution(Base):
    """Contribution records per unit (FEAT-004: Contributieberekening).

    Tracks what each unit should pay and has paid.
    Implements STORY-003: Bewoner ziet eigen status.
    """

    __tablename__ = "contributions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    year: Mapped[int] = mapped_column(nullable=False)
    month: Mapped[int] = mapped_column(nullable=False)
    amount_due: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    amount_paid: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00")
    )
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, paid, overdue
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    unit: Mapped["Unit"] = relationship("Unit", back_populates="contributions")

    __table_args__ = (
        UniqueConstraint("unit_id", "year", "month", name="uq_unit_contribution_period"),
        Index("ix_contributions_vve_id", "vve_id"),
        Index("ix_contributions_unit_id", "unit_id"),
    )


# ============================================================================
# Document Models (EPIC-006: Documenten delen)
# ============================================================================


class Document(Base):
    """Document storage for VVE (FEAT-011: Documentbeheer).

    Implements STORY-004: Bestuur uploadt document.
    Storage limits per D-004.
    """

    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # MIME type
    file_size_bytes: Mapped[int] = mapped_column(nullable=False)
    s3_key: Mapped[str] = mapped_column(String(500), nullable=False)  # S3 object key
    category: Mapped[str] = mapped_column(String(50), default="general")
    is_public: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # Visible to all members
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    vve: Mapped["VVE"] = relationship("VVE", back_populates="documents")

    __table_args__ = (Index("ix_documents_vve_id", "vve_id"),)


# ============================================================================
# Audit Log (FEAT-015: Audit logging, D-003)
# ============================================================================


class AuditLog(Base):
    """Audit log for tracking important actions (FEAT-015).

    Implements D-003: 2-level retention (7 year financial, 1 year other).
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="SET NULL")
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100))
    old_values: Mapped[str | None] = mapped_column(Text)  # JSON
    new_values: Mapped[str | None] = mapped_column(Text)  # JSON
    ip_address: Mapped[str | None] = mapped_column(String(50))
    user_agent: Mapped[str | None] = mapped_column(String(500))
    is_financial: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # For retention policy
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_audit_logs_vve_id", "vve_id"),
        Index("ix_audit_logs_user_id", "user_id"),
        Index("ix_audit_logs_created_at", "created_at"),
    )
