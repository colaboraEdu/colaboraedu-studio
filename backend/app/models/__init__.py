"""
Models package - SQLAlchemy models for colaboraEDU
All models are imported here for easy access and Alembic auto-discovery
"""
from .base import BaseModel
from .institution import Institution
from .user import User
from .student import Student
from .grade import Grade
from .occurrence import Occurrence
from .message import Message
from .attendance import Attendance
from .academic_parameters import AcademicParameter, GradeLevel, Subject
from .class_model import Class
from .assignment import Assignment, AssignmentSubmission

# Export all models for easy importing
__all__ = [
    "BaseModel",
    "Institution", 
    "User",
    "Student",
    "Grade", 
    "Occurrence",
    "Message",
    "Attendance",
    "AcademicParameter",
    "GradeLevel",
    "Subject",
    "Class",
    "Assignment",
    "AssignmentSubmission",
]