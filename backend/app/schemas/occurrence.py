"""
Occurrence-related Pydantic schemas following FastAPI best practices
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, validator
from uuid import UUID
from enum import Enum

from .common import BaseSchema, FilterParams


class OccurrenceType(str, Enum):
    """Occurrence types enum"""
    DISCIPLINARY = "disciplinary"
    ACADEMIC = "academic"
    HEALTH = "health"
    BEHAVIORAL = "behavioral"
    ATTENDANCE = "attendance"
    OTHER = "other"


class OccurrenceSeverity(str, Enum):
    """Occurrence severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class OccurrenceStatus(str, Enum):
    """Occurrence status"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class OccurrenceBase(BaseModel):
    """Base occurrence information"""
    
    type: OccurrenceType = Field(
        ...,
        description="Type of occurrence",
        example=OccurrenceType.DISCIPLINARY
    )
    severity: OccurrenceSeverity = Field(
        ...,
        description="Severity level of the occurrence",
        example=OccurrenceSeverity.MEDIUM
    )
    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="Brief title describing the occurrence",
        example="Comportamento inadequado em sala de aula"
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Detailed description of the occurrence",
        example="Aluno interrompeu a aula repetidamente e demonstrou desrespeito ao professor"
    )
    location: Optional[str] = Field(
        None,
        max_length=100,
        description="Location where the occurrence happened",
        example="Sala 204 - Matemática"
    )


class OccurrenceCreate(OccurrenceBase):
    """Schema for creating a new occurrence"""
    
    student_id: UUID = Field(..., description="Student involved in the occurrence")
    occurred_at: Optional[datetime] = Field(
        None,
        description="When the occurrence happened (defaults to now)"
    )
    witnesses: Optional[List[str]] = Field(
        None,
        max_items=10,
        description="List of witnesses",
        example=["Prof. Maria Silva", "Monitor João"]
    )
    immediate_action: Optional[str] = Field(
        None,
        max_length=500,
        description="Immediate action taken",
        example="Aluno foi retirado da sala e levado à coordenação"
    )
    parent_notified: bool = Field(
        default=False,
        description="Whether parents were notified"
    )
    
    @validator('occurred_at')
    def validate_occurred_at(cls, v):
        """Validate that occurrence date is not in the future"""
        if v and v > datetime.utcnow():
            raise ValueError('Occurrence date cannot be in the future')
        return v


class OccurrenceUpdate(BaseModel):
    """Schema for updating occurrence information"""
    
    type: Optional[OccurrenceType] = Field(None, description="Update occurrence type")
    severity: Optional[OccurrenceSeverity] = Field(None, description="Update severity")
    title: Optional[str] = Field(
        None,
        min_length=5,
        max_length=200,
        description="Update title"
    )
    description: Optional[str] = Field(
        None,
        min_length=10,
        max_length=2000,
        description="Update description"
    )
    location: Optional[str] = Field(
        None,
        max_length=100,
        description="Update location"
    )
    status: Optional[OccurrenceStatus] = Field(
        None,
        description="Update occurrence status"
    )
    resolution_notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Notes about resolution"
    )
    parent_notified: Optional[bool] = Field(
        None,
        description="Update parent notification status"
    )


class OccurrenceResponse(OccurrenceBase, BaseSchema):
    """Complete occurrence response schema"""
    
    id: UUID = Field(..., description="Occurrence unique identifier")
    institution_id: UUID = Field(..., description="Institution ID")
    student_id: UUID = Field(..., description="Student ID")
    recorded_by: Optional[UUID] = Field(None, description="User who recorded the occurrence")
    status: OccurrenceStatus = Field(
        default=OccurrenceStatus.OPEN,
        description="Current status"
    )
    occurred_at: datetime = Field(..., description="When the occurrence happened")
    witnesses: Optional[List[str]] = Field(None, description="List of witnesses")
    immediate_action: Optional[str] = Field(None, description="Immediate action taken")
    resolution_notes: Optional[str] = Field(None, description="Resolution notes")
    parent_notified: bool = Field(default=False, description="Parent notification status")
    notified_at: Optional[datetime] = Field(None, description="When parents were notified")
    resolved_at: Optional[datetime] = Field(None, description="When occurrence was resolved")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Related data (optional)
    student: Optional[Dict[str, Any]] = Field(None, description="Student information")
    recorded_by_user: Optional[Dict[str, Any]] = Field(None, description="User who recorded")


class OccurrenceListItem(BaseSchema):
    """Simplified occurrence data for list responses"""
    
    id: UUID
    type: OccurrenceType
    severity: OccurrenceSeverity
    title: str
    status: OccurrenceStatus
    student_name: str = Field(..., description="Student full name")
    student_enrollment: str = Field(..., description="Student enrollment number")
    occurred_at: datetime
    created_at: datetime


class OccurrencesList(BaseModel):
    """Occurrence list with metadata"""
    
    occurrences: List[OccurrenceListItem] = Field(..., description="List of occurrences")


class OccurrenceFilters(FilterParams):
    """Filters for occurrence queries"""
    
    type: Optional[OccurrenceType] = Field(
        None,
        description="Filter by occurrence type"
    )
    severity: Optional[OccurrenceSeverity] = Field(
        None,
        description="Filter by severity level"
    )
    status: Optional[OccurrenceStatus] = Field(
        None,
        description="Filter by status"
    )
    student_id: Optional[UUID] = Field(
        None,
        description="Filter by student ID"
    )
    recorded_by: Optional[UUID] = Field(
        None,
        description="Filter by who recorded the occurrence"
    )
    date_from: Optional[date] = Field(
        None,
        description="Filter occurrences from this date"
    )
    date_to: Optional[date] = Field(
        None,
        description="Filter occurrences until this date"
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


class OccurrenceAnalytics(BaseModel):
    """Analytics data for occurrences"""
    
    period_summary: Dict[str, Any] = Field(
        ...,
        description="Summary for the selected period"
    )
    trends: Dict[str, Any] = Field(
        ...,
        description="Trend analysis"
    )
    prevention_suggestions: List[str] = Field(
        default_factory=list,
        description="Suggestions for prevention"
    )