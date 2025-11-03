"""
Pydantic schemas for request/response models following FastAPI best practices.
"""

# Authentication and User schemas
from .auth import (
    LoginRequest,
    LoginResponse,
    TokenData,
    UserCreate,
    UserUpdate,
    UserResponse,
    RefreshTokenRequest,
    PasswordChangeRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse
)

# Student schemas
from .student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentDashboard,
    StudentList,
    StudentFilters,
    StudentListItem,
    StudentAnalytics,
    StudentGradeSummary,
    StudentAttendanceSummary,
    StudentOccurrenceSummary
)

# Grade schemas
from .grade import (
    GradeCreate,
    GradeUpdate,
    GradeResponse,
    GradesList,
    GradeFilters,
    GradeListItem,
    GradeBulkCreate,
    GradeBulkResponse,
    SubjectGradeSummary,
    StudentGradesSummary,
    GradeAnalytics
)

# Occurrence schemas
from .occurrence import (
    OccurrenceCreate,
    OccurrenceUpdate,
    OccurrenceResponse,
    OccurrencesList,
    OccurrenceFilters,
    OccurrenceListItem,
    OccurrenceType,
    OccurrenceSeverity,
    OccurrenceStatus,
    OccurrenceAnalytics
)

# Message schemas
from .message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
    MessagesList,
    MessageFilters,
    MessageListItem,
    ConversationResponse,
    MessageStats,
    MessageBulkAction,
    MessageBulkResponse,
    MessageNotificationSettings
)

# Attendance schemas
from .attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
    AttendancesList,
    AttendanceFilters,
    AttendanceListItem,
    AttendanceStatus,
    AttendanceSummary,
    StudentAttendanceHistory,
    AttendanceBulkCreate,
    AttendanceBulkResponse,
    AttendanceAnalytics
)

# Common schemas
from .common import (
    BaseSchema,
    PaginationParams,
    PaginationInfo,
    PaginatedResponse,
    ApiResponse,
    ErrorResponse,
    ErrorDetail,
    HealthResponse,
    FilterParams,
    BulkOperationRequest,
    BulkOperationResponse
)

__all__ = [
    # Authentication and User schemas
    "LoginRequest",
    "LoginResponse",
    "TokenData",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "RefreshTokenRequest",
    "PasswordChangeRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "InstitutionCreate",
    "InstitutionUpdate",
    "InstitutionResponse",
    
    # Student schemas
    "StudentCreate",
    "StudentUpdate", 
    "StudentResponse",
    "StudentDashboard",
    "StudentList",
    "StudentFilters",
    "StudentListItem",
    "StudentAnalytics",
    "StudentGradeSummary",
    "StudentAttendanceSummary",
    "StudentOccurrenceSummary",
    
    # Grade schemas
    "GradeCreate",
    "GradeUpdate",
    "GradeResponse", 
    "GradesList",
    "GradeFilters",
    "GradeListItem",
    "GradeBulkCreate",
    "GradeBulkResponse",
    "SubjectGradeSummary",
    "StudentGradesSummary",
    "GradeAnalytics",
    
    # Occurrence schemas
    "OccurrenceCreate",
    "OccurrenceUpdate",
    "OccurrenceResponse",
    "OccurrencesList",
    "OccurrenceFilters",
    "OccurrenceListItem",
    "OccurrenceType",
    "OccurrenceSeverity", 
    "OccurrenceStatus",
    "OccurrenceAnalytics",
    
    # Message schemas
    "MessageCreate",
    "MessageUpdate",
    "MessageResponse",
    "MessagesList",
    "MessageFilters",
    "MessageListItem",
    "ConversationResponse",
    "MessageStats",
    "MessageBulkAction",
    "MessageBulkResponse",
    "MessageNotificationSettings",
    
    # Attendance schemas
    "AttendanceCreate",
    "AttendanceUpdate",
    "AttendanceResponse",
    "AttendancesList",
    "AttendanceFilters",
    "AttendanceListItem",
    "AttendanceStatus",
    "AttendanceSummary",
    "StudentAttendanceHistory",
    "AttendanceBulkCreate",
    "AttendanceBulkResponse",
    "AttendanceAnalytics",
    
    # Common schemas
    "BaseSchema",
    "PaginationParams",
    "PaginationInfo",
    "PaginatedResponse",
    "ApiResponse",
    "ErrorResponse",
    "ErrorDetail",
    "HealthResponse",
    "FilterParams",
    "BulkOperationRequest",
    "BulkOperationResponse",
]