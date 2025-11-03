"""
Models para Assignments/Tarefas
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.models.base import Base


class AssignmentType(str, Enum):
    """Tipos de tarefas"""
    HOMEWORK = "homework"  # Dever de casa
    PROJECT = "project"  # Projeto
    EXAM = "exam"  # Prova
    QUIZ = "quiz"  # Quiz/Teste
    ESSAY = "essay"  # Redação
    PRESENTATION = "presentation"  # Apresentação
    LAB = "lab"  # Laboratório
    OTHER = "other"  # Outro


class AssignmentStatus(str, Enum):
    """Status da tarefa"""
    DRAFT = "draft"  # Rascunho
    PUBLISHED = "published"  # Publicada
    CLOSED = "closed"  # Encerrada
    CANCELLED = "cancelled"  # Cancelada


class SubmissionStatus(str, Enum):
    """Status da submissão"""
    PENDING = "pending"  # Pendente
    SUBMITTED = "submitted"  # Entregue
    LATE = "late"  # Atrasado
    GRADED = "graded"  # Corrigido
    RETURNED = "returned"  # Devolvido


class Assignment(Base):
    """
    Model para Assignments/Tarefas
    
    Representa uma tarefa/atividade criada por um professor para uma turma.
    """
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Informações básicas
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    
    # Tipo e status
    type = Column(SQLEnum(AssignmentType), default=AssignmentType.HOMEWORK, nullable=False)
    status = Column(SQLEnum(AssignmentStatus), default=AssignmentStatus.DRAFT, nullable=False)
    
    # Relacionamentos
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    
    # Prazos
    assigned_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    allow_late_submission = Column(Boolean, default=False)
    late_penalty = Column(Float, default=0.0)  # Penalidade em % (ex: 10.0 = 10%)
    
    # Avaliação
    max_score = Column(Float, default=100.0)
    weight = Column(Float, default=1.0)  # Peso na média
    
    # Configurações
    allow_resubmission = Column(Boolean, default=False)
    show_answers_after = Column(DateTime, nullable=True)
    
    # Arquivos e recursos
    attachments = Column(Text, nullable=True)  # JSON com URLs de arquivos
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    class_ = relationship("Class", back_populates="assignments")
    subject = relationship("Subject", back_populates="assignments")
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="created_assignments")
    institution = relationship("Institution", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Assignment {self.title} - {self.type}>"

    @property
    def is_overdue(self) -> bool:
        """Verifica se a tarefa está atrasada"""
        if not self.due_date:
            return False
        return datetime.utcnow() > self.due_date

    @property
    def is_open(self) -> bool:
        """Verifica se a tarefa está aberta para submissões"""
        if self.status != AssignmentStatus.PUBLISHED:
            return False
        if not self.due_date:
            return True
        if self.allow_late_submission:
            return True
        return datetime.utcnow() <= self.due_date


class AssignmentSubmission(Base):
    """
    Model para submissões de tarefas pelos alunos
    """
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relacionamentos
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    
    # Status e conteúdo
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False)
    content = Column(Text, nullable=True)  # Resposta do aluno
    attachments = Column(Text, nullable=True)  # JSON com URLs de arquivos
    
    # Datas
    submitted_at = Column(DateTime, nullable=True)
    graded_at = Column(DateTime, nullable=True)
    returned_at = Column(DateTime, nullable=True)
    
    # Avaliação
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    graded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Flags
    is_late = Column(Boolean, default=False)
    attempt_number = Column(Integer, default=1)
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="assignment_submissions")
    grader = relationship("User", foreign_keys=[graded_by])

    def __repr__(self):
        return f"<Submission {self.id} - Student {self.student_id} - {self.status}>"

    @property
    def percentage_score(self) -> float:
        """Retorna a nota em percentual"""
        if not self.score or not self.assignment.max_score:
            return 0.0
        return (self.score / self.assignment.max_score) * 100
