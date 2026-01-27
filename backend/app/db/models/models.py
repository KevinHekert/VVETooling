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
    CheckConstraint,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
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


class Budget(Base):
    """Budget for VVE (FEAT-006: Begroting).
    
    Implements STORY-006: Begroting opstellen en exporteren.
    """
    
    __tablename__ = "budgets"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    year: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft, approved, archived
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
    items: Mapped[list["BudgetItem"]] = relationship(
        "BudgetItem", back_populates="budget", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint("vve_id", "year", name="uq_vve_budget_year"),
        Index("ix_budgets_vve_id", "vve_id"),
    )


class BudgetItem(Base):
    """Individual budget item (FEAT-006: Begroting).
    
    Implements STORY-006: Begroting opstellen en exporteren.
    """
    
    __tablename__ = "budget_items"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    budget_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("budgets.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[TransactionCategory] = mapped_column(
        SQLEnum(TransactionCategory), nullable=False
    )
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    planned_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    
    # Relationships
    budget: Mapped["Budget"] = relationship("Budget", back_populates="items")
    
    __table_args__ = (Index("ix_budget_items_budget_id", "budget_id"),)


# ============================================================================
# Document Models (EPIC-006: Documenten delen)
# ============================================================================


class Document(Base):
    """Document storage for VVE (FEAT-011: Documentbeheer).

    Implements STORY-004: Bestuur uploadt document.
    Implements STORY-018: Document versiebeheer en rol-specifiek delen.
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
    # Version control (STORY-018)
    version: Mapped[int] = mapped_column(default=1)
    parent_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    is_current_version: Mapped[bool] = mapped_column(Boolean, default=True)
    # Role-based visibility (STORY-018)
    visible_to_roles: Mapped[str] = mapped_column(
        String(100), default="bewoner,penningmeester,bestuurslid,beheerder"
    )
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    vve: Mapped["VVE"] = relationship("VVE", back_populates="documents")
    versions: Mapped[list["Document"]] = relationship(
        "Document",
        backref="parent_document",
        remote_side=[id],
        foreign_keys=[parent_document_id],
    )

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


# ============================================================================
# Ticket Models (EPIC-010: Serviceverzoeken & leveranciers)
# ============================================================================


class TicketStatus(str, Enum):
    """Ticket status values (FEAT-016)."""

    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_PROGRESS = "in_progress"
    AWAITING_INFO = "awaiting_info"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketCategory(str, Enum):
    """Ticket category values (FEAT-016)."""

    MAINTENANCE = "maintenance"
    NOISE = "noise"
    SAFETY = "safety"
    CLEANING = "cleaning"
    FACILITIES = "facilities"
    OTHER = "other"


class TicketPriority(str, Enum):
    """Ticket priority values (FEAT-016)."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class SupplierStatus(str, Enum):
    """Supplier collaboration status for tickets (STORY-044).
    
    Tracks the status of a supplier's involvement in resolving a ticket.
    """

    SCHEDULED = "scheduled"  # Ingepland
    IN_PROGRESS = "in_progress"  # Bezig
    COMPLETED = "completed"  # Afgerond


class Supplier(Base):
    """Supplier/vendor for maintenance and service work (FEAT-017, STORY-044).

    Implements STORY-035: Leveranciersprofiel beheren.
    Implements STORY-044: Ticket supplier collaboration status.
    """

    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(Text)  # STORY-060: Added address field
    specialty: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tickets: Mapped[list["Ticket"]] = relationship(
        "Ticket", back_populates="supplier"
    )

    __table_args__ = (
        Index("ix_suppliers_vve_id", "vve_id"),
        Index("ix_suppliers_name", "name"),
    )


class SupplierFollowUpChannel(str, Enum):
    """Communication channel for supplier follow-ups (STORY-036)."""

    PHONE = "phone"  # Telefoon
    EMAIL = "email"  # E-mail
    IN_PERSON = "in_person"  # Persoonlijk
    OTHER = "other"  # Anders


class SupplierFollowUp(Base):
    """Follow-up action logged for supplier communication (STORY-036).

    Implements STORY-036: Leveranciers opvolgacties loggen.
    Tracks all communication with suppliers per ticket.
    """

    __tablename__ = "supplier_follow_ups"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False
    )
    channel: Mapped[SupplierFollowUpChannel] = mapped_column(
        SQLEnum(SupplierFollowUpChannel), nullable=False
    )
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    contact_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_supplier_follow_ups_ticket_id", "ticket_id"),
        Index("ix_supplier_follow_ups_supplier_id", "supplier_id"),
    )


class SupplierEvaluation(Base):
    """Supplier evaluation/review after project completion (STORY-061).

    Implements STORY-061: Leverancier evaluatie toevoegen.
    Allows board members to rate suppliers with stars (1-5) and feedback.
    """

    __tablename__ = "supplier_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False
    )
    # Optional link to specific contract/project
    contract_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="SET NULL")
    )
    # Rating (1-5 stars)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    # Free text feedback
    feedback: Mapped[str | None] = mapped_column(Text)
    # Optional: anonymous evaluation
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    # Audit fields
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_supplier_evaluations_vve_id", "vve_id"),
        Index("ix_supplier_evaluations_supplier_id", "supplier_id"),
        Index("ix_supplier_evaluations_contract_id", "contract_id"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )


