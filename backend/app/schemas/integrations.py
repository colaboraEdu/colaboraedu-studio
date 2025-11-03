"""
Schemas para integrações
"""
from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# Integration Schemas
class IntegrationBase(BaseModel):
    """Base para integrações"""
    institution_id: str
    name: str
    service_type: str  # 'email', 'sms', 'payment', 'storage', 'analytics'
    provider: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    enabled: bool = False
    config: Optional[Dict[str, Any]] = None
    credentials: Optional[Dict[str, Any]] = None
    webhook_url: Optional[str] = None
    webhook_secret: Optional[str] = None
    webhook_events: Optional[List[str]] = None
    rate_limit: Optional[int] = None


class IntegrationCreate(IntegrationBase):
    """Schema para criação de integração"""
    pass


class IntegrationUpdate(BaseModel):
    """Schema para atualização de integração"""
    name: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    enabled: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None
    credentials: Optional[Dict[str, Any]] = None
    webhook_url: Optional[str] = None
    webhook_secret: Optional[str] = None
    webhook_events: Optional[List[str]] = None
    rate_limit: Optional[int] = None
    status: Optional[str] = None


class IntegrationOut(IntegrationBase):
    """Schema de saída de integração"""
    id: str
    status: str
    usage_count: int
    last_used_at: Optional[str] = None
    last_error: Optional[str] = None
    last_error_at: Optional[str] = None
    active: bool
    created_at: str
    updated_at: str
    created_by: str
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


class IntegrationTestRequest(BaseModel):
    """Request para testar integração"""
    test_type: str  # 'connection', 'send_email', 'send_sms', etc
    test_data: Optional[Dict[str, Any]] = None


class IntegrationTestResponse(BaseModel):
    """Response do teste de integração"""
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None
    duration_ms: Optional[int] = None


# Integration Log Schemas
class IntegrationLogBase(BaseModel):
    """Base para logs de integração"""
    integration_id: str
    institution_id: str
    event_type: str
    method: Optional[str] = None
    endpoint: Optional[str] = None
    status_code: Optional[int] = None
    success: bool = True
    request_data: Optional[Dict[str, Any]] = None
    response_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    duration_ms: Optional[int] = None


class IntegrationLogCreate(IntegrationLogBase):
    """Schema para criação de log"""
    pass


class IntegrationLogOut(IntegrationLogBase):
    """Schema de saída de log"""
    id: str
    created_at: str

    class Config:
        from_attributes = True


# Webhook Schemas
class WebhookBase(BaseModel):
    """Base para webhooks"""
    institution_id: str
    name: str
    url: str
    secret: Optional[str] = None
    events: List[str]
    enabled: bool = True
    retry_on_failure: bool = True
    max_retries: int = 3
    timeout_seconds: int = 30
    custom_headers: Optional[Dict[str, str]] = None


class WebhookCreate(WebhookBase):
    """Schema para criação de webhook"""
    pass


class WebhookUpdate(BaseModel):
    """Schema para atualização de webhook"""
    name: Optional[str] = None
    url: Optional[str] = None
    secret: Optional[str] = None
    events: Optional[List[str]] = None
    enabled: Optional[bool] = None
    retry_on_failure: Optional[bool] = None
    max_retries: Optional[int] = None
    timeout_seconds: Optional[int] = None
    custom_headers: Optional[Dict[str, str]] = None


class WebhookOut(WebhookBase):
    """Schema de saída de webhook"""
    id: str
    status: str
    total_calls: int
    successful_calls: int
    failed_calls: int
    last_called_at: Optional[str] = None
    last_error: Optional[str] = None
    active: bool
    created_at: str
    updated_at: str
    created_by: str

    class Config:
        from_attributes = True


class WebhookTestRequest(BaseModel):
    """Request para testar webhook"""
    test_payload: Optional[Dict[str, Any]] = None


class WebhookTestResponse(BaseModel):
    """Response do teste de webhook"""
    success: bool
    message: str
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    duration_ms: Optional[int] = None


# Statistics
class IntegrationStatistics(BaseModel):
    """Estatísticas de integrações"""
    total_integrations: int
    active_integrations: int
    total_api_calls: int
    successful_calls: int
    failed_calls: int
    avg_response_time_ms: Optional[float] = None
    top_integrations: List[Dict[str, Any]]
    recent_errors: List[Dict[str, Any]]
