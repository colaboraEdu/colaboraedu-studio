"""
FastAPI dependencies for authentication and authorization
Multi-tenancy and RBAC support
"""
from typing import Optional, Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Institution
from app.core.auth import AuthUtils
from app.core.security import SecurityUtils


# OAuth2 scheme - points to our token endpoint
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",  # This will be our login endpoint
    scopes={
        "read": "Read access to resources",
        "write": "Write access to resources", 
        "admin": "Administrative access"
    }
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    This dependency:
    1. Extracts and validates the JWT token
    2. Fetches user from database 
    3. Validates user is active
    4. Returns user object for use in endpoints
    """
    credentials_exception = SecurityUtils.create_authentication_exception()
    
    # Decode and validate token
    token_data = AuthUtils.decode_access_token(token)
    if not token_data:
        raise credentials_exception
    
    # Extract user ID from token
    user_id = token_data.get("sub")
    institution_id = token_data.get("institution_id")
    
    if not user_id or not institution_id:
        raise credentials_exception
    
    # Fetch user from database
    user = db.query(User).filter(
        User.id == user_id,
        User.institution_id == institution_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        raise credentials_exception
    
    # Check if user is active
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (additional check)
    This is a secondary dependency that can be used for extra validation
    """
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Inactive user"
        )
    return current_user


def require_role(required_role: str):
    """
    Dependency factory for role-based access control
    
    Usage:
        @app.get("/admin-only")
        async def admin_endpoint(user: User = Depends(require_role("admin"))):
            return {"message": "Admin access granted"}
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if not SecurityUtils.check_role_permission(current_user.role, required_role):
            raise SecurityUtils.create_permission_exception(
                f"Access denied. Required role: {required_role} or higher"
            )
        return current_user
    
    return role_checker


def require_permissions(allowed_roles: list[str]):
    """
    Dependency factory for multi-role permission checking
    
    Usage:
        @app.get("/resource")
        async def endpoint(user: User = Depends(require_permissions(["admin", "professor"]))):
            return {"message": "Access granted"}
    """
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return permission_checker


def require_same_institution(current_user: User = Depends(get_current_user)):
    """
    Dependency to enforce multi-tenancy (same institution access)
    Returns a function that validates institution access for resources
    """
    def check_institution_access(resource_institution_id: str) -> bool:
        return SecurityUtils.check_institution_access(
            current_user.institution_id,
            resource_institution_id
        )
    
    return check_institution_access


# Common role-based dependencies (pre-configured)
require_admin = require_role("admin")
require_coordinator = require_role("coordenador") 
require_teacher = require_role("professor")
require_secretary = require_role("secretario")


class CurrentUser:
    """
    Helper class to get current user with different access levels
    Can be used as a type hint for cleaner code
    """
    
    @staticmethod
    def any() -> User:
        """Any authenticated user"""
        return Depends(get_current_user)
    
    @staticmethod 
    def active() -> User:
        """Active authenticated user"""
        return Depends(get_current_active_user)
    
    @staticmethod
    def admin() -> User:
        """Admin user only"""
        return Depends(require_admin)
        
    @staticmethod
    def coordinator() -> User:
        """Coordinator level or higher"""
        return Depends(require_coordinator)
        
    @staticmethod
    def teacher() -> User:
        """Teacher level or higher"""
        return Depends(require_teacher)
        
    @staticmethod
    def secretary() -> User:
        """Secretary level or higher"""  
        return Depends(require_secretary)