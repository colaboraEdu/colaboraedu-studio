"""
Modelos para parâmetros acadêmicos
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base


class AcademicParameter(Base):
    """Modelo para parâmetros acadêmicos do sistema"""
    __tablename__ = "academic_parameters"

    id = Column(String(36), primary_key=True, index=True)
    institution_id = Column(String(36), nullable=False, index=True)
    
    # Configurações de Notas
    grading_scale = Column(String(20), nullable=False, default="0-10")  # "0-10", "0-100", "A-F"
    passing_grade = Column(Float, nullable=False, default=6.0)
    max_grade = Column(Float, nullable=False, default=10.0)
    min_grade = Column(Float, nullable=False, default=0.0)
    decimal_places = Column(Integer, nullable=False, default=1)
    allow_grade_rounding = Column(Boolean, nullable=False, default=True)
    
    # Configurações de Frequência
    min_attendance_percentage = Column(Float, nullable=False, default=75.0)
    max_absences_allowed = Column(Integer, nullable=True)
    count_late_as_absent = Column(Boolean, nullable=False, default=False)
    late_minutes_threshold = Column(Integer, nullable=False, default=15)
    
    # Configurações de Período Letivo
    school_year_start_month = Column(Integer, nullable=False, default=2)  # Fevereiro
    school_year_end_month = Column(Integer, nullable=False, default=12)  # Dezembro
    number_of_terms = Column(Integer, nullable=False, default=4)  # Bimestres, trimestres, etc
    term_names = Column(JSON, nullable=True)  # ["1º Bimestre", "2º Bimestre", ...]
    
    # Configurações de Recuperação
    allow_recovery_exams = Column(Boolean, nullable=False, default=True)
    recovery_passing_grade = Column(Float, nullable=True, default=6.0)
    max_recovery_attempts = Column(Integer, nullable=True, default=1)
    
    # Configurações de Disciplinas
    min_subjects_per_term = Column(Integer, nullable=True, default=8)
    max_subjects_per_term = Column(Integer, nullable=True, default=15)
    allow_subject_dependencies = Column(Boolean, nullable=False, default=True)
    
    # Configurações de Turmas
    min_class_size = Column(Integer, nullable=True, default=10)
    max_class_size = Column(Integer, nullable=True, default=40)
    allow_mixed_grades = Column(Boolean, nullable=False, default=False)
    
    # Configurações de Progressão
    promotion_criteria = Column(JSON, nullable=True)  # Critérios personalizados
    require_min_attendance = Column(Boolean, nullable=False, default=True)
    automatic_promotion = Column(Boolean, nullable=False, default=False)
    
    # Configurações de Cálculo
    weight_config = Column(JSON, nullable=True)  # Peso de provas, trabalhos, etc
    calculation_formula = Column(Text, nullable=True)
    
    # Metadados
    active = Column(Boolean, nullable=False, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=False)
    created_by = Column(String(36), nullable=False)
    updated_by = Column(String(36), nullable=True)


class GradeLevel(Base):
    """Modelo para níveis/séries escolares"""
    __tablename__ = "grade_levels"

    id = Column(String(36), primary_key=True, index=True)
    institution_id = Column(String(36), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)  # "9º Ano", "1ª Série", etc
    code = Column(String(20), nullable=True)  # "9A", "1S", etc
    level = Column(Integer, nullable=False)  # Ordem numérica
    education_level = Column(String(50), nullable=False)  # "Fundamental", "Médio", "Superior"
    
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=False)
    
    # Relationships
    classes = relationship("Class", back_populates="grade_level")


class Subject(Base):
    """Modelo para disciplinas"""
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, index=True)
    institution_id = Column(String(36), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    
    workload_hours = Column(Integer, nullable=True)  # Carga horária
    credits = Column(Integer, nullable=True)
    
    is_mandatory = Column(Boolean, nullable=False, default=True)
    allows_substitution = Column(Boolean, nullable=False, default=False)
    
    prerequisites = Column(JSON, nullable=True)  # IDs de disciplinas pré-requisito
    
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=False)
    
    # Relationships
    assignments = relationship("Assignment", back_populates="subject")
