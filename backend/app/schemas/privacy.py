"""Pydantic schemas for AVG Module.

Based on EPIC-016 (Juridisch & Compliance):
- FEAT-036: AVG Module (STORY-080, STORY-122)
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PrivacyStatementStatus(str, Enum):
    """Status of a privacy statement."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# ============================================================================
# Privacy Statement Schemas (STORY-080)
# ============================================================================


class PrivacyStatementCreate(BaseModel):
    """Schema for creating a privacy statement (STORY-080)."""

    title: str = Field(default="Privacy Statement", min_length=3, max_length=255)
    version: str = Field(default="1.0", max_length=50)
    # VVE Information (optional overrides)
    vve_name: str | None = None  # If None, will use VVE name from database
    vve_address: str | None = Field(None, max_length=500)
    contact_email: EmailStr | None = None
    contact_phone: str | None = Field(None, max_length=50)
    # Data protection officer info (optional)
    dpo_name: str | None = Field(None, max_length=255)
    dpo_email: EmailStr | None = None
    # Content sections (all optional, defaults provided)
    introduction: str | None = None
    data_collected: str | None = None
    data_purpose: str | None = None
    legal_basis: str | None = None
    data_sharing: str | None = None
    retention_period: str | None = None
    rights: str | None = None
    cookies: str | None = None
    security: str | None = None
    complaints: str | None = None
    changes: str | None = None


class PrivacyStatementUpdate(BaseModel):
    """Schema for updating a privacy statement."""

    title: str | None = Field(None, min_length=3, max_length=255)
    version: str | None = Field(None, max_length=50)
    vve_name: str | None = None
    vve_address: str | None = Field(None, max_length=500)
    contact_email: EmailStr | None = None
    contact_phone: str | None = Field(None, max_length=50)
    dpo_name: str | None = Field(None, max_length=255)
    dpo_email: EmailStr | None = None
    introduction: str | None = None
    data_collected: str | None = None
    data_purpose: str | None = None
    legal_basis: str | None = None
    data_sharing: str | None = None
    retention_period: str | None = None
    rights: str | None = None
    cookies: str | None = None
    security: str | None = None
    complaints: str | None = None
    changes: str | None = None
    status: PrivacyStatementStatus | None = None


class PrivacyStatementResponse(BaseModel):
    """Response schema for privacy statement."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    version: str
    # VVE Information
    vve_name: str
    vve_address: str | None
    contact_email: str | None
    contact_phone: str | None
    # DPO info
    dpo_name: str | None
    dpo_email: str | None
    # Content sections
    introduction: str | None
    data_collected: str | None
    data_purpose: str | None
    legal_basis: str | None
    data_sharing: str | None
    retention_period: str | None
    rights: str | None
    cookies: str | None
    security: str | None
    complaints: str | None
    changes: str | None
    # Status
    status: PrivacyStatementStatus
    published_at: datetime | None
    # Metadata
    created_by_id: uuid.UUID | None
    created_by_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PrivacyStatementListResponse(BaseModel):
    """List response for privacy statements."""

    id: uuid.UUID
    vve_id: uuid.UUID
    title: str
    version: str
    status: PrivacyStatementStatus
    published_at: datetime | None
    created_at: datetime


class PrivacyStatementTemplate(BaseModel):
    """Default template for privacy statement content."""

    introduction: str = """
De VVE hecht veel waarde aan de bescherming van uw persoonsgegevens. In deze privacyverklaring 
informeren wij u over hoe wij omgaan met uw persoonsgegevens conform de Algemene Verordening 
Gegevensbescherming (AVG).
""".strip()

    data_collected: str = """
Wij verzamelen en verwerken de volgende persoonsgegevens van eigenaren:
- Naam en contactgegevens (adres, telefoonnummer, e-mailadres)
- Bankgegevens voor contributie-inning
- Gegevens over het appartementsrecht (eigendomspercentage)
- Correspondentie en communicatie
- Stemgedrag tijdens vergaderingen
""".strip()

    data_purpose: str = """
Wij verwerken uw persoonsgegevens voor de volgende doelen:
- Beheer van het lidmaatschap en eigendomsregistratie
- Inning van de VVE-bijdragen
- Communicatie over VVE-aangelegenheden
- Organisatie van vergaderingen
- Uitvoering van bestuursbesluiten
- Voldoen aan wettelijke verplichtingen
""".strip()

    legal_basis: str = """
