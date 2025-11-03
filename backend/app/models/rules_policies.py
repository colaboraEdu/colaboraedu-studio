"""
Models para Regras e Políticas do Sistema
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, JSON
from app.database import Base


class RulePolicy(Base):
    """
    Model para armazenar regras e políticas do sistema
    """
    __tablename__ = "rules_policies"
    
    id = Column(String(36), primary_key=True, index=True)
    
    # Identificação
    category = Column(String(50), nullable=False)  # academic, usage, privacy, conduct, security
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    
    # Status e visibilidade
    status = Column(String(20), default="active")  # active, inactive, draft
    is_mandatory = Column(Boolean, default=False)  # Usuários devem aceitar?
    applies_to = Column(JSON, default=list)  # Lista de roles: ["student", "teacher", "admin"]
    
    # Versionamento
    version = Column(String(20), default="1.0")
    effective_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    
    # Ordem de exibição
    order = Column(Integer, default=0)
    
    # Metadados
    created_by = Column(String(36), nullable=True)
    updated_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Campos adicionais
    extra_data = Column(JSON, default=dict)  # Campos customizáveis (metadata é reservado)


class PolicyAcceptance(Base):
    """
    Model para rastrear aceitação de políticas por usuários
    """
    __tablename__ = "policy_acceptances"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    policy_id = Column(String(36), nullable=False, index=True)
    policy_version = Column(String(20), nullable=False)
    
    accepted_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
