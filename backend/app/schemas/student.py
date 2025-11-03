"""
Student-related Pydantic schemas following FastAPI best practices
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, EmailStr, validator
from uuid import UUID

from .common import BaseSchema, FilterParams


class StudentBaseInfo(BaseModel):
    """Base student information shared across schemas"""
    
    enrollment_number: str = Field(
        ...,
        max_length=50,
        description="Unique student enrollment number",
        example="2025001"
    )
    current_grade: Optional[str] = Field(
        None,
        max_length=50,
        description="Current grade/class",
        example="9º Ano A"
    )
    academic_status: str = Field(
        default="active",
        max_length=50,
        description="Academic status",
        example="active"
    )


class StudentUserCreate(BaseModel):
    """Schema for creating student user data"""
    
    email: EmailStr = Field(
        ...,
        description="Student email address",
        example="aluno@colaboraedu.com"
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Student password",
        example="password123"
    )
    first_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Student first name",
        example="João"
    )
    last_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Student last name",
        example="Silva"
    )


class StudentCreate(StudentBaseInfo):
    """Schema for creating a new student"""
    
    user: StudentUserCreate = Field(
        ...,
        description="User data for the student"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional student metadata",
        example={"phone": "+55 11 99999-9999", "parent_contact": "parent@email.com"}
    )
    
    @validator('enrollment_number')
    def validate_enrollment_number(cls, v):
        """Validate enrollment number format"""
        if not v.isalnum():
            raise ValueError('Enrollment number must be alphanumeric')
        return v.upper()


class StudentUpdate(BaseModel):
    """Schema for updating student information"""
    
    current_grade: Optional[str] = Field(
        None,
        max_length=50,
        description="Update current grade"
    )
    academic_status: Optional[str] = Field(
        None,
        max_length=50,
        description="Update academic status"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Update student metadata"
    )


class StudentUser(BaseSchema):
    """Student user information for responses"""
    
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    status: str
    last_login: Optional[datetime]
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class StudentResponse(StudentBaseInfo, BaseSchema):
    """Complete student response schema"""
    
    id: UUID = Field(..., description="Student unique identifier")
    institution_id: UUID = Field(..., description="Institution ID")
    user_id: UUID = Field(..., description="Associated user ID")
    user: Optional[StudentUser] = Field(None, description="User information")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional data")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class StudentListItem(BaseSchema):
    """Simplified student data for list responses"""
    
    id: UUID
    enrollment_number: str
    full_name: str = Field(..., description="Student full name")
    current_grade: Optional[str]
    academic_status: str
    email: EmailStr
    created_at: datetime


class StudentList(BaseModel):
    """Student list with metadata"""
    
    students: List[StudentListItem] = Field(..., description="List of students")


class StudentFilters(FilterParams):
    """Filters for student queries"""
    
    grade: Optional[str] = Field(
        None,
        description="Filter by grade",
        example="9º Ano"
    )
    academic_status: Optional[str] = Field(
        None,
        description="Filter by academic status",
        example="active"
    )
    enrollment_year: Optional[int] = Field(
        None,
        ge=2020,
        le=2030,
        description="Filter by enrollment year"
    )


class StudentGradeSummary(BaseModel):
    """Student grade summary"""
    
    subject: str = Field(..., description="Subject name")
    current_grade: Optional[float] = Field(None, description="Current grade")
    grade_count: int = Field(..., description="Number of grades")
    average: Optional[float] = Field(None, description="Grade average")
    trend: Optional[str] = Field(None, description="Grade trend (improving/declining/stable)")


class StudentAttendanceSummary(BaseModel):
    """Student attendance summary"""
    
    total_days: int = Field(..., description="Total school days")
    present_days: int = Field(..., description="Days present")
    absent_days: int = Field(..., description="Days absent")
    justified_absences: int = Field(..., description="Justified absences")
    attendance_percentage: float = Field(..., description="Attendance percentage")


class StudentOccurrenceSummary(BaseModel):
    """Student occurrences summary"""
    
    total_occurrences: int = Field(..., description="Total occurrences")
    by_severity: Dict[str, int] = Field(..., description="Occurrences by severity")
    by_type: Dict[str, int] = Field(..., description="Occurrences by type")
    recent_occurrences: List[Dict[str, Any]] = Field(
        ...,
        description="Recent occurrences"
    )


class StudentDashboard(BaseSchema):
    """Complete student dashboard data"""
    
    student: StudentResponse = Field(..., description="Student information")
    grades: List[StudentGradeSummary] = Field(..., description="Grade summaries")
    attendance: StudentAttendanceSummary = Field(..., description="Attendance summary")
    occurrences: StudentOccurrenceSummary = Field(..., description="Occurrences summary")
    overall_average: Optional[float] = Field(None, description="Overall grade average")
    next_events: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Upcoming events and deadlines"
    )
    announcements: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Recent announcements"
    )


class StudentAnalytics(BaseModel):
    """Student analytics data"""
    
    academic_performance: Dict[str, Any] = Field(
        ...,
        description="Academic performance metrics"
    )
    attendance_trends: Dict[str, Any] = Field(
        ...,
        description="Attendance trend data"
    )
    behavioral_insights: Dict[str, Any] = Field(
        ...,
        description="Behavioral insights from occurrences"
    )
    improvement_suggestions: List[str] = Field(
        default_factory=list,
        description="AI-generated improvement suggestions"
    )