class Ticket(Base):
    """Ticket for resident complaints and service requests (FEAT-016).

    Implements STORY-029: Bewoner ticket wizard en tijdlijn.
    """

    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False
    )
    submitted_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[TicketCategory] = mapped_column(
        SQLEnum(TicketCategory), nullable=False
    )
    location: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[TicketStatus] = mapped_column(
        SQLEnum(TicketStatus), default=TicketStatus.SUBMITTED, nullable=False
    )
    priority: Mapped[TicketPriority] = mapped_column(
        SQLEnum(TicketPriority), default=TicketPriority.MEDIUM, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # STORY-044: Supplier collaboration status
    supplier_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="SET NULL")
    )
    supplier_status: Mapped[SupplierStatus | None] = mapped_column(
        SQLEnum(SupplierStatus)
    )
    supplier_status_note: Mapped[str | None] = mapped_column(String(500))
    supplier_status_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    supplier_status_updated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    # STORY-038: SLA and response time tracking
    sla_due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sla_response_hours: Mapped[int | None] = mapped_column()  # Expected response time in hours
    sla_breached: Mapped[bool] = mapped_column(Boolean, default=False)
    sla_breached_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    attachments: Mapped[list["TicketAttachment"]] = relationship(
        "TicketAttachment", back_populates="ticket", cascade="all, delete-orphan"
    )
    timeline: Mapped[list["TicketTimelineEntry"]] = relationship(
        "TicketTimelineEntry", back_populates="ticket", cascade="all, delete-orphan"
    )
    comments: Mapped[list["TicketComment"]] = relationship(
        "TicketComment", back_populates="ticket", cascade="all, delete-orphan"
    )
    # STORY-044: Supplier relationship
    supplier: Mapped["Supplier | None"] = relationship(
        "Supplier", back_populates="tickets"
    )

    __table_args__ = (
        Index("ix_tickets_vve_id", "vve_id"),
        Index("ix_tickets_unit_id", "unit_id"),
        Index("ix_tickets_submitted_by_id", "submitted_by_id"),
        Index("ix_tickets_status", "status"),
        Index("ix_tickets_supplier_id", "supplier_id"),
    )


class TicketAttachmentStatus(str, Enum):
    """Attachment status values (STORY-030)."""

    PENDING = "pending"
    TIMELY = "timely"
    LATE = "late"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class TicketAttachment(Base):
    """Attachment for a ticket (STORY-030).

    Implements STORY-030: Ticket bewijsstukken (bonnen en facturen).
    Maximum file size: 10MB per D-004.
    """

    __tablename__ = "ticket_attachments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(nullable=False)
    s3_key: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    # STORY-030: Status tracking for attachments
    status: Mapped[TicketAttachmentStatus] = mapped_column(
        SQLEnum(TicketAttachmentStatus), default=TicketAttachmentStatus.PENDING, nullable=False
    )
    is_timely: Mapped[bool] = mapped_column(Boolean, default=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(500))
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="attachments")

    __table_args__ = (Index("ix_ticket_attachments_ticket_id", "ticket_id"),)


class TicketTimelineEntry(Base):
    """Timeline entry for ticket history (STORY-029).

    Implements STORY-029: Bewoner ticket wizard en tijdlijn.
    Tracks status changes, comments, and other events.
    """

    __tablename__ = "ticket_timeline_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    old_value: Mapped[str | None] = mapped_column(String(100))
    new_value: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="timeline")

    __table_args__ = (Index("ix_ticket_timeline_entries_ticket_id", "ticket_id"),)


class TicketComment(Base):
    """Comment on a ticket (STORY-037).

    Implements STORY-037: Ticket communicatie en notities.
    Supports internal comments visible only to staff.
    """

    __tablename__ = "ticket_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # Internal comments only visible to staff
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    # STORY-037: Mark as answered
    is_answered: Mapped[bool] = mapped_column(Boolean, default=False)
    answered_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="comments")

    __table_args__ = (Index("ix_ticket_comments_ticket_id", "ticket_id"),)


# ============================================================================
# Splitsingsakte Version Management (FEAT-019, STORY-041)
# ============================================================================


class SplitsingsakteVersionStatus(str, Enum):
    """Status values for splitsingsakte versions (STORY-041)."""

    DRAFT = "draft"  # Concept
    ACTIVE = "active"  # Actief
    ARCHIVED = "archived"  # Gearchiveerd


