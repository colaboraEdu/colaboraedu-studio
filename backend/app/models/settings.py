"""
Models para configurações do sistema
"""

from sqlalchemy import Column, String, Boolean, Integer, Text, JSON
import uuid

from app.database import Base


class SystemSettings(Base):
    """Modelo para configurações do sistema"""
    __tablename__ = "system_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Configurações Gerais
    platform_name = Column(String(255), default="colaboraEDU")
    platform_email = Column(String(255), default="contato@colaboraedu.com")
    timezone = Column(String(100), default="America/Sao_Paulo")
    language = Column(String(10), default="pt-BR")
    date_format = Column(String(50), default="DD/MM/YYYY")
    
    # Aparência
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#14B8A6")
    secondary_color = Column(String(7), default="#0891B2")
    accent_color = Column(String(7), default="#F59E0B")
    
    # Segurança
    maintenance_mode = Column(Boolean, default=False)
    two_factor_required = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=60)  # minutos
    password_min_length = Column(Integer, default=8)
    password_require_special_chars = Column(Boolean, default=True)
    
    # Notificações
    email_notifications = Column(Boolean, default=True)
    system_notifications = Column(Boolean, default=True)
    security_alerts = Column(Boolean, default=True)
    weekly_reports = Column(Boolean, default=False)
    
    # Integrações
    api_key = Column(String(100), nullable=True)
    webhooks = Column(JSON, default=list)  # Lista de URLs de webhooks
    
    # Metadados
    created_at = Column(String(50))
    updated_at = Column(String(50))

    def __repr__(self):
        return f"<SystemSettings(id={self.id}, platform_name={self.platform_name})>"
