"""
Modelos para integrações com serviços externos
"""
from sqlalchemy import Column, String, Boolean, JSON, Text, Integer
from app.database import Base


class Integration(Base):
    """Modelo para integrações com serviços externos"""
    __tablename__ = "integrations"

    id = Column(String(36), primary_key=True, index=True)
    institution_id = Column(String(36), nullable=False, index=True)
    
    # Informações básicas
    name = Column(String(100), nullable=False)
    service_type = Column(String(50), nullable=False)  # 'email', 'sms', 'payment', 'storage', 'analytics', etc
    provider = Column(String(50), nullable=False)  # 'gmail', 'twilio', 'stripe', 'aws-s3', 'google-analytics'
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    
    # Status
    enabled = Column(Boolean, nullable=False, default=False)
    status = Column(String(20), nullable=False, default="inactive")  # 'active', 'inactive', 'error', 'pending'
    
    # Configurações
    config = Column(JSON, nullable=True)  # Configurações específicas da integração
    credentials = Column(JSON, nullable=True)  # Credenciais criptografadas
    
    # Webhook
    webhook_url = Column(String(500), nullable=True)
    webhook_secret = Column(String(100), nullable=True)
    webhook_events = Column(JSON, nullable=True)  # Eventos que disparam webhook
    
    # Limites e uso
    rate_limit = Column(Integer, nullable=True)  # Requisições por hora
    usage_count = Column(Integer, nullable=False, default=0)
    last_used_at = Column(String(50), nullable=True)
    
    # Logs
    last_error = Column(Text, nullable=True)
    last_error_at = Column(String(50), nullable=True)
    
    # Metadados
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=False)
    created_by = Column(String(36), nullable=False)
    updated_by = Column(String(36), nullable=True)


class IntegrationLog(Base):
    """Log de atividades das integrações"""
    __tablename__ = "integration_logs"

    id = Column(String(36), primary_key=True, index=True)
    integration_id = Column(String(36), nullable=False, index=True)
    institution_id = Column(String(36), nullable=False, index=True)
    
    # Informações do evento
    event_type = Column(String(50), nullable=False)  # 'api_call', 'webhook_received', 'error', etc
    method = Column(String(10), nullable=True)  # 'GET', 'POST', etc
    endpoint = Column(String(500), nullable=True)
    
    # Status
    status_code = Column(Integer, nullable=True)
    success = Column(Boolean, nullable=False, default=True)
    
    # Dados
    request_data = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metadados
    duration_ms = Column(Integer, nullable=True)  # Duração em milissegundos
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    created_at = Column(String(50), nullable=False)


class Webhook(Base):
    """Webhooks configurados pelo usuário"""
    __tablename__ = "webhooks"

    id = Column(String(36), primary_key=True, index=True)
    institution_id = Column(String(36), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    secret = Column(String(100), nullable=True)
    
    # Eventos
    events = Column(JSON, nullable=False)  # ['user.created', 'grade.updated', etc]
    
    # Status
    enabled = Column(Boolean, nullable=False, default=True)
    status = Column(String(20), nullable=False, default="active")
    
    # Configurações
    retry_on_failure = Column(Boolean, nullable=False, default=True)
    max_retries = Column(Integer, nullable=False, default=3)
    timeout_seconds = Column(Integer, nullable=False, default=30)
    
    # Headers customizados
    custom_headers = Column(JSON, nullable=True)
    
    # Estatísticas
    total_calls = Column(Integer, nullable=False, default=0)
    successful_calls = Column(Integer, nullable=False, default=0)
    failed_calls = Column(Integer, nullable=False, default=0)
    last_called_at = Column(String(50), nullable=True)
    last_error = Column(Text, nullable=True)
    
    # Metadados
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=False)
    created_by = Column(String(36), nullable=False)
