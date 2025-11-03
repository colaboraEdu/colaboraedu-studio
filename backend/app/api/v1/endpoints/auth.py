"""
Authentication endpoints
Login, logout, refresh token, etc.
"""
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginResponse, UserResponse
from app.core.auth import AuthUtils
from app.core.security import SecurityUtils


router = APIRouter()


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    Login endpoint - OAuth2 compatible
    
    Authenticates user with email/username and password
    Returns JWT access token for API access
    """
    # Try to find user by email (most common) or username
    user = db.query(User).filter(
        User.email == form_data.username,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        # If not found by email, try by username (if implemented)
        # For now, we only support email login
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not AuthUtils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create JWT token with user data
    token_data = AuthUtils.create_token_data(
        user_id=str(user.id),
        institution_id=str(user.institution_id),
        role=user.role,
        email=user.email
    )
    
    access_token_expires = timedelta(minutes=30)  # From settings
    access_token = AuthUtils.create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    # Update last login timestamp
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 1800,  # 30 minutes in seconds
        "user": UserResponse.from_orm(user).dict()
    }


@router.post("/logout")
async def logout(
    db: Session = Depends(get_db)
) -> Any:
    """
    Logout endpoint
    
    In a JWT-based system, logout is typically handled on the client side
    by removing the token. This endpoint can be used for additional cleanup
    if needed (like blacklisting tokens in Redis)
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get current authenticated user information
    
    Returns detailed user information for the authenticated user
    Requires valid JWT token
    """
    # This will be implemented with dependencies
    # For now, return a placeholder
    return {"message": "User info endpoint - requires auth dependency"}