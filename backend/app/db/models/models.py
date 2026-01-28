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


class MeetingRsvpStatus(str, Enum):
    """RSVP status for ALV meetings (STORY-072)."""

    PRESENT = "present"  # Aanwezig
    ABSENT = "absent"  # Afwezig
    WITH_PROXY = "with_proxy"  # Met volmacht


class MeetingRsvp(Base):
    """RSVP response for an ALV meeting (STORY-072).

    Implements STORY-072: RSVP registreren voor ALV.
    Allows owners to confirm attendance for meetings.
    """

    __tablename__ = "meeting_rsvps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # RSVP status
    status: Mapped[MeetingRsvpStatus] = mapped_column(
        SQLEnum(MeetingRsvpStatus), nullable=False
    )
    # Optional proxy holder (if status is WITH_PROXY)
    proxy_holder_name: Mapped[str | None] = mapped_column(String(255))
    # Notes from respondent
    notes: Mapped[str | None] = mapped_column(Text)
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_meeting_rsvps_meeting_id", "meeting_id"),
        Index("ix_meeting_rsvps_user_id", "user_id"),
        UniqueConstraint("meeting_id", "user_id", name="uq_meeting_rsvp_user"),
    )


class ProxyScope(str, Enum):
    """Scope of the proxy - full or specific agenda items (STORY-073)."""

    FULL = "full"  # Volmacht voor alle agendapunten
    SPECIFIC = "specific"  # Volmacht voor specifieke agendapunten


class ProxyStatus(str, Enum):
    """Status of a proxy/volmacht (STORY-073)."""

    PENDING = "pending"  # Wachtend op bevestiging
    CONFIRMED = "confirmed"  # Bevestigd door gevolmachtigde
    REVOKED = "revoked"  # Ingetrokken door volmachtgever


class MeetingProxy(Base):
    """Digital proxy (volmacht) for an ALV meeting (STORY-073).

    Implements STORY-073: Volmacht digitaal afgeven.
    Allows owners to grant proxy voting rights to another owner or board member.
    """

    __tablename__ = "meeting_proxies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    # The owner granting the proxy (volmachtgever)
    grantor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # The person receiving the proxy (gevolmachtigde)
    grantee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # Scope of the proxy
    scope: Mapped[ProxyScope] = mapped_column(
        SQLEnum(ProxyScope), nullable=False, default=ProxyScope.FULL
    )
    # Specific agenda item IDs (JSON array) - only used when scope is SPECIFIC
    agenda_item_ids: Mapped[str | None] = mapped_column(Text)  # JSON array of UUIDs
    # Status of the proxy
    status: Mapped[ProxyStatus] = mapped_column(
        SQLEnum(ProxyStatus), nullable=False, default=ProxyStatus.PENDING
    )
    # Notes from the grantor
    notes: Mapped[str | None] = mapped_column(Text)
    # Confirmation timestamp
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Revocation timestamp
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_meeting_proxies_meeting_id", "meeting_id"),
        Index("ix_meeting_proxies_grantor_id", "grantor_id"),
        Index("ix_meeting_proxies_grantee_id", "grantee_id"),
        # Each owner can only grant one proxy per meeting
        UniqueConstraint("meeting_id", "grantor_id", name="uq_meeting_proxy_grantor"),
        # Ensure grantor and grantee are different
        CheckConstraint("grantor_id != grantee_id", name="ck_proxy_different_users"),
    )


class MinutesStatus(str, Enum):
    """Status of meeting minutes (STORY-075)."""

    DRAFT = "draft"  # Concept
    PUBLISHED = "published"  # Gepubliceerd
    APPROVED = "approved"  # Goedgekeurd