De verwerking van uw persoonsgegevens is gebaseerd op:
- Uitvoering van de overeenkomst (het reglement van splitsing)
- Wettelijke verplichtingen (o.a. bewaarplicht administratie)
- Gerechtvaardigd belang van de VVE
""".strip()

    data_sharing: str = """
Uw gegevens kunnen worden gedeeld met:
- De VVE-beheerder (indien van toepassing)
- Accountants en financiële dienstverleners
- Overheidsinstanties indien wettelijk verplicht
- Aannemers en leveranciers (beperkt tot noodzakelijke gegevens)

Wij verkopen uw gegevens nooit aan derden.
""".strip()

    retention_period: str = """
Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk:
- Lidmaatschapsgegevens: tot 2 jaar na beëindiging eigendom
- Financiële administratie: 7 jaar (wettelijke bewaarplicht)
- Notulen en besluiten: permanent (historisch archief)
""".strip()

    rights: str = """
U heeft de volgende rechten met betrekking tot uw persoonsgegevens:
- Recht op inzage in uw gegevens
- Recht op correctie van onjuiste gegevens
- Recht op verwijdering (binnen wettelijke grenzen)
- Recht op beperking van verwerking
- Recht op dataportabiliteit
- Recht van bezwaar

Voor het uitoefenen van uw rechten kunt u contact opnemen met het bestuur.
""".strip()

    cookies: str = """
Onze digitale diensten kunnen gebruik maken van:
- Functionele cookies (noodzakelijk voor werking)
- Analytische cookies (geanonimiseerd)

Wij gebruiken geen tracking cookies of cookies voor marketingdoeleinden.
""".strip()

    security: str = """
Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens 
te beschermen tegen verlies, onrechtmatige verwerking en ongeautoriseerde toegang:
- Versleutelde opslag en communicatie
- Toegangsbeperking op basis van noodzaak
- Regelmatige back-ups
- Beveiligde servers
""".strip()

    complaints: str = """
Als u een klacht heeft over de verwerking van uw persoonsgegevens, neem dan eerst 
contact op met het bestuur. U heeft ook het recht een klacht in te dienen bij de 
Autoriteit Persoonsgegevens (www.autoriteitpersoonsgegevens.nl).
""".strip()

    changes: str = """
Deze privacyverklaring kan worden aangepast. De meest recente versie is altijd 
beschikbaar via onze digitale kanalen. Bij belangrijke wijzigingen zullen wij u 
actief informeren.
""".strip()


# ============================================================================
# Data Export Schemas (STORY-122)
# ============================================================================


class DataExportStatus(str, Enum):
    """Status of a data export request."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    EXPIRED = "expired"
    FAILED = "failed"


class DataExportFormat(str, Enum):
    """Format of the exported data."""

    JSON = "json"
    CSV = "csv"


class DataExportRequestCreate(BaseModel):
    """Schema for creating a data export request (STORY-122)."""

    vve_id: uuid.UUID | None = None  # If None, export all VVEs
    export_format: DataExportFormat = DataExportFormat.JSON


class DataExportRequestResponse(BaseModel):
    """Response schema for data export request."""

    id: uuid.UUID
    user_id: uuid.UUID
    vve_id: uuid.UUID | None
    status: DataExportStatus
    export_format: DataExportFormat
    file_size_bytes: int | None
    download_count: int
    expires_at: datetime | None
    processing_started_at: datetime | None
    processing_completed_at: datetime | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime
    # Calculated fields
    is_ready: bool = False
    is_expired: bool = False
    download_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DataExportRequestListResponse(BaseModel):
    """List response for data export requests."""

    id: uuid.UUID
    vve_id: uuid.UUID | None
    vve_name: str | None
    status: DataExportStatus
    export_format: DataExportFormat
    file_size_bytes: int | None
    expires_at: datetime | None
    created_at: datetime
    is_ready: bool
    is_expired: bool


class DataExportConfirmation(BaseModel):
    """Confirmation response after creating export request."""

    request_id: uuid.UUID
    status: DataExportStatus
    message: str
    estimated_completion_minutes: int = 60


class DataExportData(BaseModel):
    """Container for exported personal data."""

    export_date: datetime
    user_info: dict
    vve_memberships: list[dict]
    units_owned: list[dict]
    transactions: list[dict]
    documents_accessed: list[dict]
    votes_cast: list[dict]
    tickets_created: list[dict]
    audit_trail: list[dict]
