"""
User model with role-based access and multi-tenancy
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint, Index

from sqlalchemy.orm import relationship

from .base import BaseModel


class User(BaseModel):
    """User model with RBAC and multi-tenancy support"""
    
    __tablename__ = "users"
    
    # Multi-tenancy
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    
    # Basic info
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    
    # Role-based access (admin, professor, aluno, responsavel, etc.)
    role = Column(String(50), nullable=False)
    status = Column(String(20), default="active", nullable=False)
    
    # Authentication tracking
    last_login = Column(DateTime)
    fcm_token = Column(Text)  # For push notifications
    
    # Relationships
    institution = relationship("Institution", back_populates="users")
    student_profile = relationship("Student", back_populates="user", uselist=False)
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient")
    recorded_occurrences = relationship("Occurrence", back_populates="recorded_by_user")
    
    # Classes/Turmas relationships (for teachers)
    teaching_classes = relationship("Class", secondary="class_teachers", back_populates="teachers")
    created_assignments = relationship("Assignment", foreign_keys="Assignment.teacher_id", back_populates="teacher")
    
    # Table constraints
    __table_args__ = (
        UniqueConstraint('institution_id', 'email', name='uq_user_institution_email'),
    )
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


# Indexes for performance (multi-tenancy queries)
Index("idx_users_institution_id", User.institution_id)
Index("idx_users_email", User.email)
Index("idx_users_role", User.role)
Index("idx_users_status", User.status)