"""
User management endpoints
CRUD operations for users with RBAC and multi-tenancy
"""
from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    UserResponse, 
    UserCreate, 
    UserUpdate,
    PaginatedResponse,
    PaginationParams
)
from app.api.deps import CurrentUser
from app.core.auth import AuthUtils
from app.core.security import SecurityUtils


router = APIRouter()


@router.get("", response_model=PaginatedResponse)
async def get_users(
    current_user: User = CurrentUser.coordinator(),  # Coordinator level or higher
    pagination: PaginationParams = Depends(),
    role_filter: str = Query(None, description="Filter by role"),
    status_filter: str = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get list of users with pagination and filters
    
    Requires coordinator level access or higher
    Only returns users from the same institution (multi-tenancy)
    """
    query = db.query(User).filter(
        User.institution_id == current_user.institution_id,
        User.deleted_at.is_(None)
    )
    
    # Apply filters
    if role_filter:
        query = query.filter(User.role == role_filter)
    if status_filter:
        query = query.filter(User.status == status_filter)
    
    # Count total for pagination
    total = query.count()
    
    # Apply pagination
    users = query.offset(
        (pagination.page - 1) * pagination.page_size
    ).limit(pagination.page_size).all()
    
    # Convert to response models
    user_responses = [UserResponse.from_orm(user) for user in users]
    
    return PaginatedResponse.create(
        items=user_responses,
        page=pagination.page,
        page_size=pagination.page_size,
        total=total
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = CurrentUser.coordinator(),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get specific user by ID
    
    Requires coordinator level access or higher
    Users can access their own profile regardless of role
    """
    # Converter UUID para string sem hífens para comparação
    user_id_str = str(user_id).replace('-', '')
    
    user = db.query(User).filter(
        User.id == user_id_str,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check access permissions
    if not SecurityUtils.check_institution_access(
        current_user.institution_id, 
        str(user.institution_id)
    ):
        raise SecurityUtils.create_permission_exception("Access denied")
    
    # Allow users to access their own profile
    if str(current_user.id) != str(user_id):
        # Check if user has permission to view other users
        if not SecurityUtils.check_role_permission(current_user.role, "coordenador"):
            raise SecurityUtils.create_permission_exception(
                "You can only access your own profile"
            )
    
    return UserResponse.from_orm(user)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = CurrentUser.admin(),  # Only admins can create users
    db: Session = Depends(get_db)
) -> Any:
    """
    Create new user
    
    Requires admin level access
    User will be created in the same institution as the admin
    """
    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email,
        User.deleted_at.is_(None)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = AuthUtils.hash_password(user_data.password)
    
    # Create user with current user's institution (multi-tenancy)
    user = User(
        institution_id=current_user.institution_id,
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        status="active"
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: User = CurrentUser.coordinator(),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update existing user
    
    Requires coordinator level access or higher
    Users can update their own basic info
    """
    # Converter UUID para string sem hífens para comparação
    user_id_str = str(user_id).replace('-', '')
    
    user = db.query(User).filter(
        User.id == user_id_str,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check access permissions
    if not SecurityUtils.check_institution_access(
        current_user.institution_id,
        str(user.institution_id)
    ):
        raise SecurityUtils.create_permission_exception("Access denied")
    
    # Role-based update permissions
    current_user_id_str = str(current_user.id).replace('-', '')
    is_self_update = current_user_id_str == user_id_str
    
    if is_self_update:
        # Users can update their own basic info (not role/status)
        allowed_fields = {"first_name", "last_name"}
        update_data = {k: v for k, v in user_data.dict(exclude_unset=True).items() 
                      if k in allowed_fields}
    else:
        # Coordinators and admins can update more fields
        if not SecurityUtils.check_role_permission(current_user.role, "coordenador"):
            raise SecurityUtils.create_permission_exception(
                "Insufficient permissions to update other users"
            )
        update_data = user_data.dict(exclude_unset=True)
    
    # Hash password if provided
    if "password" in update_data and update_data["password"]:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        update_data["password_hash"] = pwd_context.hash(update_data["password"])
        del update_data["password"]  # Remove plain password
    
    # Apply updates
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: User = CurrentUser.admin(),  # Only admins can delete users
    db: Session = Depends(get_db)
) -> Any:
    """
    Delete (soft delete) user
    
    Requires admin level access
    Cannot delete yourself
    """
    # Converter UUID para string sem hífens para comparação
    user_id_str = str(user_id).replace('-', '')
    current_user_id_str = str(current_user.id).replace('-', '')
    
    if current_user_id_str == user_id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )
    
    user = db.query(User).filter(
        User.id == user_id_str,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check institution access
    if not SecurityUtils.check_institution_access(
        current_user.institution_id,
        str(user.institution_id)
    ):
        raise SecurityUtils.create_permission_exception("Access denied")
    
    # Soft delete (set deleted_at timestamp)
    from datetime import datetime
    user.deleted_at = datetime.utcnow()
    user.status = "deleted"
    
    db.commit()
    
    return {"message": "User deleted successfully", "user_id": str(user_id)}
    
    return {"message": "User successfully deleted"}