"""
Schemas para parâmetros acadêmicos
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# Academic Parameters Schemas
class GradingSettings(BaseModel):
    """Configurações de notas"""
    grading_scale: str = Field(default="0-10", description="Escala de notas")
    passing_grade: float = Field(default=6.0, ge=0, description="Nota mínima para aprovação")
    max_grade: float = Field(default=10.0, ge=0, description="Nota máxima")
    min_grade: float = Field(default=0.0, ge=0, description="Nota mínima")
    decimal_places: int = Field(default=1, ge=0, le=3, description="Casas decimais")
    allow_grade_rounding: bool = Field(default=True, description="Permitir arredondamento")


class AttendanceSettings(BaseModel):
    """Configurações de frequência"""
    min_attendance_percentage: float = Field(default=75.0, ge=0, le=100, description="% mínima de presença")
    max_absences_allowed: Optional[int] = Field(default=None, ge=0, description="Máximo de faltas permitidas")
    count_late_as_absent: bool = Field(default=False, description="Contar atraso como falta")
    late_minutes_threshold: int = Field(default=15, ge=1, description="Minutos para considerar atraso")


class SchoolYearSettings(BaseModel):
    """Configurações do ano letivo"""
    school_year_start_month: int = Field(default=2, ge=1, le=12, description="Mês de início")
    school_year_end_month: int = Field(default=12, ge=1, le=12, description="Mês de término")
    number_of_terms: int = Field(default=4, ge=1, le=6, description="Número de períodos")
    term_names: Optional[List[str]] = Field(default=None, description="Nomes dos períodos")


class RecoverySettings(BaseModel):
    """Configurações de recuperação"""
    allow_recovery_exams: bool = Field(default=True, description="Permitir provas de recuperação")
    recovery_passing_grade: Optional[float] = Field(default=6.0, ge=0, description="Nota mínima recuperação")
    max_recovery_attempts: Optional[int] = Field(default=1, ge=1, description="Máximo de tentativas")


class ClassSettings(BaseModel):
    """Configurações de turmas"""
    min_class_size: Optional[int] = Field(default=10, ge=1, description="Tamanho mínimo da turma")
    max_class_size: Optional[int] = Field(default=40, ge=1, description="Tamanho máximo da turma")
    allow_mixed_grades: bool = Field(default=False, description="Permitir séries mistas")


class PromotionSettings(BaseModel):
    """Configurações de progressão"""
    promotion_criteria: Optional[Dict[str, Any]] = Field(default=None, description="Critérios de promoção")
    require_min_attendance: bool = Field(default=True, description="Requer frequência mínima")
    automatic_promotion: bool = Field(default=False, description="Promoção automática")


class AcademicParameterBase(BaseModel):
    """Base para parâmetros acadêmicos"""
    institution_id: str
    grading_scale: str = "0-10"
    passing_grade: float = 6.0
    max_grade: float = 10.0
    min_grade: float = 0.0
    decimal_places: int = 1
    allow_grade_rounding: bool = True
    min_attendance_percentage: float = 75.0
    max_absences_allowed: Optional[int] = None
    count_late_as_absent: bool = False
    late_minutes_threshold: int = 15
    school_year_start_month: int = 2
    school_year_end_month: int = 12
    number_of_terms: int = 4
    term_names: Optional[List[str]] = None
    allow_recovery_exams: bool = True
    recovery_passing_grade: Optional[float] = 6.0
    max_recovery_attempts: Optional[int] = 1
    min_subjects_per_term: Optional[int] = 8
    max_subjects_per_term: Optional[int] = 15
    allow_subject_dependencies: bool = True
    min_class_size: Optional[int] = 10
    max_class_size: Optional[int] = 40
    allow_mixed_grades: bool = False
    promotion_criteria: Optional[Dict[str, Any]] = None
    require_min_attendance: bool = True
    automatic_promotion: bool = False
    weight_config: Optional[Dict[str, Any]] = None
    calculation_formula: Optional[str] = None
    active: bool = True
    notes: Optional[str] = None


class AcademicParameterCreate(AcademicParameterBase):
    """Schema para criação de parâmetros acadêmicos"""
    pass


class AcademicParameterUpdate(BaseModel):
    """Schema para atualização de parâmetros acadêmicos"""
    grading_scale: Optional[str] = None
    passing_grade: Optional[float] = None
    max_grade: Optional[float] = None
    min_grade: Optional[float] = None
    decimal_places: Optional[int] = None
    allow_grade_rounding: Optional[bool] = None
    min_attendance_percentage: Optional[float] = None
    max_absences_allowed: Optional[int] = None
    count_late_as_absent: Optional[bool] = None
    late_minutes_threshold: Optional[int] = None
    school_year_start_month: Optional[int] = None
    school_year_end_month: Optional[int] = None
    number_of_terms: Optional[int] = None
    term_names: Optional[List[str]] = None
    allow_recovery_exams: Optional[bool] = None
    recovery_passing_grade: Optional[float] = None
    max_recovery_attempts: Optional[int] = None
    min_subjects_per_term: Optional[int] = None
    max_subjects_per_term: Optional[int] = None
    allow_subject_dependencies: Optional[bool] = None
    min_class_size: Optional[int] = None
    max_class_size: Optional[int] = None
    allow_mixed_grades: Optional[bool] = None
    promotion_criteria: Optional[Dict[str, Any]] = None
    require_min_attendance: Optional[bool] = None
    automatic_promotion: Optional[bool] = None
    weight_config: Optional[Dict[str, Any]] = None
    calculation_formula: Optional[str] = None
    active: Optional[bool] = None
    notes: Optional[str] = None


class AcademicParameterOut(AcademicParameterBase):
    """Schema de saída de parâmetros acadêmicos"""
    id: str
    created_at: str
    updated_at: str
    created_by: str
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


# Grade Level Schemas
class GradeLevelBase(BaseModel):
    """Base para níveis escolares"""
    institution_id: str
    name: str
    code: Optional[str] = None
    level: int
    education_level: str
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    active: bool = True


class GradeLevelCreate(GradeLevelBase):
    """Schema para criação de nível escolar"""
    pass


class GradeLevelUpdate(BaseModel):
    """Schema para atualização de nível escolar"""
    name: Optional[str] = None
    code: Optional[str] = None
    level: Optional[int] = None
    education_level: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    active: Optional[bool] = None


class GradeLevelOut(GradeLevelBase):
    """Schema de saída de nível escolar"""
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# Subject Schemas
class SubjectBase(BaseModel):
    """Base para disciplinas"""
    institution_id: str
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    workload_hours: Optional[int] = None
    credits: Optional[int] = None
    is_mandatory: bool = True
    allows_substitution: bool = False
    prerequisites: Optional[List[str]] = None
    active: bool = True


class SubjectCreate(SubjectBase):
    """Schema para criação de disciplina"""
    pass


class SubjectUpdate(BaseModel):
    """Schema para atualização de disciplina"""
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    workload_hours: Optional[int] = None
    credits: Optional[int] = None
    is_mandatory: Optional[bool] = None
    allows_substitution: Optional[bool] = None
    prerequisites: Optional[List[str]] = None
    active: Optional[bool] = None


class SubjectOut(SubjectBase):
    """Schema de saída de disciplina"""
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
