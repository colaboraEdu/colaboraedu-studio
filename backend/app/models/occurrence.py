"""
Occurrence model for disciplinary and academic incidents
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Index

from sqlalchemy.orm import relationship

from .base import BaseModel


class Occurrence(BaseModel):
    """Occurrence model for tracking student incidents and events"""
    
    __tablename__ = "occurrences"
    
    # Multi-tenancy
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    
    # Student reference
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    
    # Occurrence details
    type = Column(String(50), nullable=False)  # 'disciplinary', 'academic', 'health', 'behavioral'
    severity = Column(String(20), nullable=False)  # 'low', 'medium', 'high', 'critical'
    description = Column(Text)
    
    # Who recorded this occurrence
    recorded_by = Column(String(36), ForeignKey("users.id"))
    
    # Notification tracking (for automatic parent notifications)
    notified = Column(Boolean, default=False)
    notified_at = Column(DateTime)
    
    # Relationships
    institution = relationship("Institution", back_populates="occurrences")
    student = relationship("Student", back_populates="occurrences")
    recorded_by_user = relationship("User", back_populates="recorded_occurrences")
    
    def __repr__(self):
        return f"<Occurrence(id={self.id}, type='{self.type}', severity='{self.severity}')>"


# Indexes for performance and notification queries
Index("idx_occurrences_institution_id", Occurrence.institution_id)
Index("idx_occurrences_student_id", Occurrence.student_id)
Index("idx_occurrences_type", Occurrence.type)
Index("idx_occurrences_severity", Occurrence.severity)
Index("idx_occurrences_notified", Occurrence.notified)
Index("idx_occurrences_recorded_by", Occurrence.recorded_by)