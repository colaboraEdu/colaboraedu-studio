"""
Pydantic schemas para Classes/Turmas
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


# Base schemas
class ClassBase(BaseModel):
    """Schema base para Class"""
    name: str = Field(..., min_length=1, max_length=100, description="Nome da turma")
    code: str = Field(..., min_length=1, max_length=50, description="Código único da turma")
    description: Optional[str] = Field(None, description="Descrição da turma")
    grade_level_id: Optional[int] = Field(None, description="ID do nível de ensino")
    school_year: str = Field(..., description="Ano letivo (ex: 2025)")
    semester: Optional[int] = Field(None, ge=1, le=2, description="Semestre (1 ou 2)")
    max_students: int = Field(40, ge=1, le=100, description="Capacidade máxima de alunos")
    classroom: Optional[str] = Field(None, max_length=50, description="Sala de aula")
    schedule: Optional[str] = Field(None, description="Horário das aulas")


class ClassCreate(ClassBase):
    """Schema para criar uma nova turma"""
    institution_id: int = Field(..., description="ID da instituição")


class ClassUpdate(BaseModel):
    """Schema para atualizar uma turma existente"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    grade_level_id: Optional[int] = None
    max_students: Optional[int] = Field(None, ge=1, le=100)
    classroom: Optional[str] = Field(None, max_length=50)
    schedule: Optional[str] = None
    is_active: Optional[bool] = None


# Student enrollment schemas
class ClassStudentAdd(BaseModel):
    """Schema para adicionar aluno à turma"""
    student_id: int = Field(..., description="ID do aluno")


class ClassStudentRemove(BaseModel):
    """Schema para remover aluno da turma"""
    student_id: int = Field(..., description="ID do aluno")


# Teacher assignment schemas
class ClassTeacherAdd(BaseModel):
    """Schema para adicionar professor à turma"""
    teacher_id: int = Field(..., description="ID do professor")
    subject_id: Optional[int] = Field(None, description="ID da disciplina")
    is_primary: bool = Field(False, description="Professor principal da turma")


class ClassTeacherRemove(BaseModel):
    """Schema para remover professor da turma"""
    teacher_id: int = Field(..., description="ID do professor")


# Response schemas
class StudentSimple(BaseModel):
    """Schema simples de aluno para listagens"""
    id: int
    user_id: str
    enrollment_number: str
    current_grade: Optional[str]
    
    class Config:
        from_attributes = True


class TeacherSimple(BaseModel):
    """Schema simples de professor para listagens"""
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    
    class Config:
        from_attributes = True


class ClassResponse(ClassBase):
    """Schema de resposta completo com dados da turma"""
    id: int
    institution_id: int
    current_students: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    is_full: bool
    available_spots: int
    
    # Related data
    students: List[StudentSimple] = []
    teachers: List[TeacherSimple] = []
    
    class Config:
        from_attributes = True


class ClassListResponse(BaseModel):
    """Schema de resposta para listagem de turmas"""
    id: int
    name: str
    code: str
    school_year: str
    current_students: int
    max_students: int
    is_active: bool
    classroom: Optional[str]
    is_full: bool
    
    class Config:
        from_attributes = True


class ClassStats(BaseModel):
    """Schema para estatísticas da turma"""
    total_students: int
    present_today: int
    absent_today: int
    average_attendance: float
    average_grade: Optional[float]
    pending_assignments: int
