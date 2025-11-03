"""
Pydantic schemas para Assignments/Tarefas
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class AssignmentTypeEnum(str, Enum):
    """Tipos de tarefas"""
    HOMEWORK = "homework"
    PROJECT = "project"
    EXAM = "exam"
    QUIZ = "quiz"
    ESSAY = "essay"
    PRESENTATION = "presentation"
    LAB = "lab"
    OTHER = "other"


class AssignmentStatusEnum(str, Enum):
    """Status da tarefa"""
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class SubmissionStatusEnum(str, Enum):
    """Status da submissão"""
    PENDING = "pending"
    SUBMITTED = "submitted"
    LATE = "late"
    GRADED = "graded"
    RETURNED = "returned"


# Assignment schemas
class AssignmentBase(BaseModel):
    """Schema base para Assignment"""
    title: str = Field(..., min_length=1, max_length=200, description="Título da tarefa")
    description: Optional[str] = Field(None, description="Descrição da tarefa")
    instructions: Optional[str] = Field(None, description="Instruções detalhadas")
    type: AssignmentTypeEnum = Field(AssignmentTypeEnum.HOMEWORK, description="Tipo da tarefa")
    due_date: Optional[datetime] = Field(None, description="Data de entrega")
    max_score: float = Field(100.0, ge=0, description="Pontuação máxima")
    weight: float = Field(1.0, ge=0, description="Peso na média")
    allow_late_submission: bool = Field(False, description="Permitir entrega atrasada")
    late_penalty: float = Field(0.0, ge=0, le=100, description="Penalidade por atraso (%)")
    allow_resubmission: bool = Field(False, description="Permitir reenvio")


class AssignmentCreate(AssignmentBase):
    """Schema para criar uma nova tarefa"""
    class_id: int = Field(..., description="ID da turma")
    subject_id: Optional[int] = Field(None, description="ID da disciplina")
    institution_id: int = Field(..., description="ID da instituição")


class AssignmentUpdate(BaseModel):
    """Schema para atualizar uma tarefa existente"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    instructions: Optional[str] = None
    type: Optional[AssignmentTypeEnum] = None
    status: Optional[AssignmentStatusEnum] = None
    due_date: Optional[datetime] = None
    max_score: Optional[float] = Field(None, ge=0)
    weight: Optional[float] = Field(None, ge=0)
    allow_late_submission: Optional[bool] = None
    late_penalty: Optional[float] = Field(None, ge=0, le=100)
    allow_resubmission: Optional[bool] = None


class AssignmentResponse(AssignmentBase):
    """Schema de resposta completo da tarefa"""
    id: int
    class_id: int
    subject_id: Optional[int]
    teacher_id: int
    institution_id: int
    status: AssignmentStatusEnum
    assigned_at: datetime
    created_at: datetime
    updated_at: datetime
    is_overdue: bool
    is_open: bool
    
    # Statistics
    total_submissions: int = 0
    pending_submissions: int = 0
    graded_submissions: int = 0
    
    class Config:
        from_attributes = True


class AssignmentListResponse(BaseModel):
    """Schema de resposta para listagem de tarefas"""
    id: int
    title: str
    type: AssignmentTypeEnum
    status: AssignmentStatusEnum
    due_date: Optional[datetime]
    max_score: float
    assigned_at: datetime
    is_overdue: bool
    total_submissions: int = 0
    graded_submissions: int = 0
    
    class Config:
        from_attributes = True


# Submission schemas
class SubmissionBase(BaseModel):
    """Schema base para Submission"""
    content: Optional[str] = Field(None, description="Conteúdo da resposta")
    attachments: Optional[str] = Field(None, description="Arquivos anexos (JSON)")


class SubmissionCreate(SubmissionBase):
    """Schema para criar uma submissão"""
    assignment_id: int = Field(..., description="ID da tarefa")


class SubmissionUpdate(BaseModel):
    """Schema para atualizar uma submissão"""
    content: Optional[str] = None
    attachments: Optional[str] = None


class SubmissionGrade(BaseModel):
    """Schema para avaliar uma submissão"""
    score: float = Field(..., ge=0, description="Nota atribuída")
    feedback: Optional[str] = Field(None, description="Feedback do professor")


class SubmissionResponse(SubmissionBase):
    """Schema de resposta completo da submissão"""
    id: int
    assignment_id: int
    student_id: int
    status: SubmissionStatusEnum
    submitted_at: Optional[datetime]
    graded_at: Optional[datetime]
    score: Optional[float]
    feedback: Optional[str]
    is_late: bool
    attempt_number: int
    percentage_score: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StudentSubmissionResponse(BaseModel):
    """Schema de resposta com informações do aluno"""
    submission: SubmissionResponse
    student_name: str
    student_enrollment: str
    
    class Config:
        from_attributes = True


# Statistics schemas
class AssignmentStats(BaseModel):
    """Schema para estatísticas da tarefa"""
    total_students: int
    total_submissions: int
    pending_count: int
    submitted_count: int
    graded_count: int
    late_count: int
    average_score: Optional[float]
    highest_score: Optional[float]
    lowest_score: Optional[float]
    submission_rate: float  # Percentage
