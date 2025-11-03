"""
Schemas Pydantic para Regras e Políticas
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# SCHEMAS BASE
# ============================================================================

class RulePolicyBase(BaseModel):
    """Schema base para regras e políticas"""
    category: str = Field(..., description="Categoria: academic, usage, privacy, conduct, security")
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    content: str = Field(..., min_length=10)
    status: str = Field(default="active", description="active, inactive, draft")
    is_mandatory: bool = Field(default=False)
    applies_to: List[str] = Field(default_factory=list, description="Roles: student, teacher, admin, etc")
    version: str = Field(default="1.0")
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    order: int = Field(default=0)
    extra_data: Dict[str, Any] = Field(default_factory=dict)


class RulePolicyCreate(RulePolicyBase):
    """Schema para criação de regra/política"""
    pass


class RulePolicyUpdate(BaseModel):
    """Schema para atualização de regra/política"""
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    is_mandatory: Optional[bool] = None
    applies_to: Optional[List[str]] = None
    version: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    order: Optional[int] = None
    extra_data: Optional[Dict[str, Any]] = None


class RulePolicyOut(RulePolicyBase):
    """Schema de saída com dados completos"""
    id: str
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RulePolicyListResponse(BaseModel):
    """Response para listagem de políticas"""
    status: str = "success"
    data: List[RulePolicyOut]
    pagination: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# SCHEMAS DE ACEITAÇÃO
# ============================================================================

class PolicyAcceptanceCreate(BaseModel):
    """Schema para registrar aceitação de política"""
    policy_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class PolicyAcceptanceOut(BaseModel):
    """Schema de saída de aceitação"""
    id: str
    user_id: str
    policy_id: str
    policy_version: str
    accepted_at: datetime
    ip_address: Optional[str] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE ESTATÍSTICAS
# ============================================================================

class PolicyStatistics(BaseModel):
    """Estatísticas de uma política"""
    policy_id: str
    title: str
    total_applicable_users: int
    total_acceptances: int
    acceptance_rate: float
    pending_users: int


class RulesPoliciesStats(BaseModel):
    """Estatísticas gerais de regras e políticas"""
    total_policies: int
    active_policies: int
    mandatory_policies: int
    by_category: Dict[str, int]
    recent_updates: int  # Últimos 30 dias
