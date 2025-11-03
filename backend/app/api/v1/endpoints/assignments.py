"""
API endpoints para Assignments/Tarefas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models import Assignment, AssignmentSubmission, User, Student, Class
from app.schemas.assignment_schema import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse,
    AssignmentListResponse,
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionGrade,
    SubmissionResponse,
    StudentSubmissionResponse,
    AssignmentStats,
    AssignmentStatusEnum,
    SubmissionStatusEnum
)

router = APIRouter()


# ==================== ASSIGNMENT ENDPOINTS ====================

@router.get("/", response_model=List[AssignmentListResponse])
def list_assignments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    class_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as tarefas com filtros opcionais
    """
    query = db.query(Assignment).filter(
        Assignment.institution_id == current_user.institution_id
    )
    
    if class_id:
        query = query.filter(Assignment.class_id == class_id)
    
    if teacher_id:
        query = query.filter(Assignment.teacher_id == teacher_id)
    
    if status:
        query = query.filter(Assignment.status == status)
    
    if type:
        query = query.filter(Assignment.type == type)
    
    assignments = query.order_by(Assignment.due_date.desc()).offset(skip).limit(limit).all()
    
    # Add submission counts
    results = []
    for assignment in assignments:
        total_subs = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment.id
        ).count()
        
        graded_subs = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment.id,
            AssignmentSubmission.status == SubmissionStatusEnum.GRADED
        ).count()
        
        results.append(AssignmentListResponse(
            id=assignment.id,
            title=assignment.title,
            type=assignment.type,
            status=assignment.status,
            due_date=assignment.due_date,
            max_score=assignment.max_score,
            assigned_at=assignment.assigned_at,
            is_overdue=assignment.is_overdue,
            total_submissions=total_subs,
            graded_submissions=graded_subs
        ))
    
    return results


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Busca uma tarefa específica por ID
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Add submission counts
    total_subs = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).count()
    
    pending_subs = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.status == SubmissionStatusEnum.PENDING
    ).count()
    
    graded_subs = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.status == SubmissionStatusEnum.GRADED
    ).count()
    
    response = AssignmentResponse(
        **assignment.__dict__,
        total_submissions=total_subs,
        pending_submissions=pending_subs,
        graded_submissions=graded_subs
    )
    
    return response


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria uma nova tarefa
    """
    # Verify class exists
    class_obj = db.query(Class).filter(
        Class.id == assignment_data.class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    # Create assignment
    new_assignment = Assignment(
        **assignment_data.model_dump(),
        teacher_id=current_user.id,
        status=AssignmentStatusEnum.DRAFT
    )
    
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    
    return AssignmentResponse(
        **new_assignment.__dict__,
        total_submissions=0,
        pending_submissions=0,
        graded_submissions=0
    )


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    assignment_data: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza uma tarefa existente
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Only teacher who created can edit
    if assignment.teacher_id != current_user.id and current_user.role not in ['admin', 'coordenador']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar esta tarefa"
        )
    
    # Update fields
    for field, value in assignment_data.model_dump(exclude_unset=True).items():
        setattr(assignment, field, value)
    
    assignment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assignment)
    
    # Get submission counts
    total_subs = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).count()
    
    return AssignmentResponse(
        **assignment.__dict__,
        total_submissions=total_subs,
        pending_submissions=0,
        graded_submissions=0
    )


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deleta uma tarefa (marca como cancelada)
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Only teacher who created can delete
    if assignment.teacher_id != current_user.id and current_user.role not in ['admin', 'coordenador']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para deletar esta tarefa"
        )
    
    # Soft delete - mark as cancelled
    assignment.status = AssignmentStatusEnum.CANCELLED
    assignment.updated_at = datetime.utcnow()
    
    db.commit()
    
    return None


@router.post("/{assignment_id}/publish", response_model=AssignmentResponse)
def publish_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Publica uma tarefa (muda status de draft para published)
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    if assignment.teacher_id != current_user.id and current_user.role not in ['admin', 'coordenador']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para publicar esta tarefa"
        )
    
    assignment.status = AssignmentStatusEnum.PUBLISHED
    assignment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assignment)
    
    return AssignmentResponse(**assignment.__dict__, total_submissions=0, pending_submissions=0, graded_submissions=0)


# ==================== CLASS ASSIGNMENTS ====================

@router.get("/class/{class_id}/assignments", response_model=List[AssignmentListResponse])
def list_class_assignments(
    class_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as tarefas de uma turma específica
    """
    query = db.query(Assignment).filter(
        Assignment.class_id == class_id,
        Assignment.institution_id == current_user.institution_id
    )
    
    if status:
        query = query.filter(Assignment.status == status)
    
    assignments = query.order_by(Assignment.due_date.desc()).all()
    
    results = []
    for assignment in assignments:
        total_subs = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment.id
        ).count()
        
        graded_subs = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment.id,
            AssignmentSubmission.status == SubmissionStatusEnum.GRADED
        ).count()
        
        results.append(AssignmentListResponse(
            id=assignment.id,
            title=assignment.title,
            type=assignment.type,
            status=assignment.status,
            due_date=assignment.due_date,
            max_score=assignment.max_score,
            assigned_at=assignment.assigned_at,
            is_overdue=assignment.is_overdue,
            total_submissions=total_subs,
            graded_submissions=graded_subs
        ))
    
    return results