class SplitsingsakteVersion(Base):
    """Splitsingsakte version for deed management (FEAT-019, STORY-041).

    Implements STORY-041: Splitsingsakte versies overzicht.
    Tracks different versions of the deed with status and validity dates.
    """

    __tablename__ = "splitsingsakte_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[int] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[SplitsingsakteVersionStatus] = mapped_column(
        SQLEnum(SplitsingsakteVersionStatus), 
        default=SplitsingsakteVersionStatus.DRAFT, 
        nullable=False
    )
    effective_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    archived_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    activated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    activated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        Index("ix_splitsingsakte_versions_vve_id", "vve_id"),
        Index("ix_splitsingsakte_versions_status", "status"),
        Index("ix_splitsingsakte_versions_vve_status", "vve_id", "status"),
        UniqueConstraint("vve_id", "version_number", name="uq_splitsingsakte_version"),
    )


# ============================================================================
# Contract Management (EPIC-013: Contractbeheer, FEAT-026)
# ============================================================================


class ContractType(str, Enum):
    """Contract type categories (STORY-055).
    
    Predefined categories for VVE contracts.
    """

    ENERGIE = "energie"  # Energy contracts
    VERZEKERING = "verzekering"  # Insurance contracts
    ONDERHOUD = "onderhoud"  # Maintenance contracts
    OVERIG = "overig"  # Other contracts


class Contract(Base):
    """Contract for VVE management (EPIC-013, FEAT-026, STORY-055).

    Implements STORY-055: Contract registreren met metadata.
    Stores contract information including supplier, dates, costs, and terms.
    """

    __tablename__ = "contracts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Supplier information
    supplier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    supplier_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="SET NULL")
    )
    # Contract type (energie, verzekering, onderhoud, overig)
    contract_type: Mapped[ContractType] = mapped_column(
        SQLEnum(ContractType), nullable=False
    )
    # Contract details
    description: Mapped[str | None] = mapped_column(Text)
    # Dates
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Notice period in days (opzegtermijn)
    notice_period_days: Mapped[int | None] = mapped_column()
    # Alert configuration (STORY-058)
    alert_days_before: Mapped[int | None] = mapped_column(default=30)  # Days before notice deadline to alert
    # Costs
    costs: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    costs_period: Mapped[str | None] = mapped_column(
        String(50)
    )  # monthly, yearly, one-time
    # Document reference
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    # Audit fields
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        Index("ix_contracts_vve_id", "vve_id"),
        Index("ix_contracts_supplier_id", "supplier_id"),
        Index("ix_contracts_contract_type", "contract_type"),
        Index("ix_contracts_end_date", "end_date"),
    )


# ==============================================================================
# EPIC-015: ALV & Vergaderbeheer
# ==============================================================================

class MeetingType(str, Enum):
    """Type of ALV meeting (STORY-069)."""

    FYSIEK = "fysiek"       # Physical meeting
    ONLINE = "online"       # Online meeting
    HYBRIDE = "hybride"     # Hybrid meeting


class MeetingStatus(str, Enum):
    """Status of an ALV meeting."""

    GEPLAND = "gepland"         # Scheduled
    UITNODIGING_VERZONDEN = "uitnodiging_verzonden"  # Invitations sent
    ACTIEF = "actief"           # In progress
    AFGESLOTEN = "afgesloten"   # Completed
    GEANNULEERD = "geannuleerd" # Cancelled


class Meeting(Base):
    """ALV (Algemene Ledenvergadering) meeting (STORY-069).

    Implements STORY-069: ALV plannen met datum en locatie.
    Implements STORY-070: ALV agenda opstellen.
    """

    __tablename__ = "meetings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Meeting details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    # Date and time
    meeting_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Type and location
    meeting_type: Mapped[MeetingType] = mapped_column(
        SQLEnum(MeetingType), nullable=False, default=MeetingType.FYSIEK
    )
    location_address: Mapped[str | None] = mapped_column(String(500))  # Physical address
    location_online_link: Mapped[str | None] = mapped_column(String(500))  # Video conference URL
    # Status
    status: Mapped[MeetingStatus] = mapped_column(
        SQLEnum(MeetingStatus), nullable=False, default=MeetingStatus.GEPLAND
    )
    # Audit fields
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship to agenda items (STORY-070)
    agenda_items: Mapped[list["MeetingAgendaItem"]] = relationship(
        "MeetingAgendaItem", back_populates="meeting", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_meetings_vve_id", "vve_id"),
        Index("ix_meetings_meeting_date", "meeting_date"),
        Index("ix_meetings_status", "status"),
    )


class MeetingAgendaItem(Base):
    """Agenda item for an ALV meeting (STORY-070).

    Implements STORY-070: ALV agenda opstellen.
    Allows secretaris to create agenda with items, durations, and linked documents.
    """

    __tablename__ = "meeting_agenda_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    # Agenda item details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    # Duration in minutes
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    # Order in agenda (for drag & drop sorting)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Optional link to document
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    # Is this a standard/template item
    is_standard: Mapped[bool] = mapped_column(Boolean, default=False)
    # Audit fields
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="agenda_items")

    __table_args__ = (
        Index("ix_meeting_agenda_items_meeting_id", "meeting_id"),
        Index("ix_meeting_agenda_items_order", "meeting_id", "order_index"),
    )
