"""
Authentication and User Pydantic schemas following FastAPI best practices
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from uuid import UUID

from .common import BaseSchema


class LoginRequest(BaseModel):
    """Login request schema"""
    
    username: str = Field(
        ...,
        description="Username or email for login",
        example="admin@colaboraedu.com"
    )
    password: str = Field(
        ...,
        min_length=6,
        description="User password",
        example="password123"
    )


class TokenData(BaseModel):
    """JWT token payload data"""
    
    sub: str = Field(..., description="Subject (user ID)")
    institution_id: str = Field(..., description="Institution ID")
    role: str = Field(..., description="User role")
    email: str = Field(..., description="User email")
    exp: datetime = Field(..., description="Token expiration time")


class UserBase(BaseModel):
    """Base user information"""
    
    email: EmailStr = Field(
        ...,
        description="User email address",
        example="user@colaboraedu.com"
    )
    first_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User first name",
        example="João"
    )
    last_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User last name",
        example="Silva"
    )
    role: str = Field(
        ...,
        max_length=50,
        description="User role in the system",
        example="teacher"
    )


class UserCreate(UserBase):
    """Schema for creating new users"""
    
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="User password",
        example="password123"
    )
    institution_id: UUID = Field(
        ...,
        description="Institution ID where user belongs"
    )


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    
    first_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="Update first name"
    )
    last_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="Update last name"
    )
    email: Optional[EmailStr] = Field(
        None,
        description="Update email address"
    )
    password: Optional[str] = Field(
        None,
        min_length=6,
        description="Update password (optional)"
    )
    role: Optional[str] = Field(
        None,
        max_length=50,
        description="Update user role"
    )
    status: Optional[str] = Field(
        None,
        max_length=20,
        description="Update user status"
    )
    institution_id: Optional[UUID] = Field(
        None,
        description="Update institution ID"
    )


class UserResponse(UserBase, BaseSchema):
    """Complete user response schema (excludes sensitive data)"""
    
    id: UUID = Field(..., description="User unique identifier")
    institution_id: UUID = Field(..., description="Institution ID")
    status: str = Field(..., description="User status")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    @property
    def full_name(self) -> str:
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}"


class LoginResponse(BaseSchema):
    """Login response with JWT token and user info"""
    
    access_token: str = Field(
        ...,
        description="JWT access token",
        example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    token_type: str = Field(
        default="bearer",
        description="Token type",
        example="bearer"
    )
    expires_in: int = Field(
        ...,
        description="Token expiration time in seconds",
        example=3600
    )
    user: UserResponse = Field(
        ...,
        description="Authenticated user information"
    )


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    
    refresh_token: str = Field(
        ...,
        description="Valid refresh token"
    )


class PasswordChangeRequest(BaseModel):
    """Password change request"""
    
    current_password: str = Field(
        ...,
        min_length=6,
        description="Current password"
    )
    new_password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="New password"
    )
    confirm_password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Confirm new password"
    )


class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    
    email: EmailStr = Field(
        ...,
        description="Email address to send reset link"
    )


class ResetPasswordRequest(BaseModel):
    """Reset password with token"""
    
    token: str = Field(
        ...,
        description="Password reset token"
    )
    new_password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="New password"
    )
    confirm_password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Confirm new password"
    )


# Institution schemas
class InstitutionBase(BaseModel):
    """Base institution information"""
    
    name: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Institution name",
        example="Escola Municipal João Silva"
    )
    cnpj: str = Field(
        ...,
        max_length=18,
        description="CNPJ (Brazilian tax ID)",
        example="12.345.678/0001-90"
    )
    logo_url: Optional[str] = Field(
        None,
        description="Institution logo URL"
    )
    settings: Dict[str, Any] = Field(
        default_factory=dict,
        description="Institution-specific settings"
    )


class InstitutionCreate(InstitutionBase):
    """Schema for creating institutions"""
    pass


class InstitutionUpdate(BaseModel):
    """Schema for updating institution information"""
    
    name: Optional[str] = Field(
        None,
        min_length=3,
        max_length=255,
        description="Update institution name"
    )
    logo_url: Optional[str] = Field(
        None,
        description="Update logo URL"
    )
    settings: Optional[Dict[str, Any]] = Field(
        None,
        description="Update settings"
    )


class InstitutionResponse(InstitutionBase, BaseSchema):
    """Complete institution response schema"""
    
    id: UUID = Field(..., description="Institution unique identifier")
    status: str = Field(..., description="Institution status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")