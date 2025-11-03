"""
Common schemas for API responses and pagination
"""

from typing import Optional, List, Dict, Any, Generic, TypeVar
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID

T = TypeVar('T')


class BaseSchema(BaseModel):
    """Base schema with common configuration following FastAPI best practices"""
    
    model_config = {
        "from_attributes": True,  # Pydantic v2 equivalent of orm_mode
        "use_enum_values": True,
        "validate_assignment": True,
        "arbitrary_types_allowed": False,
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
        }
    }


class PaginationParams(BaseModel):
    """Pagination parameters with validation following FastAPI patterns"""
    
    page: int = Field(
        default=1,
        ge=1,
        description="Page number (starts from 1)",
        example=1
    )
    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Number of items per page (max 100)",
        example=20
    )
    
    @property
    def offset(self) -> int:
        """Calculate offset for database queries"""
        return (self.page - 1) * self.page_size


class PaginationInfo(BaseModel):
    """Pagination metadata"""
    
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_previous: bool = Field(..., description="Whether there is a previous page")
    
    @classmethod
    def create(
        cls,
        page: int,
        page_size: int,
        total: int
    ) -> "PaginationInfo":
        """Create pagination info from parameters"""
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        
        return cls(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1
        )


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response following FastAPI patterns"""
    
    status: str = Field(default="success", description="Response status")
    data: List[T] = Field(..., description="List of items")
    pagination: PaginationInfo = Field(..., description="Pagination information")
    
    @classmethod
    def create(
        cls,
        items: List[T],
        page: int,
        page_size: int,
        total: int
    ) -> "PaginatedResponse[T]":
        """Create a paginated response with items and pagination info"""
        return cls(
            data=items,
            pagination=PaginationInfo.create(page, page_size, total)
        )


class ApiResponse(BaseModel, Generic[T]):
    """Generic API response wrapper"""
    
    status: str = Field(default="success", description="Response status")
    message: Optional[str] = Field(None, description="Response message")
    data: T = Field(..., description="Response data")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )


class ErrorDetail(BaseModel):
    """Error detail schema"""
    
    field: Optional[str] = Field(None, description="Field that caused the error")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class ErrorResponse(BaseModel):
    """Standard error response following FastAPI error handling"""
    
    status: str = Field(default="error", description="Response status")
    error_code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: Optional[List[ErrorDetail]] = Field(None, description="Error details")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Error timestamp"
    )


class HealthResponse(BaseModel):
    """Health check response"""
    
    status: str = Field(default="healthy", description="Health status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Health check timestamp"
    )
    services: Dict[str, str] = Field(
        default_factory=dict,
        description="Status of dependent services"
    )


class FilterParams(BaseModel):
    """Base filter parameters for list endpoints"""
    
    search: Optional[str] = Field(
        None,
        max_length=100,
        description="Search term",
        example="João Silva"
    )
    sort_by: Optional[str] = Field(
        None,
        description="Field to sort by",
        example="created_at"
    )
    sort_order: Optional[str] = Field(
        default="desc",
        pattern="^(asc|desc)$",
        description="Sort order (asc or desc)",
        example="desc"
    )
    status: Optional[str] = Field(
        None,
        description="Filter by status",
        example="active"
    )


class BulkOperationRequest(BaseModel):
    """Schema for bulk operations"""
    
    ids: List[UUID] = Field(
        ...,
        min_items=1,
        max_items=100,
        description="List of IDs to operate on"
    )
    action: str = Field(
        ...,
        description="Action to perform",
        example="delete"
    )
    params: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional parameters for the operation"
    )


class BulkOperationResponse(BaseModel):
    """Response for bulk operations"""
    
    status: str = Field(default="success", description="Operation status")
    total_requested: int = Field(..., description="Total items requested")
    total_processed: int = Field(..., description="Total items processed")
    total_errors: int = Field(..., description="Total items with errors")
    errors: List[ErrorDetail] = Field(
        default_factory=list,
        description="List of errors"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Operation timestamp"
    )