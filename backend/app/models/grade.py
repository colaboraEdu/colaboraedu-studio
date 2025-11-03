"""
Grade model for academic performance tracking
"""
from sqlalchemy import Column, String, ForeignKey, Integer, Index

from sqlalchemy.types import DECIMAL
from sqlalchemy.orm import relationship

from .base import BaseModel


class Grade(BaseModel):
    """Academic grade/score model"""
    
    __tablename__ = "grades"
    
    # Multi-tenancy
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    
    # Student reference
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    
    # Class/Turma reference
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    
    # Academic info
    subject = Column(String(255), nullable=False)  # "Matemática", "Português", etc.
    grade = Column(DECIMAL(5, 2), nullable=False)  # 0.00 to 999.99
    semester = Column(Integer)  # 1, 2
    academic_year = Column(Integer)  # 2025, 2026, etc.
    
    # Relationships
    institution = relationship("Institution", back_populates="grades")
    student = relationship("Student", back_populates="grades")
    class_ = relationship("Class", back_populates="grades")
    
    def __repr__(self):
        return f"<Grade(id={self.id}, subject='{self.subject}', grade={self.grade})>"


# Indexes for performance
Index("idx_grades_institution_id", Grade.institution_id)
Index("idx_grades_student_id", Grade.student_id)
Index("idx_grades_subject", Grade.subject)
Index("idx_grades_academic_year", Grade.academic_year)
Index("idx_grades_semester", Grade.semester)