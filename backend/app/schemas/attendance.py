"""
Attendance-related Pydantic schemas following FastAPI best practices
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from pydantic import BaseModel, Field, validator
from uuid import UUID
from enum import Enum

from .common import BaseSchema, FilterParams


class AttendanceStatus(str, Enum):
    """Attendance status options"""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"
    MEDICAL = "medical"


class AttendanceBase(BaseModel):
    """Base attendance information"""
    
    attendance_date: date = Field(
        ...,
        description="Date of attendance record",
        example="2025-10-24"
    )
    status: AttendanceStatus = Field(
        ...,
        description="Attendance status",
        example=AttendanceStatus.PRESENT
    )
    period: Optional[str] = Field(
        None,
        max_length=50,
        description="Class period or time slot",
        example="1º período"
    )
    subject: Optional[str] = Field(
        None,
        max_length=100,
        description="Subject/class name",
        example="Matemática"
    )


class AttendanceCreate(AttendanceBase):
    """Schema for creating attendance record"""
    
    student_id: UUID = Field(..., description="Student ID")
    arrival_time: Optional[time] = Field(
        None,
        description="Actual arrival time (for late arrivals)",
        example="08:15:00"
    )
    departure_time: Optional[time] = Field(
        None,
        description="Departure time (for early departures)",
        example="16:30:00"
    )
    justification: Optional[str] = Field(
        None,
        max_length=500,
        description="Justification for absence or lateness",
        example="Consulta médica"
    )
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Additional notes",
        example="Apresentou atestado médico"
    )
    
    @validator('attendance_date')
    def validate_attendance_date(cls, v):
        """Validate that attendance date is not too far in the future"""
        if v > date.today() + datetime.timedelta(days=7):
            raise ValueError('Attendance date cannot be more than 7 days in the future')
        return v


class AttendanceUpdate(BaseModel):
    """Schema for updating attendance record"""
    
    status: Optional[AttendanceStatus] = Field(None, description="Update attendance status")
    arrival_time: Optional[time] = Field(None, description="Update arrival time")
    departure_time: Optional[time] = Field(None, description="Update departure time")
    justification: Optional[str] = Field(
        None,
        max_length=500,
        description="Update justification"
    )
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Update notes"
    )


class AttendanceResponse(AttendanceBase, BaseSchema):
    """Complete attendance response schema"""
    
    id: UUID = Field(..., description="Attendance record unique identifier")
    institution_id: UUID = Field(..., description="Institution ID")
    student_id: UUID = Field(..., description="Student ID")
    recorded_by: Optional[UUID] = Field(None, description="User who recorded attendance")
    arrival_time: Optional[time] = Field(None, description="Actual arrival time")
    departure_time: Optional[time] = Field(None, description="Departure time")
    justification: Optional[str] = Field(None, description="Absence/lateness justification")
    notes: Optional[str] = Field(None, description="Additional notes")
    parent_notified: bool = Field(
        default=False,
        description="Whether parent was notified of absence"
    )
    notified_at: Optional[datetime] = Field(None, description="Parent notification timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Related data (optional)
    student: Optional[Dict[str, Any]] = Field(None, description="Student information")
    recorded_by_user: Optional[Dict[str, Any]] = Field(None, description="User who recorded")


class AttendanceListItem(BaseSchema):
    """Simplified attendance data for list responses"""
    
    id: UUID
    student_name: str = Field(..., description="Student full name")
    student_enrollment: str = Field(..., description="Student enrollment number")
    attendance_date: date
    status: AttendanceStatus
    period: Optional[str]
    subject: Optional[str]
    arrival_time: Optional[time]
    created_at: datetime


class AttendancesList(BaseModel):
    """Attendance list with metadata"""
    
    attendance_records: List[AttendanceListItem] = Field(..., description="List of attendance records")


class AttendanceFilters(FilterParams):
    """Filters for attendance queries"""
    
    student_id: Optional[UUID] = Field(
        None,
        description="Filter by student ID"
    )
    status: Optional[AttendanceStatus] = Field(
        None,
        description="Filter by attendance status"
    )
    subject: Optional[str] = Field(
        None,
        description="Filter by subject"
    )
    period: Optional[str] = Field(
        None,
        description="Filter by period"
    )
    date_from: Optional[date] = Field(
        None,
        description="Filter attendance from this date"
    )
    date_to: Optional[date] = Field(
        None,
        description="Filter attendance until this date"
    )
    recorded_by: Optional[UUID] = Field(
        None,
        description="Filter by who recorded the attendance"
    )
    parent_notified: Optional[bool] = Field(
        None,
        description="Filter by parent notification status"
    )
    
    @validator('date_to')
    def validate_date_range(cls, v, values):
        """Validate that date_to is after date_from"""
        if v and 'date_from' in values and values['date_from']:
            if v < values['date_from']:
                raise ValueError('date_to must be after date_from')
        return v


class AttendanceSummary(BaseModel):
    """Attendance summary for analytics"""
    
    student_id: Optional[UUID] = Field(None, description="Student ID (if for specific student)")
    period_start: date = Field(..., description="Summary period start date")
    period_end: date = Field(..., description="Summary period end date")
    total_days: int = Field(..., description="Total school days in period")
    present_days: int = Field(..., description="Days present")
    absent_days: int = Field(..., description="Days absent")
    late_days: int = Field(..., description="Days late")
    excused_days: int = Field(..., description="Excused absences")
    medical_days: int = Field(..., description="Medical absences")
    attendance_percentage: float = Field(
        ...,
        ge=0,
        le=100,
        description="Attendance percentage"
    )
    punctuality_percentage: float = Field(
        ...,
        ge=0,
        le=100,
        description="Punctuality percentage"
    )
    trend: Optional[str] = Field(
        None,
        description="Attendance trend (improving/declining/stable)"
    )


class StudentAttendanceHistory(BaseModel):
    """Complete attendance history for a student"""
    
    student_id: UUID = Field(..., description="Student ID")
    student_name: str = Field(..., description="Student full name")
    academic_year: int = Field(..., description="Academic year")
    records: List[AttendanceResponse] = Field(..., description="Attendance records")
    summary: AttendanceSummary = Field(..., description="Attendance summary")
    alerts: List[str] = Field(
        default_factory=list,
        description="Attendance alerts (e.g., excessive absences)"
    )


class AttendanceAlert(BaseModel):
    """Attendance alert configuration"""
    
    alert_type: str = Field(
        ...,
        description="Type of alert (consecutive_absences, low_attendance, etc.)",
        example="consecutive_absences"
    )
    threshold: int = Field(
        ...,
        ge=1,
        description="Threshold value for triggering alert"
    )
    enabled: bool = Field(default=True, description="Whether alert is enabled")
    notification_recipients: List[str] = Field(
        ...,
        description="Who should receive notifications (parents, coordinators, etc.)"
    )


class AttendanceReport(BaseModel):
    """Attendance report data"""
    
    report_type: str = Field(..., description="Type of report")
    period_start: date = Field(..., description="Report period start")
    period_end: date = Field(..., description="Report period end")
    filters: Dict[str, Any] = Field(..., description="Applied filters")
    summary_stats: Dict[str, Any] = Field(..., description="Summary statistics")
    detailed_data: List[Dict[str, Any]] = Field(..., description="Detailed attendance data")
    charts_data: Optional[Dict[str, Any]] = Field(None, description="Data for charts/graphs")
    generated_at: datetime = Field(..., description="Report generation timestamp")


class AttendanceBulkCreate(BaseModel):
    """Schema for creating multiple attendance records"""
    
    attendance_records: List[AttendanceCreate] = Field(
        ...,
        min_items=1,
        max_items=200,
        description="List of attendance records to create"
    )
    
    @validator('attendance_records')
    def validate_records_consistency(cls, v):
        """Validate attendance records for consistency"""
        if not v:
            return v
        
        # Check for duplicates
        seen = set()
        for record in v:
            key = (record.student_id, record.attendance_date, record.period)
            if key in seen:
                raise ValueError(f'Duplicate attendance record for student {record.student_id} on {record.attendance_date}')
            seen.add(key)
        
        return v


class AttendanceBulkResponse(BaseModel):
    """Response for bulk attendance creation"""
    
    total_requested: int = Field(..., description="Total records requested")
    total_created: int = Field(..., description="Total records created")
    total_errors: int = Field(..., description="Total errors")
    created_records: List[UUID] = Field(..., description="IDs of created records")
    errors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of errors"
    )


class AttendanceAnalytics(BaseModel):
    """Analytics data for attendance"""
    
    institution_summary: Dict[str, Any] = Field(
        ...,
        description="Institution-wide attendance summary"
    )
    class_comparisons: List[Dict[str, Any]] = Field(
        ...,
        description="Attendance comparison by class/grade"
    )
    trend_analysis: Dict[str, Any] = Field(
        ...,
        description="Attendance trends over time"
    )
    risk_students: List[Dict[str, Any]] = Field(
        ...,
        description="Students at risk due to poor attendance"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for improving attendance"
    )