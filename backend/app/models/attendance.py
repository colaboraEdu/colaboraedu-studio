"""
Attendance model for tracking student presence
"""
from sqlalchemy import Column, String, Date, Boolean, ForeignKey, Index, Time, Integer

from sqlalchemy.orm import relationship

from .base import BaseModel


class Attendance(BaseModel):
    """Student attendance tracking model"""
    
    __tablename__ = "attendance"
    
    # Multi-tenancy
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    
    # Student reference
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    
    # Class/Turma reference
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    
    # Attendance details
    date = Column(Date, nullable=False)
    subject = Column(String(255))  # Optional: specific subject/class
    period = Column(String(50))  # "morning", "afternoon", "1st_period", etc.
    
    # Attendance status
    present = Column(Boolean, default=False)
    justified = Column(Boolean, default=False)
    justification = Column(String(500))  # Reason for absence if justified
    
    # Timing
    check_in_time = Column(Time)
    check_out_time = Column(Time)
    
    # Who recorded this attendance
    recorded_by = Column(String(36), ForeignKey("users.id"))
    
    # Relationships
    institution = relationship("Institution")
    student = relationship("Student", back_populates="attendances")
    class_ = relationship("Class", back_populates="attendances")
    recorded_by_user = relationship("User")
    
    def __repr__(self):
        return f"<Attendance(id={self.id}, student_id={self.student_id}, date={self.date}, present={self.present})>"


# Indexes for performance
Index("idx_attendance_institution_id", Attendance.institution_id)
Index("idx_attendance_student_id", Attendance.student_id)
Index("idx_attendance_date", Attendance.date)
Index("idx_attendance_present", Attendance.present)
# Composite index for daily attendance queries
Index("idx_attendance_daily", Attendance.institution_id, Attendance.date)
Index("idx_attendance_student_period", Attendance.student_id, Attendance.date, Attendance.period)