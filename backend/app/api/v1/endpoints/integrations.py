"""
Endpoints para integrações
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime
import uuid
import time

from app.database import get_db
from app.api.deps import get_current_user
from app.models.integrations import Integration, IntegrationLog, Webhook
from app.schemas.integrations import (
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationOut,
    IntegrationTestRequest,
    IntegrationTestResponse,
    IntegrationLogOut,
    WebhookCreate,
    WebhookUpdate,
    WebhookOut,
    WebhookTestRequest,
    WebhookTestResponse,
    IntegrationStatistics
)

router = APIRouter()


# ============================================================================
# INTEGRATIONS CRUD
# ============================================================================

@router.get("/integrations", response_model=List[IntegrationOut])
def list_integrations(
    institution_id: str = None,
    service_type: str = None,
    enabled: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Listar integrações"""
    query = db.query(Integration).filter(Integration.active == True)
    
    if institution_id:
        query = query.filter(Integration.institution_id == institution_id)
    if service_type:
        query = query.filter(Integration.service_type == service_type)
    if enabled is not None:
        query = query.filter(Integration.enabled == enabled)
    
    integrations = query.order_by(desc(Integration.created_at)).offset(skip).limit(limit).all()
    return integrations


@router.get("/integrations/{integration_id}", response_model=IntegrationOut)
def get_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter integração por ID"""
    integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.active == True
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    return integration


@router.post("/integrations", response_model=IntegrationOut, status_code=status.HTTP_201_CREATED)
def create_integration(
    integration: IntegrationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Criar nova integração"""
    now = datetime.utcnow().isoformat()
    
    db_integration = Integration(
        id=str(uuid.uuid4()),
        **integration.model_dump(),
        status="inactive",
        usage_count=0,
        active=True,
        created_at=now,
        updated_at=now,
        created_by=current_user.get("user_id", "system")
    )
    
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    
    return db_integration


@router.put("/integrations/{integration_id}", response_model=IntegrationOut)
def update_integration(
    integration_id: str,
    integration_update: IntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Atualizar integração"""
    db_integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.active == True
    ).first()
    
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    update_data = integration_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    update_data["updated_by"] = current_user.get("user_id", "system")
    
    for field, value in update_data.items():
        setattr(db_integration, field, value)
    
    db.commit()
    db.refresh(db_integration)
    
    return db_integration


@router.delete("/integrations/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletar integração (soft delete)"""
    db_integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.active == True
    ).first()
    
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    db_integration.active = False
    db_integration.updated_at = datetime.utcnow().isoformat()
    db_integration.updated_by = current_user.get("user_id", "system")
    
    db.commit()
    
    return None