class MeetingMinutes(Base):
    """Meeting minutes/notulen for an ALV meeting (STORY-075).

    Implements STORY-075: Notulen opstellen met template.
    Allows secretaris to create and edit meeting minutes.
    """

    __tablename__ = "meeting_minutes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    # Rich text content (HTML format for WYSIWYG editor)
    content: Mapped[str | None] = mapped_column(Text)
    # Status of the minutes
    status: Mapped[MinutesStatus] = mapped_column(
        SQLEnum(MinutesStatus), nullable=False, default=MinutesStatus.DRAFT
    )
    # Metadata
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # Published/approval timestamps
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    # Auto-save timestamp
    last_saved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_meeting_minutes_meeting_id", "meeting_id"),
        # One minutes document per meeting
        UniqueConstraint("meeting_id", name="uq_meeting_minutes"),
    )


class DecisionType(str, Enum):
    """Type of decision in meeting minutes (STORY-075)."""

    BESLUIT = "besluit"  # Official decision
    ACTIEPUNT = "actiepunt"  # Action item
    AANDACHTSPUNT = "aandachtspunt"  # Point of attention


class MeetingDecision(Base):
    """Decision or action item extracted from meeting minutes (STORY-075, STORY-076).

    Implements STORY-075: Markeren van besluiten en actiepunten.
    """

    __tablename__ = "meeting_decisions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    minutes_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meeting_minutes.id", ondelete="SET NULL")
    )
    # Decision details
    decision_type: Mapped[DecisionType] = mapped_column(
        SQLEnum(DecisionType), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    # Related agenda item
    agenda_item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meeting_agenda_items.id", ondelete="SET NULL")
    )
    # Action item specific fields
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Metadata
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_meeting_decisions_meeting_id", "meeting_id"),
        Index("ix_meeting_decisions_minutes_id", "minutes_id"),
    )


# ============================================================================
# MJOP (Maintenance Plan) Models - EPIC-014
# ============================================================================


class MaintenanceElementCategory(str, Enum):
    """Category of maintenance element (FEAT-029 MJOP Import & Beheer)."""

    ROOF = "roof"  # Dak
    FACADE = "facade"  # Gevel
    FOUNDATION = "foundation"  # Fundering
    WINDOWS = "windows"  # Ramen
    DOORS = "doors"  # Deuren
    ELEVATOR = "elevator"  # Lift
    HEATING = "heating"  # Verwarming
    PLUMBING = "plumbing"  # Leidingwerk
    ELECTRICAL = "electrical"  # Elektra
    COMMON_AREAS = "common_areas"  # Gemeenschappelijke ruimtes
    GARDEN = "garden"  # Tuin
    PARKING = "parking"  # Parkeerplaats
    OTHER = "other"  # Overig


class MaintenanceStatus(str, Enum):
    """Status of maintenance element (FEAT-031 Onderhoudstaak Beheer)."""

    PLANNED = "planned"  # Gepland
    IN_PROGRESS = "in_progress"  # In uitvoering
    COMPLETED = "completed"  # Voltooid
    POSTPONED = "postponed"  # Uitgesteld
    CANCELLED = "cancelled"  # Geannuleerd


