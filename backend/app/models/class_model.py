"""
Models para Classes/Turmas
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


# Tabela de associação Many-to-Many entre Classes e Students
class_students = Table(
    'class_students',
    Base.metadata,
    Column('class_id', Integer, ForeignKey('classes.id', ondelete='CASCADE'), primary_key=True),
    Column('student_id', Integer, ForeignKey('students.id', ondelete='CASCADE'), primary_key=True),
    Column('enrolled_at', DateTime, default=datetime.utcnow),
    Column('is_active', Boolean, default=True)
)


# Tabela de associação Many-to-Many entre Classes e Professores
class_teachers = Table(
    'class_teachers',
    Base.metadata,
    Column('class_id', Integer, ForeignKey('classes.id', ondelete='CASCADE'), primary_key=True),
    Column('teacher_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('subject_id', String(36), ForeignKey('subjects.id', ondelete='SET NULL'), nullable=True),
    Column('assigned_at', DateTime, default=datetime.utcnow),
    Column('is_primary', Boolean, default=False)  # Professor principal da turma
)


class Class(Base):
    """
    Model para Classes/Turmas
    
    Uma turma representa um grupo de alunos que estudam juntos.
    Pode ter múltiplos professores e múltiplas disciplinas.
    """
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Informações básicas
    name = Column(String(100), nullable=False, index=True)  # Ex: "3º Ano A"
    code = Column(String(50), unique=True, nullable=False, index=True)  # Ex: "3A-2025"
    description = Column(Text, nullable=True)
    
    # Relacionamentos com hierarquia acadêmica
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    grade_level_id = Column(String(36), ForeignKey("grade_levels.id", ondelete="SET NULL"), nullable=True)
    
    # Ano letivo
    school_year = Column(String(9), nullable=False, index=True)  # Ex: "2025"
    semester = Column(Integer, nullable=True)  # 1 ou 2, se aplicável
    
    # Capacidade e configurações
    max_students = Column(Integer, default=40)
    current_students = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Horários (pode ser expandido para tabela separada)
    schedule = Column(Text, nullable=True)  # JSON ou texto com horários
    classroom = Column(String(50), nullable=True)  # Sala de aula
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relacionamentos
    institution = relationship("Institution", back_populates="classes")
    grade_level = relationship("GradeLevel", back_populates="classes")
    
    # Many-to-Many com Students
    students = relationship(
        "Student",
        secondary=class_students,
        back_populates="classes",
        lazy="selectin"
    )
    
    # Many-to-Many com Teachers (Users com role='professor')
    teachers = relationship(
        "User",
        secondary=class_teachers,
        back_populates="teaching_classes",
        lazy="selectin"
    )
    
    # One-to-Many
    attendances = relationship("Attendance", back_populates="class_", cascade="all, delete-orphan")
    grades = relationship("Grade", back_populates="class_", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="class_", cascade="all, delete-orphan")
    
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<Class {self.code} - {self.name}>"

    @property
    def is_full(self) -> bool:
        """Verifica se a turma está cheia"""
        return self.current_students >= self.max_students

    @property
    def available_spots(self) -> int:
        """Retorna vagas disponíveis"""
        return max(0, self.max_students - self.current_students)
