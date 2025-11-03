"""
Institution model - Multi-tenancy root entity
"""
from sqlalchemy import Column, String, Text, Index
from sqlalchemy import JSON
from sqlalchemy.orm import relationship

from .base import BaseModel


class Institution(BaseModel):
    """Institution model for multi-tenancy"""
    
    __tablename__ = "institutions"
    
    name = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False)
    status = Column(String(20), default="active", nullable=False)
    logo_url = Column(Text)
    settings = Column(JSON, default={})
    
    # Relationships
    users = relationship("User", back_populates="institution", lazy="dynamic")
    students = relationship("Student", back_populates="institution", lazy="dynamic")
    grades = relationship("Grade", back_populates="institution", lazy="dynamic")
    occurrences = relationship("Occurrence", back_populates="institution", lazy="dynamic")
    messages = relationship("Message", back_populates="institution", lazy="dynamic")
    
    # New relationships
    classes = relationship("Class", back_populates="institution", lazy="dynamic")
    assignments = relationship("Assignment", back_populates="institution", lazy="dynamic")
    
    def __repr__(self):
        return f"<Institution(id={self.id}, name='{self.name}', cnpj='{self.cnpj}')>"


# Indexes
Index("idx_institutions_cnpj", Institution.cnpj)
Index("idx_institutions_status", Institution.status)