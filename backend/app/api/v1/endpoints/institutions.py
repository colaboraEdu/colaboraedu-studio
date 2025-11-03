"""
Institutions management endpoints
Simple CRUD operations for institutions
"""
from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import Institution
from app.api.deps import CurrentUser


router = APIRouter()


class InstitutionCreate(BaseModel):
    name: str
    cnpj: str
    city: str | None = None
    state: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None


class InstitutionUpdate(BaseModel):
    name: str | None = None
    cnpj: str | None = None
    city: str | None = None
    state: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    is_active: bool | None = None


@router.get("")
async def get_institutions(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get list of all institutions
    
    Returns all active institutions
    """
    institutions = db.query(Institution).filter(
        Institution.deleted_at.is_(None)
    ).all()
    
    # Convert to dict format
    result = []
    for inst in institutions:
        result.append({
            "id": inst.id,
            "name": inst.name,
            "cnpj": inst.cnpj,
            "status": inst.status,
            "is_active": inst.status == "active",
            "logo": inst.logo_url if hasattr(inst, 'logo_url') else None,
            "city": inst.settings.get("city") if inst.settings else None,
            "state": inst.settings.get("state") if inst.settings else None,
            "address": inst.settings.get("address") if inst.settings else None,
            "phone": inst.settings.get("phone") if inst.settings else None,
            "email": inst.settings.get("email") if inst.settings else None,
            "created_at": inst.created_at.isoformat() if inst.created_at else None,
        })
    
    return result


@router.get("/{institution_id}")
async def get_institution(
    institution_id: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get specific institution by ID
    """
    institution = db.query(Institution).filter(
        Institution.id == institution_id,
        Institution.deleted_at.is_(None)
    ).first()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    return {
        "id": institution.id,
        "name": institution.name,
        "cnpj": institution.cnpj,
        "status": institution.status,
        "is_active": institution.status == "active",
        "logo": institution.logo_url if hasattr(institution, 'logo_url') else None,
        "city": institution.settings.get("city") if institution.settings else None,
        "state": institution.settings.get("state") if institution.settings else None,
        "address": institution.settings.get("address") if institution.settings else None,
        "phone": institution.settings.get("phone") if institution.settings else None,
        "email": institution.settings.get("email") if institution.settings else None,
        "created_at": institution.created_at.isoformat() if institution.created_at else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_institution(
    data: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends()
) -> Any:
    """
    Create a new institution
    """
    # Check if CNPJ already exists
    existing = db.query(Institution).filter(
        Institution.cnpj == data.cnpj,
        Institution.deleted_at.is_(None)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institution with this CNPJ already exists"
        )
    
    # Create settings dict with additional fields
    settings = {}
    if data.city:
        settings["city"] = data.city
    if data.state:
        settings["state"] = data.state
    if data.address:
        settings["address"] = data.address
    if data.phone:
        settings["phone"] = data.phone
    if data.email:
        settings["email"] = data.email
    
    # Create institution
    institution = Institution(
        name=data.name,
        cnpj=data.cnpj,
        status="active",
        settings=settings
    )
    
    db.add(institution)
    db.commit()
    db.refresh(institution)
    
    return {
        "id": institution.id,
        "name": institution.name,
        "cnpj": institution.cnpj,
        "status": institution.status,
        "is_active": True,
        "logo": institution.logo_url,
        "city": settings.get("city"),
        "state": settings.get("state"),
        "address": settings.get("address"),
        "phone": settings.get("phone"),
        "email": settings.get("email"),
        "created_at": institution.created_at.isoformat(),
    }


@router.put("/{institution_id}")
async def update_institution(
    institution_id: str,
    data: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends()
) -> Any:
    """
    Update an institution
    """
    institution = db.query(Institution).filter(
        Institution.id == institution_id,
        Institution.deleted_at.is_(None)
    ).first()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    # Update basic fields
    if data.name is not None:
        institution.name = data.name
    if data.cnpj is not None:
        # Check if new CNPJ already exists
        existing = db.query(Institution).filter(
            Institution.cnpj == data.cnpj,
            Institution.id != institution_id,
            Institution.deleted_at.is_(None)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Institution with this CNPJ already exists"
            )
        institution.cnpj = data.cnpj
    
    # Handle is_active -> status conversion
    if data.is_active is not None:
        institution.status = "active" if data.is_active else "inactive"
    
    # Update settings
    if not institution.settings:
        institution.settings = {}
    
    if data.city is not None:
        institution.settings["city"] = data.city
    if data.state is not None:
        institution.settings["state"] = data.state
    if data.address is not None:
        institution.settings["address"] = data.address
    if data.phone is not None:
        institution.settings["phone"] = data.phone
    if data.email is not None:
        institution.settings["email"] = data.email
    
    db.commit()
    db.refresh(institution)
    
    return {
        "id": institution.id,
        "name": institution.name,
        "cnpj": institution.cnpj,
        "status": institution.status,
        "is_active": institution.status == "active",
        "logo": institution.logo_url,
        "city": institution.settings.get("city") if institution.settings else None,
        "state": institution.settings.get("state") if institution.settings else None,
        "address": institution.settings.get("address") if institution.settings else None,
        "phone": institution.settings.get("phone") if institution.settings else None,
        "email": institution.settings.get("email") if institution.settings else None,
        "created_at": institution.created_at.isoformat(),
    }


@router.delete("/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(
    institution_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends()
) -> None:
    """
    Delete an institution (soft delete)
    """
    institution = db.query(Institution).filter(
        Institution.id == institution_id,
        Institution.deleted_at.is_(None)
    ).first()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    
    # Soft delete
    from datetime import datetime
    institution.deleted_at = datetime.utcnow()
    db.commit()

