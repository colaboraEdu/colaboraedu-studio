"""
Grade-related Pydantic schemas following FastAPI best practices
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, validator
from uuid import UUID

from .common import BaseSchema, FilterParams


class GradeBase(BaseModel):
    """Base grade information"""
    
    subject: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Subject name",
        example="Matemática"
    )
    grade_value: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Grade value (0.00 to 10.00)",
        example=8.50
    )
    weight: Optional[float] = Field(
        None,
        ge=0.0,
        le=10.0,
        description="Grade weight for average calculation",
        example=1.0
    )
    grade_type: str = Field(
        ...,
        max_length=50,
        description="Type of grade (exam, assignment, project, etc.)",
        example="prova"
    )


class GradeCreate(GradeBase):
    """Schema for creating a new grade"""
    
    student_id: UUID = Field(..., description="Student ID")
    semester: Optional[int] = Field(
        None,
        ge=1,
        le=2,
        description="Semester (1 or 2)",
        example=1
    )
    academic_year: int = Field(
        ...,
        ge=2020,
        le=2030,
        description="Academic year",
        example=2025
    )
    evaluation_date: Optional[date] = Field(
        None,
        description="Date of evaluation",
        example="2025-10-24"
    )
    comments: Optional[str] = Field(
        None,
        max_length=500,
        description="Comments about the grade",
        example="Excellent performance in algebra"
    )
    
    @validator('academic_year')
    def validate_academic_year(cls, v):
        current_year = datetime.now().year
        if v < current_year - 2 or v > current_year + 1:
            raise ValueError('Academic year must be within reasonable range')
        return v


class GradeUpdate(BaseModel):
    """Schema for updating grade information"""
    
    grade_value: float
    weight: Optional[float] = Field(None, description="Grade weight")
    comments: Optional[str] = Field(
        None,
        max_length=500,
        description="Update comments"
    )
    evaluation_date: Optional[date] = Field(
        None,
        description="Update evaluation date"
    )


class GradeResponse(GradeBase, BaseSchema):
    """Complete grade response schema"""
    
    id: UUID = Field(..., description="Grade unique identifier")
    institution_id: UUID = Field(..., description="Institution ID")
    student_id: UUID = Field(..., description="Student ID")
    semester: Optional[int] = Field(None, description="Semester")
    academic_year: int = Field(..., description="Academic year")
    evaluation_date: Optional[date] = Field(None, description="Evaluation date")
    comments: Optional[str] = Field(None, description="Grade comments")
    recorded_by: Optional[UUID] = Field(None, description="Teacher who recorded the grade")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Related data (optional)
    student: Optional[Dict[str, Any]] = Field(None, description="Student information")
    recorded_by_user: Optional[Dict[str, Any]] = Field(None, description="Teacher information")


class GradeListItem(BaseSchema):
    """Simplified grade data for list responses"""
    
    id: UUID
    subject: str
    grade_value: float
    grade_type: str
    student_name: str = Field(..., description="Student full name")
    evaluation_date: Optional[date]
    created_at: datetime


class GradesList(BaseModel):
    """Grade list with metadata"""
    
    grades: List[GradeListItem] = Field(..., description="List of grades")


class GradeFilters(FilterParams):
    """Filters for grade queries"""
    
    subject: Optional[str] = Field(
        None,
        description="Filter by subject",
        example="Matemática"
    )
    semester: Optional[int] = Field(
        None,
        ge=1,
        le=2,
        description="Filter by semester"
    )
    academic_year: Optional[int] = Field(
        None,
        ge=2020,
        le=2030,
        description="Filter by academic year"
    )
    grade_type: Optional[str] = Field(
        None,
        description="Filter by grade type",
        example="prova"
    )
    min_grade: Optional[float] = Field(
        None,
        ge=0.0,
        le=10.0,
        description="Minimum grade filter"
    )
    max_grade: Optional[float] = Field(
        None,
        ge=0.0,
        le=10.0,
        description="Maximum grade filter"
    )
    student_id: Optional[UUID] = Field(
        None,
        description="Filter by student ID"
    )


class SubjectGradeSummary(BaseModel):
    """Summary of grades for a specific subject"""
    
    subject: str = Field(..., description="Subject name")
    total_grades: int = Field(..., description="Total number of grades")
    average: Optional[float] = Field(None, description="Grade average")
    weighted_average: Optional[float] = Field(None, description="Weighted average")
    highest_grade: Optional[float] = Field(None, description="Highest grade")
    lowest_grade: Optional[float] = Field(None, description="Lowest grade")
    trend: Optional[str] = Field(
        None,
        description="Grade trend (improving/declining/stable)"
    )
    last_grade: Optional[GradeResponse] = Field(None, description="Most recent grade")


class StudentGradesSummary(BaseModel):
    """Complete grades summary for a student"""
    
    student_id: UUID = Field(..., description="Student ID")
    academic_year: int = Field(..., description="Academic year")
    semester: Optional[int] = Field(None, description="Semester (if specified)")
    subjects: List[SubjectGradeSummary] = Field(..., description="Subject summaries")
    overall_average: Optional[float] = Field(None, description="Overall average")
    total_grades: int = Field(..., description="Total number of grades")
    performance_level: Optional[str] = Field(
        None,
        description="Performance level (excellent/good/satisfactory/needs_improvement)"
    )


class GradeTrend(BaseModel):
    """Grade trend data for analytics"""
    
    period: str = Field(..., description="Time period")
    average: float = Field(..., description="Average grade for period")
    grade_count: int = Field(..., description="Number of grades in period")


class GradeAnalytics(BaseModel):
    """Grade analytics data"""
    
    subject_performance: List[SubjectGradeSummary] = Field(
        ...,
        description="Performance by subject"
    )
    grade_trends: List[GradeTrend] = Field(
        ...,
        description="Grade trends over time"
    )
    grade_distribution: Dict[str, int] = Field(
        ...,
        description="Distribution of grades by range"
    )
    comparison_data: Optional[Dict[str, Any]] = Field(
        None,
        description="Comparison with class/school averages"
    )


class GradeBulkCreate(BaseModel):
    """Schema for creating multiple grades at once"""
    
    grades: List[GradeCreate] = Field(
        ...,
        min_items=1,
        max_items=50,
        description="List of grades to create"
    )
    
    @validator('grades')
    def validate_grades_consistency(cls, v):
        """Validate that all grades have consistent academic year and semester"""
        if not v:
            return v
        
        first_grade = v[0]
        for grade in v[1:]:
            if grade.academic_year != first_grade.academic_year:
                raise ValueError('All grades must have the same academic year')
            if grade.semester != first_grade.semester:
                raise ValueError('All grades must have the same semester')
        
        return v


class GradeBulkResponse(BaseModel):
    """Response for bulk grade creation"""
    
    total_requested: int = Field(..., description="Total grades requested")
    total_created: int = Field(..., description="Total grades created")
    total_errors: int = Field(..., description="Total errors")
    created_grades: List[UUID] = Field(..., description="IDs of created grades")
    errors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of errors"
    )