"""Contract API routes.

Implements EPIC-013 (Contractbeheer), FEAT-026 (Contractregistratie & Opslag),
STORY-055 (Contract registreren met metadata), and STORY-056 (Contract document uploaden).
"""

import os
import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_beheerder,
    require_bestuurslid,
)
from app.db.models.models import (
    Contract,
    ContractType as DBContractType,
    Document,
    Supplier,
    User,
)
from app.db.session import get_db
from app.schemas.contract import (
    ContractCreate,
    ContractDocumentResponse,
    ContractListResponse,
    ContractResponse,
    ContractSummary,
    ContractType,
    ContractUpdate,
    CostsPeriod,
)

router = APIRouter(prefix="/vves/{vve_id}/contracts", tags=["contracts"])

# Constants for document upload (STORY-056)
MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
]


def _calculate_days_until(target_date: datetime | None) -> int | None:
    """Calculate days until a target date."""
    if not target_date:
        return None
    now = datetime.now(timezone.utc)
    delta = target_date - now
    return max(0, delta.days)


def _calculate_notice_date(
    end_date: datetime | None, notice_period_days: int | None
) -> datetime | None:
    """Calculate the date when notice must be given."""
    if not end_date or not notice_period_days:
        return None
    from datetime import timedelta

    return end_date - timedelta(days=notice_period_days)


@router.post(
    "",
    response_model=ContractResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new contract",
    description="Register a new contract with supplier, dates, and cost information. Only beheerders can create contracts.",
)
async def create_contract(
    vve_id: uuid.UUID,
    contract_data: ContractCreate,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: AsyncSession = Depends(get_db),
) -> ContractResponse:
    """Create a new contract (STORY-055)."""
    # Validate supplier_id if provided
    if contract_data.supplier_id:
        supplier_query = select(Supplier).where(
            Supplier.id == contract_data.supplier_id,
            Supplier.vve_id == vve_id,
        )
        supplier_result = await db.execute(supplier_query)
        if not supplier_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found in this VVE",
            )

    # Create contract
    contract = Contract(
        vve_id=vve_id,
        supplier_name=contract_data.supplier_name,
        supplier_id=contract_data.supplier_id,
        contract_type=DBContractType(contract_data.contract_type.value),
        description=contract_data.description,
        start_date=contract_data.start_date,
        end_date=contract_data.end_date,
        notice_period_days=contract_data.notice_period_days,
        costs=contract_data.costs,
        costs_period=contract_data.costs_period.value if contract_data.costs_period else None,
        created_by_id=current_user.id,
    )

    db.add(contract)
    await db.commit()
    await db.refresh(contract)

    # Get creator name
    creator_query = select(User).where(User.id == contract.created_by_id)
    creator_result = await db.execute(creator_query)
    creator = creator_result.scalar_one_or_none()
    creator_name = f"{creator.first_name} {creator.last_name}" if creator else None

    return ContractResponse(
        id=contract.id,
        vve_id=contract.vve_id,
        supplier_name=contract.supplier_name,
        supplier_id=contract.supplier_id,
        contract_type=ContractType(contract.contract_type.value),
        description=contract.description,
        start_date=contract.start_date,
        end_date=contract.end_date,
        notice_period_days=contract.notice_period_days,
        costs=contract.costs,
        costs_period=CostsPeriod(contract.costs_period) if contract.costs_period else None,
        document_id=contract.document_id,
        created_by_id=contract.created_by_id,
        created_by_name=creator_name,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
        is_active=contract.is_active,
    )