class MaintenancePriority(str, Enum):
    """Priority level for maintenance (FEAT-029)."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class MaintenanceElement(Base):
    """Maintenance element in MJOP (STORY-062, STORY-063).

    Represents a building component requiring periodic maintenance.
    Implements FEAT-029: MJOP Import & Beheer.
    """

    __tablename__ = "maintenance_elements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Element details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[MaintenanceElementCategory] = mapped_column(
        SQLEnum(MaintenanceElementCategory), nullable=False
    )
    # Physical details
    location: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit: Mapped[str | None] = mapped_column(String(50))  # e.g., m², stuks
    # Lifecycle info
    installation_year: Mapped[int | None] = mapped_column(Integer)
    expected_lifespan_years: Mapped[int | None] = mapped_column(Integer)
    last_maintenance_year: Mapped[int | None] = mapped_column(Integer)
    next_maintenance_year: Mapped[int | None] = mapped_column(Integer)
    # Cost estimates
    estimated_cost: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    # Priority and status
    priority: Mapped[MaintenancePriority] = mapped_column(
        SQLEnum(MaintenancePriority), default=MaintenancePriority.MEDIUM
    )
    # Import tracking (STORY-062)
    import_batch_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    import_row_number: Mapped[int | None] = mapped_column(Integer)
    # Metadata
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
    tasks: Mapped[list["MaintenanceTask"]] = relationship(
        "MaintenanceTask", back_populates="element", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_maintenance_elements_vve_id", "vve_id"),
        Index("ix_maintenance_elements_category", "category"),
        Index("ix_maintenance_elements_next_maintenance", "next_maintenance_year"),
    )


class MaintenanceTask(Base):
    """Maintenance task for an element (STORY-067, STORY-068).

    Implements FEAT-031: Onderhoudstaak Beheer.
    """

    __tablename__ = "maintenance_tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    element_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("maintenance_elements.id", ondelete="CASCADE"),
        nullable=False,
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Task details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[MaintenanceStatus] = mapped_column(
        SQLEnum(MaintenanceStatus), default=MaintenanceStatus.PLANNED
    )
    priority: Mapped[MaintenancePriority] = mapped_column(
        SQLEnum(MaintenancePriority), default=MaintenancePriority.MEDIUM
    )
    # Scheduling
    planned_year: Mapped[int | None] = mapped_column(Integer)
    planned_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Cost tracking
    estimated_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    actual_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    # Assignment
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    supplier_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="SET NULL")
    )
    # Notes
    notes: Mapped[str | None] = mapped_column(Text)
    # Metadata
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
    element: Mapped["MaintenanceElement"] = relationship(
        "MaintenanceElement", back_populates="tasks"
    )

    __table_args__ = (
        Index("ix_maintenance_tasks_element_id", "element_id"),
        Index("ix_maintenance_tasks_vve_id", "vve_id"),
        Index("ix_maintenance_tasks_status", "status"),
        Index("ix_maintenance_tasks_planned_year", "planned_year"),
    )


class MJOPImportBatch(Base):
    """Track MJOP import batches for audit (STORY-062).

    Records each Excel import with validation status.
    """

    __tablename__ = "mjop_import_batches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Import details
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    total_rows: Mapped[int] = mapped_column(Integer, default=0)
    imported_rows: Mapped[int] = mapped_column(Integer, default=0)
    failed_rows: Mapped[int] = mapped_column(Integer, default=0)
    # Column mapping used
    column_mapping: Mapped[str | None] = mapped_column(Text)  # JSON string
    # Status
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    error_log: Mapped[str | None] = mapped_column(Text)  # JSON string of errors
    # Metadata
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (Index("ix_mjop_import_batches_vve_id", "vve_id"),)


# ============================================================================
# Compliance Models - EPIC-016 Juridisch & Compliance
# ============================================================================


class ComplianceCategory(str, Enum):
    """Compliance categories (FEAT-035 Compliance Dashboard)."""

    KVK = "kvk"  # Kamer van Koophandel
    VERZEKERING = "verzekering"  # Insurance
    AVG = "avg"  # Privacy/GDPR
    ALV = "alv"  # Annual meeting requirements
    ONDERHOUD = "onderhoud"  # Maintenance obligations
    FINANCIEEL = "financieel"  # Financial reporting
    OVERIG = "overig"  # Other


class ComplianceStatus(str, Enum):
    """Status of compliance item (STORY-078)."""

    COMPLIANT = "compliant"
    AANDACHT = "aandacht"  # Needs attention
    NIET_COMPLIANT = "niet_compliant"  # Non-compliant


class ComplianceItem(Base):
    """Compliance checklist item (STORY-078, STORY-079).

    Represents a compliance requirement that must be fulfilled.
    Implements FEAT-035: Compliance Dashboard.
    """

    __tablename__ = "compliance_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Item details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[ComplianceCategory] = mapped_column(
        SQLEnum(ComplianceCategory), nullable=False
    )
    # Status tracking (STORY-078)
    status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus), default=ComplianceStatus.AANDACHT
    )
    # Completion tracking (STORY-079)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    # Evidence document (STORY-079)
    evidence_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    # Deadline tracking (STORY-121)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    alert_days_before: Mapped[int] = mapped_column(Integer, default=30)
    # Recurrence
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    recurrence_months: Mapped[int | None] = mapped_column(Integer)  # e.g., 12 for yearly
    # Metadata
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_compliance_items_vve_id", "vve_id"),
        Index("ix_compliance_items_category", "category"),
        Index("ix_compliance_items_deadline", "deadline"),
    )


class ComplianceHistory(Base):
    """History of compliance item completions (STORY-079).

    Tracks when items were completed for audit purposes.
    """

    __tablename__ = "compliance_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    compliance_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("compliance_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Completion details
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    completed_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # Evidence
    evidence_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    notes: Mapped[str | None] = mapped_column(Text)
    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_compliance_history_item_id", "compliance_item_id"),
    )


# ============================================================================
# Digital Voting Models - EPIC-027 Digitaal Stemmen & Polls
# ============================================================================


class VotingStatus(str, Enum):
    """Status of a voting/poll (FEAT-067 Digitale Stemming)."""

    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class VoteChoice(str, Enum):
    """Vote choices (STORY-114)."""

    VOOR = "voor"  # For
    TEGEN = "tegen"  # Against
    BLANCO = "blanco"  # Abstain


class Voting(Base):
    """Digital voting/proposal for VVE decisions (STORY-113).

    Implements FEAT-067: Digitale Stemming.
    """

    __tablename__ = "votings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Voting details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[VotingStatus] = mapped_column(
        SQLEnum(VotingStatus), default=VotingStatus.DRAFT
    )
    # Timing
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # Connection to meeting (optional)
    meeting_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="SET NULL")
    )
    # Quorum requirement
    quorum_percentage: Mapped[int] = mapped_column(Integer, default=50)  # % of shares needed
    # Results (populated after closing)
    total_votes: Mapped[int] = mapped_column(Integer, default=0)
    votes_for: Mapped[int] = mapped_column(Integer, default=0)
    votes_against: Mapped[int] = mapped_column(Integer, default=0)
    votes_abstain: Mapped[int] = mapped_column(Integer, default=0)
    quorum_reached: Mapped[bool | None] = mapped_column(Boolean)
    result_percentage_for: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    # Metadata
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
    votes: Mapped[list["Vote"]] = relationship(
        "Vote", back_populates="voting", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_votings_vve_id", "vve_id"),
        Index("ix_votings_status", "status"),
        Index("ix_votings_end_date", "end_date"),
    )


class Vote(Base):
    """Individual vote cast by an owner (STORY-114).

    One vote per unit/ownership right.
    """

    __tablename__ = "votes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    voting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("votings.id", ondelete="CASCADE"), nullable=False
    )
    unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # Vote choice
    choice: Mapped[VoteChoice] = mapped_column(SQLEnum(VoteChoice), nullable=False)
    # Share weight (from unit at time of voting)
    share_percentage: Mapped[Decimal] = mapped_column(Numeric(10, 5), nullable=False)
    # Metadata
    voted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    voting: Mapped["Voting"] = relationship("Voting", back_populates="votes")

    __table_args__ = (
        Index("ix_votes_voting_id", "voting_id"),
        UniqueConstraint("voting_id", "unit_id", name="uq_votes_voting_unit"),
    )


class VotingProxyStatus(str, Enum):
    """Status of a voting proxy (STORY-117)."""

    PENDING = "pending"  # Wachtend op bevestiging
    CONFIRMED = "confirmed"  # Bevestigd door gevolmachtigde
    REVOKED = "revoked"  # Ingetrokken door volmachtgever
    USED = "used"  # Volmacht is gebruikt


class VotingProxy(Base):
    """Digital proxy (volmacht) for voting (STORY-117).

    Implements FEAT-069: Volmacht Beheer.
    Allows owners to grant proxy voting rights to another owner for digital votings.
    """

    __tablename__ = "voting_proxies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # The owner granting the proxy (volmachtgever)
    grantor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # The unit for which the proxy is granted
    unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False
    )
    # The person receiving the proxy (gevolmachtigde)
    grantee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # Specific voting (optional - if None, applies to all votings for this VVE)
    voting_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("votings.id", ondelete="CASCADE")
    )
    # VVE reference for general proxies
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Status of the proxy
    status: Mapped[VotingProxyStatus] = mapped_column(
        SQLEnum(VotingProxyStatus), nullable=False, default=VotingProxyStatus.PENDING
    )
    # Notes from the grantor
    notes: Mapped[str | None] = mapped_column(Text)
    # Confirmation timestamp
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Revocation timestamp
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_voting_proxies_grantor_id", "grantor_id"),
        Index("ix_voting_proxies_grantee_id", "grantee_id"),
        Index("ix_voting_proxies_voting_id", "voting_id"),
        Index("ix_voting_proxies_vve_id", "vve_id"),
        # Ensure one active proxy per unit per voting
        UniqueConstraint(
            "unit_id", "voting_id",
            name="uq_voting_proxy_unit_voting"
        ),
    )


# ============================================================================
# Poll Models - STORY-116 Polls & Peilingen
# ============================================================================


class PollStatus(str, Enum):
    """Status of a poll (STORY-116)."""

    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"


class PollResultsVisibility(str, Enum):
    """Who can see poll results (STORY-116)."""

    ALL = "all"  # Iedereen kan resultaten zien
    BOARD_ONLY = "board_only"  # Alleen bestuur kan resultaten zien
    AFTER_VOTE = "after_vote"  # Resultaten na eigen stem


class Poll(Base):
    """Informal poll for gauging support (STORY-116).

    Implements FEAT-068: Polls & Peilingen.
    Non-binding polls to measure support before formal voting.
    """

    __tablename__ = "polls"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    vve_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vves.id", ondelete="CASCADE"), nullable=False
    )
    # Poll details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[PollStatus] = mapped_column(
        SQLEnum(PollStatus), default=PollStatus.DRAFT
    )
    # Timing
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # Settings
    allow_multiple: Mapped[bool] = mapped_column(Boolean, default=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    results_visibility: Mapped[PollResultsVisibility] = mapped_column(
        SQLEnum(PollResultsVisibility), default=PollResultsVisibility.ALL
    )
    # Statistics
    total_votes: Mapped[int] = mapped_column(Integer, default=0)
    total_participants: Mapped[int] = mapped_column(Integer, default=0)
    # Metadata
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
    options: Mapped[list["PollOption"]] = relationship(
        "PollOption", back_populates="poll", cascade="all, delete-orphan"
    )
    votes: Mapped[list["PollVote"]] = relationship(
        "PollVote", back_populates="poll", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_polls_vve_id", "vve_id"),
        Index("ix_polls_status", "status"),
        Index("ix_polls_end_date", "end_date"),
    )


class PollOption(Base):
    """Option in a poll (STORY-116)."""

    __tablename__ = "poll_options"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    poll_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False
    )
    text: Mapped[str] = mapped_column(String(255), nullable=False)
    vote_count: Mapped[int] = mapped_column(Integer, default=0)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    poll: Mapped["Poll"] = relationship("Poll", back_populates="options")

    __table_args__ = (
        Index("ix_poll_options_poll_id", "poll_id"),
    )


class PollVote(Base):
    """Individual vote on a poll option (STORY-116)."""

    __tablename__ = "poll_votes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    poll_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False
    )
    option_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("poll_options.id", ondelete="CASCADE"), nullable=False
    )
    # User ID is nullable for anonymous polls
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    # Timestamp
    voted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    poll: Mapped["Poll"] = relationship("Poll", back_populates="votes")

    __table_args__ = (
        Index("ix_poll_votes_poll_id", "poll_id"),
        Index("ix_poll_votes_user_id", "user_id"),
    )
