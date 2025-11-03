"""
Schemas para configurações do sistema
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class GeneralSettingsUpdate(BaseModel):
    """Schema para atualizar configurações gerais"""
    platform_name: Optional[str] = Field(None, min_length=3, max_length=255)
    platform_email: Optional[EmailStr] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    date_format: Optional[str] = None


class AppearanceSettingsUpdate(BaseModel):
    """Schema para atualizar configurações de aparência"""
    logo_url: Optional[str] = None
    primary_color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    secondary_color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    accent_color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')


class SecuritySettingsUpdate(BaseModel):
    """Schema para atualizar configurações de segurança"""
    maintenance_mode: bool
    two_factor_required: bool
    session_timeout: int = Field(..., ge=5, le=1440)
    password_min_length: int = Field(..., ge=6, le=32)
    password_require_special_chars: bool


class NotificationSettingsUpdate(BaseModel):
    """Schema para atualizar configurações de notificações"""
    email_notifications: bool
    system_notifications: bool
    security_alerts: bool
    weekly_reports: bool


class IntegrationSettingsUpdate(BaseModel):
    """Schema para atualizar configurações de integrações"""
    webhooks: List[str] = []


class SystemSettingsResponse(BaseModel):
    """Schema de resposta das configurações"""
    id: str
    
    # Geral
    platform_name: str
    platform_email: str
    timezone: str
    language: str
    date_format: str
    
    # Aparência
    logo_url: Optional[str]
    primary_color: str
    secondary_color: str
    accent_color: str
    
    # Segurança
    maintenance_mode: bool
    two_factor_required: bool
    session_timeout: int
    password_min_length: int
    password_require_special_chars: bool
    
    # Notificações
    email_notifications: bool
    system_notifications: bool
    security_alerts: bool
    weekly_reports: bool
    
    # Integrações
    api_key: Optional[str]
    webhooks: List[str]
    
    # Metadados
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