@router.get(
    "",
    response_model=list[ContractListResponse],
    summary="List contracts",
    description="Get all contracts for a VVE. Supports filtering by type, status, and search.",
)
async def list_contracts(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
    search: str | None = Query(None, description="Search by supplier name or description"),
    contract_type: ContractType | None = Query(None, description="Filter by contract type"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[ContractListResponse]:
    """List contracts for a VVE (STORY-055, STORY-057)."""
    # Build query
    query = select(Contract).where(Contract.vve_id == vve_id)

    # STORY-057: Add search functionality
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Contract.supplier_name.ilike(search_pattern)) |
            (Contract.description.ilike(search_pattern))
        )
    
    if contract_type:
        query = query.where(Contract.contract_type == DBContractType(contract_type.value))
    if is_active is not None:
        query = query.where(Contract.is_active == is_active)

    query = query.order_by(Contract.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    contracts = result.scalars().all()

    response = []
    for contract in contracts:
        days_until_end = _calculate_days_until(contract.end_date)
        notice_date = _calculate_notice_date(contract.end_date, contract.notice_period_days)
        days_until_notice = _calculate_days_until(notice_date)
        is_expiring_soon = days_until_end is not None and days_until_end <= 30

        response.append(
            ContractListResponse(
                id=contract.id,
                vve_id=contract.vve_id,
                supplier_name=contract.supplier_name,
                contract_type=ContractType(contract.contract_type.value),
                start_date=contract.start_date,
                end_date=contract.end_date,
                notice_period_days=contract.notice_period_days,
                costs=contract.costs,
                costs_period=CostsPeriod(contract.costs_period) if contract.costs_period else None,
                is_active=contract.is_active,
                created_at=contract.created_at,
                days_until_end=days_until_end,
                days_until_notice=days_until_notice,
                is_expiring_soon=is_expiring_soon,
            )
        )

    return response


@router.get(
    "/summary",
    response_model=ContractSummary,
    summary="Get contract summary",
    description="Get summary statistics for all contracts in a VVE.",
)
async def get_contract_summary(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> ContractSummary:
    """Get contract summary statistics (STORY-055)."""
    # Get all contracts
    query = select(Contract).where(Contract.vve_id == vve_id)
    result = await db.execute(query)
    contracts = result.scalars().all()

    total_contracts = len(contracts)
    active_contracts = sum(1 for c in contracts if c.is_active)

    # Count expiring soon (within 30 days)
    now = datetime.now(timezone.utc)
    expiring_soon = 0
    for contract in contracts:
        if contract.end_date and contract.is_active:
            days_left = (contract.end_date - now).days
            if 0 <= days_left <= 30:
                expiring_soon += 1

    # Count by type
    by_type: dict[str, int] = {}
    for contract in contracts:
        type_value = contract.contract_type.value
        by_type[type_value] = by_type.get(type_value, 0) + 1

    # Calculate costs
    total_monthly_costs = Decimal("0")
    total_yearly_costs = Decimal("0")

    for contract in contracts:
        if not contract.is_active or not contract.costs:
            continue

        if contract.costs_period == "monthly":
            total_monthly_costs += contract.costs
            total_yearly_costs += contract.costs * 12
        elif contract.costs_period == "yearly":
            total_yearly_costs += contract.costs
            total_monthly_costs += contract.costs / 12
        elif contract.costs_period == "one_time":
            # One-time costs not included in recurring totals
            pass

    return ContractSummary(
        total_contracts=total_contracts,
        active_contracts=active_contracts,
        expiring_soon=expiring_soon,
        by_type=by_type,
        total_monthly_costs=total_monthly_costs,
        total_yearly_costs=total_yearly_costs,
    )


@router.get(
    "/{contract_id}",
    response_model=ContractResponse,
    summary="Get contract details",
    description="Get detailed information about a specific contract.",
)
async def get_contract(
    vve_id: uuid.UUID,
    contract_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
) -> ContractResponse:
    """Get a specific contract (STORY-055)."""
    # Get contract
    query = select(Contract).where(
        Contract.id == contract_id,
        Contract.vve_id == vve_id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    # Get creator name
    creator_query = select(User).where(User.id == contract.created_by_id)
    creator_result = await db.execute(creator_query)
    creator = creator_result.scalar_one_or_none()
    creator_name = f"{creator.first_name} {creator.last_name}" if creator else None

    return ContractResponse(
        id=contract.id,
        vve_id=contract.vve_id,
        supplier_name=contract.supplier_name,
        supplier_id=contract.supplier_id,
        contract_type=ContractType(contract.contract_type.value),
        description=contract.description,
        start_date=contract.start_date,
        end_date=contract.end_date,
        notice_period_days=contract.notice_period_days,
        costs=contract.costs,
        costs_period=CostsPeriod(contract.costs_period) if contract.costs_period else None,
        document_id=contract.document_id,
        created_by_id=contract.created_by_id,
        created_by_name=creator_name,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
        is_active=contract.is_active,
    )


@router.patch(
    "/{contract_id}",
    response_model=ContractResponse,
    summary="Update contract",
    description="Update an existing contract. Only beheerders can update contracts.",
)
async def update_contract(
    vve_id: uuid.UUID,
    contract_id: uuid.UUID,
    contract_data: ContractUpdate,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: AsyncSession = Depends(get_db),
) -> ContractResponse:
    """Update a contract (STORY-055)."""
    # Get contract
    query = select(Contract).where(
        Contract.id == contract_id,
        Contract.vve_id == vve_id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    # Validate supplier_id if provided
    if contract_data.supplier_id:
        supplier_query = select(Supplier).where(
            Supplier.id == contract_data.supplier_id,
            Supplier.vve_id == vve_id,
        )
        supplier_result = await db.execute(supplier_query)
        if not supplier_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found in this VVE",
            )

    # Update fields
    update_data = contract_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "contract_type" and value:
            setattr(contract, field, DBContractType(value.value))
        elif field == "costs_period" and value:
            setattr(contract, field, value.value)
        else:
            setattr(contract, field, value)

    await db.commit()
    await db.refresh(contract)

    # Get creator name
    creator_query = select(User).where(User.id == contract.created_by_id)
    creator_result = await db.execute(creator_query)
    creator = creator_result.scalar_one_or_none()
    creator_name = f"{creator.first_name} {creator.last_name}" if creator else None

    return ContractResponse(
        id=contract.id,
        vve_id=contract.vve_id,
        supplier_name=contract.supplier_name,
        supplier_id=contract.supplier_id,
        contract_type=ContractType(contract.contract_type.value),
        description=contract.description,
        start_date=contract.start_date,
        end_date=contract.end_date,
        notice_period_days=contract.notice_period_days,
        costs=contract.costs,
        costs_period=CostsPeriod(contract.costs_period) if contract.costs_period else None,
        document_id=contract.document_id,
        created_by_id=contract.created_by_id,
        created_by_name=creator_name,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
        is_active=contract.is_active,
    )


@router.delete(
    "/{contract_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete contract",
    description="Delete a contract. Only beheerders can delete contracts.",
)
async def delete_contract(
    vve_id: uuid.UUID,
    contract_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a contract (STORY-055)."""
    # Get contract
    query = select(Contract).where(
        Contract.id == contract_id,
        Contract.vve_id == vve_id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    await db.delete(contract)
    await db.commit()


def _sanitize_filename(filename: str | None) -> str:
    """Sanitize a filename to prevent path traversal attacks."""
    if not filename:
        return "unknown"
    
    # Get only the base filename (remove any path)
    filename = os.path.basename(filename)
    
    # Remove or replace potentially dangerous characters
    sanitized = re.sub(r'[^\w\.\-]', '_', filename)
    
    # Prevent empty filenames or files starting with dot
    if not sanitized or sanitized.startswith('.'):
        sanitized = f"file_{sanitized}"
    
    # Limit length
    if len(sanitized) > 255:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:255-len(ext)] + ext
    
    return sanitized


@router.post(
    "/{contract_id}/document",
    response_model=ContractDocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload contract document",
    description="Upload a PDF document and link it to a contract. Only beheerders can upload documents.",
)
async def upload_contract_document(
    vve_id: uuid.UUID,
    contract_id: uuid.UUID,
    file: Annotated[UploadFile, File(description="PDF document (max 10MB)")],
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: AsyncSession = Depends(get_db),
    description: Annotated[str | None, Form(max_length=500)] = None,
) -> ContractDocumentResponse:
    """Upload a document to a contract (STORY-056)."""
    # Get contract
    query = select(Contract).where(
        Contract.id == contract_id,
        Contract.vve_id == vve_id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    # Validate file type
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Only PDF files are supported.",
        )

    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_DOCUMENT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is 10MB.",
        )

    # Sanitize filename
    safe_filename = _sanitize_filename(file.filename)

    # Create document record
    document = Document(
        vve_id=vve_id,
        title=f"Contract: {contract.supplier_name}",
        description=description,
        file_name=safe_filename,
        file_type=file.content_type or "application/pdf",
        file_size_bytes=file_size,
        s3_key=f"contracts/{vve_id}/{contract_id}/{safe_filename}",  # Simulated S3 key
        category="contract",
        is_public=False,
        uploaded_by_id=current_user.id,
        visible_to_roles="beheerder,bestuurslid",
    )

    db.add(document)
    await db.flush()  # Get the document ID

    # Link document to contract
    contract.document_id = document.id
    
    await db.commit()
    await db.refresh(document)

    return ContractDocumentResponse(
        contract_id=contract_id,
        document_id=document.id,
        file_name=document.file_name,
        file_type=document.file_type,
        file_size_bytes=document.file_size_bytes,
        created_at=document.created_at,
    )


@router.put(
    "/{contract_id}/document/{document_id}",
    response_model=ContractResponse,
    summary="Link existing document to contract",
    description="Link an existing document to a contract. Only beheerders can link documents.",
)
async def link_document_to_contract(
    vve_id: uuid.UUID,
    contract_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: AsyncSession = Depends(get_db),
) -> ContractResponse:
    """Link an existing document to a contract (STORY-056)."""
    # Get contract
    contract_query = select(Contract).where(
        Contract.id == contract_id,
        Contract.vve_id == vve_id,
    )
    contract_result = await db.execute(contract_query)
    contract = contract_result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    # Verify document exists and belongs to same VVE
    document_query = select(Document).where(
        Document.id == document_id,
        Document.vve_id == vve_id,
    )
    document_result = await db.execute(document_query)
    document = document_result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in this VVE",
        )

    # Link document to contract
    contract.document_id = document_id
    
    await db.commit()
    await db.refresh(contract)

    # Get creator name
    creator_query = select(User).where(User.id == contract.created_by_id)
    creator_result = await db.execute(creator_query)
    creator = creator_result.scalar_one_or_none()
    creator_name = f"{creator.first_name} {creator.last_name}" if creator else None

    return ContractResponse(
        id=contract.id,
        vve_id=contract.vve_id,
        supplier_name=contract.supplier_name,
        supplier_id=contract.supplier_id,
        contract_type=ContractType(contract.contract_type.value),
        description=contract.description,
        start_date=contract.start_date,
        end_date=contract.end_date,
        notice_period_days=contract.notice_period_days,
        costs=contract.costs,
        costs_period=CostsPeriod(contract.costs_period) if contract.costs_period else None,
        document_id=contract.document_id,
        created_by_id=contract.created_by_id,
        created_by_name=creator_name,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
        is_active=contract.is_active,
    )


@router.delete(
    "/{contract_id}/document",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink document from contract",
    description="Remove the document link from a contract. The document itself is not deleted.",
)
async def unlink_document_from_contract(
    vve_id: uuid.UUID,
    contract_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_beheerder)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Unlink document from contract (STORY-056)."""
    # Get contract
    query = select(Contract).where(
        Contract.id == contract_id,
        Contract.vve_id == vve_id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    contract.document_id = None
    await db.commit()