@router.post("/integrations/{integration_id}/test", response_model=IntegrationTestResponse)
def test_integration(
    integration_id: str,
    test_request: IntegrationTestRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Testar integração"""
    db_integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.active == True
    ).first()
    
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    start_time = time.time()
    
    try:
        # Simular teste de integração
        # Em produção, fazer chamada real à API
        success = True
        message = f"Teste de {db_integration.provider} realizado com sucesso"
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Criar log
        log = IntegrationLog(
            id=str(uuid.uuid4()),
            integration_id=integration_id,
            institution_id=db_integration.institution_id,
            event_type="test",
            success=success,
            duration_ms=duration_ms,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(log)
        
        # Atualizar última utilização
        db_integration.last_used_at = datetime.utcnow().isoformat()
        db_integration.usage_count += 1
        
        db.commit()
        
        return IntegrationTestResponse(
            success=success,
            message=message,
            duration_ms=duration_ms
        )
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Criar log de erro
        log = IntegrationLog(
            id=str(uuid.uuid4()),
            integration_id=integration_id,
            institution_id=db_integration.institution_id,
            event_type="test",
            success=False,
            error_message=str(e),
            duration_ms=duration_ms,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(log)
        
        db_integration.last_error = str(e)
        db_integration.last_error_at = datetime.utcnow().isoformat()
        
        db.commit()
        
        return IntegrationTestResponse(
            success=False,
            message=f"Erro ao testar integração: {str(e)}",
            duration_ms=duration_ms
        )


@router.post("/integrations/{integration_id}/toggle", response_model=IntegrationOut)
def toggle_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Ativar/desativar integração"""
    db_integration = db.query(Integration).filter(
        Integration.id == integration_id,
        Integration.active == True
    ).first()
    
    if not db_integration:
        raise HTTPException(status_code=404, detail="Integração não encontrada")
    
    db_integration.enabled = not db_integration.enabled
    db_integration.status = "active" if db_integration.enabled else "inactive"
    db_integration.updated_at = datetime.utcnow().isoformat()
    db_integration.updated_by = current_user.get("user_id", "system")
    
    db.commit()
    db.refresh(db_integration)
    
    return db_integration


# ============================================================================
# INTEGRATION LOGS
# ============================================================================

@router.get("/integrations/{integration_id}/logs", response_model=List[IntegrationLogOut])
def get_integration_logs(
    integration_id: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter logs de uma integração"""
    logs = db.query(IntegrationLog).filter(
        IntegrationLog.integration_id == integration_id
    ).order_by(desc(IntegrationLog.created_at)).offset(skip).limit(limit).all()
    
    return logs


# ============================================================================
# WEBHOOKS CRUD
# ============================================================================

@router.get("/webhooks", response_model=List[WebhookOut])
def list_webhooks(
    institution_id: str = None,
    enabled: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Listar webhooks"""
    query = db.query(Webhook).filter(Webhook.active == True)
    
    if institution_id:
        query = query.filter(Webhook.institution_id == institution_id)
    if enabled is not None:
        query = query.filter(Webhook.enabled == enabled)
    
    webhooks = query.order_by(desc(Webhook.created_at)).offset(skip).limit(limit).all()
    return webhooks


@router.get("/webhooks/{webhook_id}", response_model=WebhookOut)
def get_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter webhook por ID"""
    webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.active == True
    ).first()
    
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook não encontrado")
    
    return webhook


@router.post("/webhooks", response_model=WebhookOut, status_code=status.HTTP_201_CREATED)
def create_webhook(
    webhook: WebhookCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Criar novo webhook"""
    now = datetime.utcnow().isoformat()
    
    db_webhook = Webhook(
        id=str(uuid.uuid4()),
        **webhook.model_dump(),
        status="active",
        total_calls=0,
        successful_calls=0,
        failed_calls=0,
        active=True,
        created_at=now,
        updated_at=now,
        created_by=current_user.get("user_id", "system")
    )
    
    db.add(db_webhook)
    db.commit()
    db.refresh(db_webhook)
    
    return db_webhook


@router.put("/webhooks/{webhook_id}", response_model=WebhookOut)
def update_webhook(
    webhook_id: str,
    webhook_update: WebhookUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Atualizar webhook"""
    db_webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.active == True
    ).first()
    
    if not db_webhook:
        raise HTTPException(status_code=404, detail="Webhook não encontrado")
    
    update_data = webhook_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    for field, value in update_data.items():
        setattr(db_webhook, field, value)
    
    db.commit()
    db.refresh(db_webhook)
    
    return db_webhook


@router.delete("/webhooks/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletar webhook (soft delete)"""
    db_webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.active == True
    ).first()
    
    if not db_webhook:
        raise HTTPException(status_code=404, detail="Webhook não encontrado")
    
    db_webhook.active = False
    db_webhook.updated_at = datetime.utcnow().isoformat()
    
    db.commit()
    
    return None


@router.post("/webhooks/{webhook_id}/test", response_model=WebhookTestResponse)
def test_webhook(
    webhook_id: str,
    test_request: WebhookTestRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Testar webhook"""
    db_webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.active == True
    ).first()
    
    if not db_webhook:
        raise HTTPException(status_code=404, detail="Webhook não encontrado")
    
    start_time = time.time()
    
    try:
        # Simular envio de webhook
        # Em produção, fazer chamada HTTP real
        success = True
        message = "Webhook testado com sucesso"
        status_code = 200
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Atualizar estatísticas
        db_webhook.total_calls += 1
        db_webhook.successful_calls += 1
        db_webhook.last_called_at = datetime.utcnow().isoformat()
        db_webhook.updated_at = datetime.utcnow().isoformat()
        
        db.commit()
        
        return WebhookTestResponse(
            success=success,
            message=message,
            status_code=status_code,
            duration_ms=duration_ms
        )
        
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        
        db_webhook.total_calls += 1
        db_webhook.failed_calls += 1
        db_webhook.last_error = str(e)
        db_webhook.updated_at = datetime.utcnow().isoformat()
        
        db.commit()
        
        return WebhookTestResponse(
            success=False,
            message=f"Erro ao testar webhook: {str(e)}",
            duration_ms=duration_ms
        )


@router.post("/webhooks/{webhook_id}/toggle", response_model=WebhookOut)
def toggle_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Ativar/desativar webhook"""
    db_webhook = db.query(Webhook).filter(
        Webhook.id == webhook_id,
        Webhook.active == True
    ).first()
    
    if not db_webhook:
        raise HTTPException(status_code=404, detail="Webhook não encontrado")
    
    db_webhook.enabled = not db_webhook.enabled
    db_webhook.status = "active" if db_webhook.enabled else "inactive"
    db_webhook.updated_at = datetime.utcnow().isoformat()
    
    db.commit()
    db.refresh(db_webhook)
    
    return db_webhook


# ============================================================================
# STATISTICS
# ============================================================================

@router.get("/statistics", response_model=IntegrationStatistics)
def get_integration_statistics(
    institution_id: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter estatísticas de integrações"""
    query = db.query(Integration).filter(Integration.active == True)
    
    if institution_id:
        query = query.filter(Integration.institution_id == institution_id)
    
    total_integrations = query.count()
    active_integrations = query.filter(Integration.enabled == True).count()
    
    # Calcular totais de chamadas
    total_api_calls = db.query(func.sum(Integration.usage_count)).filter(
        Integration.active == True
    ).scalar() or 0
    
    # Logs de sucesso e erro
    logs_query = db.query(IntegrationLog)
    if institution_id:
        logs_query = logs_query.filter(IntegrationLog.institution_id == institution_id)
    
    successful_calls = logs_query.filter(IntegrationLog.success == True).count()
    failed_calls = logs_query.filter(IntegrationLog.success == False).count()
    
    # Tempo médio de resposta
    avg_response_time = db.query(func.avg(IntegrationLog.duration_ms)).filter(
        IntegrationLog.duration_ms.isnot(None)
    ).scalar()
    
    # Top integrações
    top_integrations = []
    top_query = query.order_by(desc(Integration.usage_count)).limit(5).all()
    for integration in top_query:
        top_integrations.append({
            "id": integration.id,
            "name": integration.name,
            "provider": integration.provider,
            "usage_count": integration.usage_count
        })
    
    # Erros recentes
    recent_errors = []
    error_logs = logs_query.filter(
        IntegrationLog.success == False
    ).order_by(desc(IntegrationLog.created_at)).limit(5).all()
    
    for log in error_logs:
        recent_errors.append({
            "integration_id": log.integration_id,
            "error_message": log.error_message,
            "created_at": log.created_at
        })
    
    return IntegrationStatistics(
        total_integrations=total_integrations,
        active_integrations=active_integrations,
        total_api_calls=int(total_api_calls),
        successful_calls=successful_calls,
        failed_calls=failed_calls,
        avg_response_time_ms=float(avg_response_time) if avg_response_time else None,
        top_integrations=top_integrations,
        recent_errors=recent_errors
    )
