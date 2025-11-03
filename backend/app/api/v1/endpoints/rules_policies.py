"""
Endpoints para Regras e Políticas do Sistema
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.database import get_db
from app.schemas.rules_policies import (
    RulePolicyCreate,
    RulePolicyUpdate,
    RulePolicyOut,
    RulePolicyListResponse,
    PolicyAcceptanceCreate,
    PolicyAcceptanceOut,
    PolicyStatistics,
    RulesPoliciesStats
)
from app.models.rules_policies import RulePolicy, PolicyAcceptance
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


# ============================================================================
# CRUD DE REGRAS E POLÍTICAS
# ============================================================================

@router.get("/", response_model=RulePolicyListResponse)
async def list_policies(
    category: Optional[str] = None,
    status: Optional[str] = None,
    is_mandatory: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todas as regras e políticas com filtros opcionais
    """
    query = db.query(RulePolicy)
    
    # Aplicar filtros
    if category:
        query = query.filter(RulePolicy.category == category)
    if status:
        query = query.filter(RulePolicy.status == status)
    if is_mandatory is not None:
        query = query.filter(RulePolicy.is_mandatory == is_mandatory)
    
    # Ordenar por categoria e ordem
    query = query.order_by(RulePolicy.category, RulePolicy.order)
    
    # Paginação
    total = query.count()
    policies = query.offset(skip).limit(limit).all()
    
    return RulePolicyListResponse(
        status="success",
        data=policies,
        pagination={
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total
        }
    )


@router.get("/{policy_id}", response_model=RulePolicyOut)
async def get_policy(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter detalhes de uma política específica
    """
    policy = db.query(RulePolicy).filter(RulePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Política não encontrada")
    
    return policy


@router.post("/", response_model=RulePolicyOut)
async def create_policy(
    policy_data: RulePolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar nova regra ou política
    """
    # Verificar permissão (apenas admins)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar políticas")
    
    # Criar nova política
    new_policy = RulePolicy(
        id=str(uuid.uuid4()),
        **policy_data.dict(),
        created_by=str(current_user.id),
        updated_by=str(current_user.id)
    )
    
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    
    return new_policy


@router.put("/{policy_id}", response_model=RulePolicyOut)
async def update_policy(
    policy_id: str,
    policy_data: RulePolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar uma política existente
    """
    # Verificar permissão
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem atualizar políticas")
    
    policy = db.query(RulePolicy).filter(RulePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Política não encontrada")
    
    # Atualizar campos
    update_data = policy_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(policy, field, value)
    
    policy.updated_by = str(current_user.id)
    policy.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(policy)
    
    return policy


@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Excluir uma política
    """
    # Verificar permissão
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem excluir políticas")
    
    policy = db.query(RulePolicy).filter(RulePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Política não encontrada")
    
    db.delete(policy)
    db.commit()
    
    return {"status": "success", "message": "Política excluída com sucesso"}


# ============================================================================
# ACEITAÇÃO DE POLÍTICAS
# ============================================================================

@router.post("/{policy_id}/accept", response_model=PolicyAcceptanceOut)
async def accept_policy(
    policy_id: str,
    acceptance_data: PolicyAcceptanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar aceitação de uma política pelo usuário
    """
    # Verificar se política existe
    policy = db.query(RulePolicy).filter(RulePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Política não encontrada")
    
    # Verificar se já aceitou esta versão
    existing = db.query(PolicyAcceptance).filter(
        and_(
            PolicyAcceptance.user_id == str(current_user.id),
            PolicyAcceptance.policy_id == policy_id,
            PolicyAcceptance.policy_version == policy.version
        )
    ).first()
    
    if existing:
        return existing
    
    # Criar registro de aceitação
    acceptance = PolicyAcceptance(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        policy_id=policy_id,
        policy_version=policy.version,
        ip_address=acceptance_data.ip_address,
        user_agent=acceptance_data.user_agent
    )
    
    db.add(acceptance)
    db.commit()
    db.refresh(acceptance)
    
    return acceptance


@router.get("/{policy_id}/acceptances", response_model=List[PolicyAcceptanceOut])
async def get_policy_acceptances(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todas as aceitações de uma política (apenas admin)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem ver aceitações")
    
    acceptances = db.query(PolicyAcceptance).filter(
        PolicyAcceptance.policy_id == policy_id
    ).all()
    
    return acceptances


# ============================================================================
# ESTATÍSTICAS
# ============================================================================

@router.get("/stats/overview", response_model=RulesPoliciesStats)
async def get_policies_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter estatísticas gerais de regras e políticas
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem ver estatísticas")
    
    # Total de políticas
    total_policies = db.query(func.count(RulePolicy.id)).scalar()
    
    # Políticas ativas
    active_policies = db.query(func.count(RulePolicy.id)).filter(
        RulePolicy.status == "active"
    ).scalar()
    
    # Políticas obrigatórias
    mandatory_policies = db.query(func.count(RulePolicy.id)).filter(
        RulePolicy.is_mandatory == True
    ).scalar()
    
    # Por categoria
    by_category_query = db.query(
        RulePolicy.category,
        func.count(RulePolicy.id)
    ).group_by(RulePolicy.category).all()
    
    by_category = {cat: count for cat, count in by_category_query}
    
    # Atualizações recentes (últimos 30 dias)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_updates = db.query(func.count(RulePolicy.id)).filter(
        RulePolicy.updated_at >= thirty_days_ago
    ).scalar()
    
    return RulesPoliciesStats(
        total_policies=total_policies or 0,
        active_policies=active_policies or 0,
        mandatory_policies=mandatory_policies or 0,
        by_category=by_category,
        recent_updates=recent_updates or 0
    )


@router.get("/{policy_id}/stats", response_model=PolicyStatistics)
async def get_policy_stats(
    policy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obter estatísticas de uma política específica
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem ver estatísticas")
    
    policy = db.query(RulePolicy).filter(RulePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Política não encontrada")
    
    # Total de aceitações
    total_acceptances = db.query(func.count(PolicyAcceptance.id)).filter(
        and_(
            PolicyAcceptance.policy_id == policy_id,
            PolicyAcceptance.policy_version == policy.version
        )
    ).scalar() or 0
    
    # Total de usuários aplicáveis (simplificado - todos os usuários ativos)
    from app.models.user import User
    total_applicable = db.query(func.count(User.id)).filter(
        User.status == "active"
    ).scalar() or 1  # Evitar divisão por zero
    
    acceptance_rate = (total_acceptances / total_applicable) * 100
    pending_users = total_applicable - total_acceptances
    
    return PolicyStatistics(
        policy_id=policy_id,
        title=policy.title,
        total_applicable_users=total_applicable,
        total_acceptances=total_acceptances,
        acceptance_rate=round(acceptance_rate, 2),
        pending_users=max(0, pending_users)
    )


# ============================================================================
# REORDENAÇÃO
# ============================================================================

@router.post("/reorder")
async def reorder_policies(
    policy_orders: List[dict],  # [{"id": "uuid", "order": 1}, ...]
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reordenar políticas em uma categoria
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem reordenar políticas")
    
    for item in policy_orders:
        policy = db.query(RulePolicy).filter(RulePolicy.id == item["id"]).first()
        if policy:
            policy.order = item["order"]
    
    db.commit()
    
    return {"status": "success", "message": "Ordem atualizada com sucesso"}
