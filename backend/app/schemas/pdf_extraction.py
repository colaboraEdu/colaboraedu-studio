"""
Schemas para extração de dados de PDFs (Boletins)
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal


class SubjectGrade(BaseModel):
    """Nota de uma disciplina"""
    subject_name: str = Field(..., description="Nome da disciplina")
    grade_1: Optional[float] = Field(None, ge=0, le=10, description="1º Bimestre")
    grade_2: Optional[float] = Field(None, ge=0, le=10, description="2º Bimestre")
    grade_3: Optional[float] = Field(None, ge=0, le=10, description="3º Bimestre")
    grade_4: Optional[float] = Field(None, ge=0, le=10, description="4º Bimestre")
    final_grade: Optional[float] = Field(None, ge=0, le=10, description="Nota final")
    average: Optional[float] = Field(None, ge=0, le=10, description="Média")
    status: Optional[str] = Field(None, description="Aprovado/Reprovado/Recuperação")
    
    @validator('grade_1', 'grade_2', 'grade_3', 'grade_4', 'final_grade', 'average')
    def round_grades(cls, v):
        """Arredonda notas para 2 casas decimais"""
        if v is not None:
            return round(float(v), 2)
        return v
    
    def calculate_average(self) -> float:
        """Calcula média das notas disponíveis"""
        grades = [g for g in [self.grade_1, self.grade_2, self.grade_3, self.grade_4] if g is not None]
        if not grades:
            return 0.0
        return round(sum(grades) / len(grades), 2)


class AttendanceInfo(BaseModel):
    """Informações de frequência"""
    total_days: int = Field(..., ge=0, description="Total de dias letivos")
    present_days: int = Field(..., ge=0, description="Dias presentes")
    absent_days: int = Field(0, ge=0, description="Dias ausentes")
    percentage: Optional[float] = Field(None, ge=0, le=100, description="Percentual de presença")
    
    @validator('percentage', always=True)
    def calculate_percentage(cls, v, values):
        """Calcula percentual de presença"""
        if 'total_days' in values and values['total_days'] > 0:
            present = values.get('present_days', 0)
            total = values['total_days']
            return round((present / total) * 100, 2)
        return 0.0
    
    @validator('absent_days', always=True)
    def calculate_absent(cls, v, values):
        """Calcula dias ausentes"""
        if 'total_days' in values and 'present_days' in values:
            return values['total_days'] - values['present_days']
        return v


class StudentInfo(BaseModel):
    """Informações do aluno extraídas do PDF"""
    full_name: str = Field(..., description="Nome completo do aluno")
    enrollment_number: Optional[str] = Field(None, description="Número de matrícula")
    birth_date: Optional[str] = Field(None, description="Data de nascimento")
    class_name: Optional[str] = Field(None, description="Turma/Série")
    academic_year: int = Field(..., description="Ano letivo")
    semester: Optional[int] = Field(None, ge=1, le=2, description="Semestre")
    
    @validator('full_name')
    def clean_name(cls, v):
        """Limpa e normaliza o nome"""
        return ' '.join(v.strip().split())


class InstitutionInfo(BaseModel):
    """Informações da instituição"""
    name: Optional[str] = Field(None, description="Nome da instituição")
    cnpj: Optional[str] = Field(None, description="CNPJ")
    address: Optional[str] = Field(None, description="Endereço")


class BulletinData(BaseModel):
    """Dados completos extraídos de um boletim"""
    student: StudentInfo
    institution: Optional[InstitutionInfo] = None
    grades: List[SubjectGrade] = Field(default_factory=list, description="Notas por disciplina")
    attendance: Optional[AttendanceInfo] = None
    observations: Optional[str] = Field(None, description="Observações gerais")
    extracted_at: datetime = Field(default_factory=datetime.utcnow)
    confidence_score: float = Field(default=0.0, ge=0, le=1, description="Confiança da extração")
    
    def get_overall_average(self) -> float:
        """Calcula média geral do aluno"""
        if not self.grades:
            return 0.0
        averages = [g.calculate_average() for g in self.grades if g.calculate_average() > 0]
        if not averages:
            return 0.0
        return round(sum(averages) / len(averages), 2)
    
    def get_approval_status(self) -> str:
        """Determina status de aprovação geral"""
        overall_avg = self.get_overall_average()
        if self.attendance and self.attendance.percentage < 75:
            return "Reprovado por Falta"
        elif overall_avg >= 7.0:
            return "Aprovado"
        elif overall_avg >= 5.0:
            return "Recuperação"
        else:
            return "Reprovado"


class PDFUploadResponse(BaseModel):
    """Resposta do upload de PDF"""
    id: str = Field(..., description="ID do processamento")
    filename: str
    size: int
    status: str = Field(default="pending", description="pending|processing|completed|failed")
    message: str = Field(default="Arquivo recebido e aguardando processamento")


class PDFProcessingStatus(BaseModel):
    """Status do processamento"""
    id: str
    filename: str
    status: str  # pending, processing, completed, failed
    progress: int = Field(default=0, ge=0, le=100, description="Progresso em %")
    extracted_data: Optional[BulletinData] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class PDFValidationRequest(BaseModel):
    """Requisição para validar dados extraídos"""
    extraction_id: str
    validated_data: BulletinData
    corrections: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Correções manuais")
    approve: bool = Field(..., description="Aprovar e salvar no banco")


class PDFValidationResponse(BaseModel):
    """Resposta da validação"""
    success: bool
    message: str
    students_created: int = 0
    grades_created: int = 0
    attendance_created: int = 0
    errors: List[str] = Field(default_factory=list)
