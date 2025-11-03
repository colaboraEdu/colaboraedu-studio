"""
Endpoints para gerenciamento de configurações do sistema
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import secrets
import uuid

from app.database import get_db
from app.models.settings import SystemSettings
from app.schemas.settings import (
    GeneralSettingsUpdate,
    AppearanceSettingsUpdate,
    SecuritySettingsUpdate,
    NotificationSettingsUpdate,
    IntegrationSettingsUpdate,
    SystemSettingsResponse,
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


def get_or_create_settings(db: Session) -> SystemSettings:
    """Obtém as configurações ou cria uma nova instância se não existir"""
    settings = db.query(SystemSettings).first()
    
    if not settings:
        settings = SystemSettings(
            id=str(uuid.uuid4()),
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            api_key=f"sk_live_{secrets.token_urlsafe(32)}",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.get("/", response_model=SystemSettingsResponse)
async def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter configurações do sistema
    
    Requer autenticação de administrador
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar as configurações")
    
    settings = get_or_create_settings(db)
    
    return SystemSettingsResponse(
        id=str(settings.id),
        platform_name=settings.platform_name,
        platform_email=settings.platform_email,
        timezone=settings.timezone,
        language=settings.language,
        date_format=settings.date_format,
        logo_url=settings.logo_url,
        primary_color=settings.primary_color,
        secondary_color=settings.secondary_color,
        accent_color=settings.accent_color,
        maintenance_mode=settings.maintenance_mode,
        two_factor_required=settings.two_factor_required,
        session_timeout=settings.session_timeout,
        password_min_length=settings.password_min_length,
        password_require_special_chars=settings.password_require_special_chars,
        email_notifications=settings.email_notifications,
        system_notifications=settings.system_notifications,
        security_alerts=settings.security_alerts,
        weekly_reports=settings.weekly_reports,
        api_key=settings.api_key,
        webhooks=settings.webhooks or [],
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.put("/general", response_model=SystemSettingsResponse)
async def update_general_settings(
    data: GeneralSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar configurações gerais
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar as configurações")
    
    settings = get_or_create_settings(db)
    
    # Atualizar apenas os campos fornecidos
    if data.platform_name is not None:
        settings.platform_name = data.platform_name
    if data.platform_email is not None:
        settings.platform_email = data.platform_email
    if data.timezone is not None:
        settings.timezone = data.timezone
    if data.language is not None:
        settings.language = data.language
    if data.date_format is not None:
        settings.date_format = data.date_format
    
    settings.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(settings)
    
    return await get_settings(db, current_user)


@router.put("/appearance", response_model=SystemSettingsResponse)
async def update_appearance_settings(
    data: AppearanceSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar configurações de aparência
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar as configurações")
    
    settings = get_or_create_settings(db)
    
    if data.logo_url is not None:
        settings.logo_url = data.logo_url
    settings.primary_color = data.primary_color
    settings.secondary_color = data.secondary_color
    settings.accent_color = data.accent_color
    settings.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(settings)
    
    return get_settings(db, current_user)


@router.put("/security", response_model=SystemSettingsResponse)
async def update_security_settings(
    data: SecuritySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar configurações de segurança
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar as configurações")
    
    settings = get_or_create_settings(db)
    
    settings.maintenance_mode = data.maintenance_mode
    settings.two_factor_required = data.two_factor_required
    settings.session_timeout = data.session_timeout
    settings.password_min_length = data.password_min_length
    settings.password_require_special_chars = data.password_require_special_chars
    settings.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(settings)
    
    return get_settings(db, current_user)


@router.put("/notifications", response_model=SystemSettingsResponse)
async def update_notification_settings(
    data: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar configurações de notificações
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar as configurações")
    
    settings = get_or_create_settings(db)
    
    settings.email_notifications = data.email_notifications
    settings.system_notifications = data.system_notifications
    settings.security_alerts = data.security_alerts
    settings.weekly_reports = data.weekly_reports
    settings.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(settings)
    
    return get_settings(db, current_user)


@router.put("/integrations", response_model=SystemSettingsResponse)
async def update_integration_settings(
    data: IntegrationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar configurações de integrações
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem alterar as configurações")
    
    settings = get_or_create_settings(db)
    
    settings.webhooks = data.webhooks
    settings.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(settings)
    
    return get_settings(db, current_user)


@router.post("/api-key/regenerate")
async def regenerate_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Regenerar chave API
    """
    if current_user.role not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem regenerar a chave API")
    
    settings = get_or_create_settings(db)
    
    # Gerar nova chave API
    settings.api_key = f"sk_live_{secrets.token_urlsafe(32)}"
    settings.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(settings)
    
    return {
        "status": "success",
        "message": "Chave API regenerada com sucesso",
        "api_key": settings.api_key
    }
