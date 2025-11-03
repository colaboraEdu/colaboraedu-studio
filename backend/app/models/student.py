"""
Student model for academic management
"""
from sqlalchemy import Column, String, ForeignKey, Index

from sqlalchemy import JSON
from sqlalchemy.orm import relationship

from .base import BaseModel


class Student(BaseModel):
    """Student academic profile model"""
    
    __tablename__ = "students"
    
    # Multi-tenancy
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    
    # User reference
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Academic info
    enrollment_number = Column(String(50), unique=True, nullable=False)
    current_grade = Column(String(50))  # e.g., "9º Ano A", "1º Colegial"
    academic_status = Column(String(50), default="active")  # active, graduated, transferred, etc.
    
    # Additional metadata (flexible field for custom attributes)
    extra_data = Column(JSON, default={})
    
    # Relationships
    institution = relationship("Institution", back_populates="students")
    user = relationship("User", back_populates="student_profile")
    grades = relationship("Grade", back_populates="student", lazy="dynamic")
    occurrences = relationship("Occurrence", back_populates="student", lazy="dynamic")
    
    # Classes/Turmas relationships
    classes = relationship("Class", secondary="class_students", back_populates="students")
    assignment_submissions = relationship("AssignmentSubmission", back_populates="student", lazy="dynamic")
    attendances = relationship("Attendance", back_populates="student", lazy="dynamic")
    
    def __repr__(self):
        return f"<Student(id={self.id}, enrollment='{self.enrollment_number}', grade='{self.current_grade}')>"


# Indexes for performance
Index("idx_students_institution_id", Student.institution_id)
Index("idx_students_user_id", Student.user_id)
Index("idx_students_enrollment", Student.enrollment_number)
Index("idx_students_current_grade", Student.current_grade)
Index("idx_students_academic_status", Student.academic_status)