# ==================== SUBMISSION ENDPOINTS ====================

@router.post("/{assignment_id}/submit", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: int,
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submete uma tarefa (aluno)
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Check if assignment is open
    if not assignment.is_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta tarefa não está mais aceitando submissões"
        )
    
    # Get student profile
    student = db.query(Student).filter(
        Student.user_id == current_user.id,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de aluno não encontrado"
        )
    
    # Check for existing submission
    existing = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == student.id
    ).first()
    
    if existing and not assignment.allow_resubmission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já submeteu esta tarefa e não é permitido reenviar"
        )
    
    # Determine if late
    is_late = assignment.is_overdue if assignment.due_date else False
    
    # Determine status
    submission_status = SubmissionStatusEnum.LATE if is_late else SubmissionStatusEnum.SUBMITTED
    
    if existing:
        # Update existing submission (resubmission)
        existing.content = submission_data.content
        existing.attachments = submission_data.attachments
        existing.submitted_at = datetime.utcnow()
        existing.status = submission_status
        existing.is_late = is_late
        existing.attempt_number += 1
        
        db.commit()
        db.refresh(existing)
        
        return existing
    else:
        # Create new submission
        new_submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student.id,
            content=submission_data.content,
            attachments=submission_data.attachments,
            submitted_at=datetime.utcnow(),
            status=submission_status,
            is_late=is_late
        )
        
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)
        
        return new_submission


@router.get("/{assignment_id}/submissions", response_model=List[StudentSubmissionResponse])
def list_assignment_submissions(
    assignment_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as submissões de uma tarefa (professor)
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Check permission
    if assignment.teacher_id != current_user.id and current_user.role not in ['admin', 'coordenador']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para ver as submissões desta tarefa"
        )
    
    query = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    )
    
    if status:
        query = query.filter(AssignmentSubmission.status == status)
    
    submissions = query.all()
    
    results = []
    for submission in submissions:
        student = db.query(Student).filter(Student.id == submission.student_id).first()
        if student and student.user:
            results.append(StudentSubmissionResponse(
                submission=submission,
                student_name=f"{student.user.first_name} {student.user.last_name}",
                student_enrollment=student.enrollment_number
            ))
    
    return results


@router.put("/submissions/{submission_id}/grade", response_model=SubmissionResponse)
def grade_submission(
    submission_id: int,
    grade_data: SubmissionGrade,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Avalia uma submissão (professor)
    """
    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submissão não encontrada"
        )
    
    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id
    ).first()
    
    # Check permission
    if assignment.teacher_id != current_user.id and current_user.role not in ['admin', 'coordenador']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para avaliar esta submissão"
        )
    
    # Validate score
    if grade_data.score > assignment.max_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A nota não pode ser maior que {assignment.max_score}"
        )
    
    # Update submission
    submission.score = grade_data.score
    submission.feedback = grade_data.feedback
    submission.graded_by = current_user.id
    submission.graded_at = datetime.utcnow()
    submission.status = SubmissionStatusEnum.GRADED
    
    db.commit()
    db.refresh(submission)
    
    return submission


@router.get("/students/{student_id}/submissions", response_model=List[SubmissionResponse])
def list_student_submissions(
    student_id: int,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as submissões de um aluno
    """
    query = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.student_id == student_id
    )
    
    if class_id:
        query = query.join(Assignment).filter(Assignment.class_id == class_id)
    
    submissions = query.all()
    
    return submissions


@router.get("/{assignment_id}/stats", response_model=AssignmentStats)
def get_assignment_stats(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas de uma tarefa
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.institution_id == current_user.institution_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada"
        )
    
    # Get class to count total students
    class_obj = db.query(Class).filter(Class.id == assignment.class_id).first()
    total_students = class_obj.current_students if class_obj else 0
    
    # Count submissions by status
    total_subs = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).count()
    
    pending = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.status == SubmissionStatusEnum.PENDING
    ).count()
    
    submitted = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.status.in_([SubmissionStatusEnum.SUBMITTED, SubmissionStatusEnum.LATE])
    ).count()
    
    graded = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.status == SubmissionStatusEnum.GRADED
    ).count()
    
    late = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.is_late == True
    ).count()
    
    # Calculate score statistics
    score_stats = db.query(
        func.avg(AssignmentSubmission.score),
        func.max(AssignmentSubmission.score),
        func.min(AssignmentSubmission.score)
    ).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.score.isnot(None)
    ).first()
    
    avg_score = float(score_stats[0]) if score_stats[0] else None
    highest_score = float(score_stats[1]) if score_stats[1] else None
    lowest_score = float(score_stats[2]) if score_stats[2] else None
    
    submission_rate = (total_subs / total_students * 100) if total_students > 0 else 0
    
    return AssignmentStats(
        total_students=total_students,
        total_submissions=total_subs,
        pending_count=pending,
        submitted_count=submitted,
        graded_count=graded,
        late_count=late,
        average_score=avg_score,
        highest_score=highest_score,
        lowest_score=lowest_score,
        submission_rate=round(submission_rate, 2)
    )
