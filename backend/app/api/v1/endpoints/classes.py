"""
API endpoints para Classes/Turmas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date

from app.api.deps import get_db, get_current_user
from app.models import Class, User, Student, Institution
from app.schemas.class_schema import (
    ClassCreate,
    ClassUpdate,
    ClassResponse,
    ClassListResponse,
    ClassStudentAdd,
    ClassStudentRemove,
    ClassTeacherAdd,
    ClassTeacherRemove,
    ClassStats
)

router = APIRouter()


@router.get("/", response_model=List[ClassListResponse])
def list_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    school_year: Optional[str] = None,
    is_active: Optional[bool] = None,
    teacher_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as turmas com filtros opcionais
    """
    query = db.query(Class).filter(Class.institution_id == current_user.institution_id)
    
    if school_year:
        query = query.filter(Class.school_year == school_year)
    
    if is_active is not None:
        query = query.filter(Class.is_active == is_active)
    
    if teacher_id:
        # Filter classes taught by specific teacher
        query = query.join(Class.teachers).filter(User.id == teacher_id)
    
    classes = query.offset(skip).limit(limit).all()
    
    return [
        ClassListResponse(
            id=c.id,
            name=c.name,
            code=c.code,
            school_year=c.school_year,
            current_students=c.current_students,
            max_students=c.max_students,
            is_active=c.is_active,
            classroom=c.classroom,
            is_full=c.is_full
        )
        for c in classes
    ]


@router.get("/{class_id}", response_model=ClassResponse)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Busca uma turma específica por ID
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    return class_obj


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria uma nova turma
    """
    # Verify institution exists
    institution = db.query(Institution).filter(
        Institution.id == class_data.institution_id
    ).first()
    
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instituição não encontrada"
        )
    
    # Check if code already exists
    existing = db.query(Class).filter(
        Class.code == class_data.code,
        Class.institution_id == class_data.institution_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe uma turma com o código '{class_data.code}'"
        )
    
    # Create class
    new_class = Class(
        **class_data.model_dump(),
        created_by=current_user.id
    )
    
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return new_class


@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    class_data: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza uma turma existente
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    # Update fields
    for field, value in class_data.model_dump(exclude_unset=True).items():
        setattr(class_obj, field, value)
    
    class_obj.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(class_obj)
    
    return class_obj


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deleta uma turma (soft delete - marca como inativa)
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    # Soft delete - just mark as inactive
    class_obj.is_active = False
    class_obj.updated_at = datetime.utcnow()
    
    db.commit()
    
    return None


# Student management endpoints
@router.post("/{class_id}/students", response_model=ClassResponse)
def add_student_to_class(
    class_id: int,
    student_data: ClassStudentAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Adiciona um aluno à turma
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    if class_obj.is_full:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Turma está cheia ({class_obj.max_students} alunos)"
        )
    
    student = db.query(Student).filter(
        Student.id == student_data.student_id,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado"
        )
    
    # Check if student already enrolled
    if student in class_obj.students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aluno já está matriculado nesta turma"
        )
    
    # Add student
    class_obj.students.append(student)
    class_obj.current_students += 1
    class_obj.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(class_obj)
    
    return class_obj


@router.delete("/{class_id}/students/{student_id}", response_model=ClassResponse)
def remove_student_from_class(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove um aluno da turma
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.institution_id == current_user.institution_id
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado"
        )
    
    if student not in class_obj.students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aluno não está matriculado nesta turma"
        )
    
    # Remove student
    class_obj.students.remove(student)
    class_obj.current_students = max(0, class_obj.current_students - 1)
    class_obj.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(class_obj)
    
    return class_obj


@router.get("/{class_id}/students", response_model=List[dict])
def list_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os alunos de uma turma
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "enrollment_number": s.enrollment_number,
            "current_grade": s.current_grade,
            "name": f"{s.user.first_name} {s.user.last_name}" if s.user else "N/A"
        }
        for s in class_obj.students
    ]


# Teacher management endpoints
@router.post("/{class_id}/teachers", response_model=ClassResponse)
def add_teacher_to_class(
    class_id: int,
    teacher_data: ClassTeacherAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Adiciona um professor à turma
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    teacher = db.query(User).filter(
        User.id == teacher_data.teacher_id,
        User.institution_id == current_user.institution_id,
        User.role == "professor"
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado"
        )
    
    # Check if teacher already assigned
    if teacher in class_obj.teachers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Professor já está atribuído a esta turma"
        )
    
    # Add teacher
    class_obj.teachers.append(teacher)
    class_obj.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(class_obj)
    
    return class_obj


@router.get("/professor/{teacher_id}", response_model=List[ClassListResponse])
def list_teacher_classes(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as turmas de um professor específico
    """
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.institution_id == current_user.institution_id,
        User.role == "professor"
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não encontrado"
        )
    
    return [
        ClassListResponse(
            id=c.id,
            name=c.name,
            code=c.code,
            school_year=c.school_year,
            current_students=c.current_students,
            max_students=c.max_students,
            is_active=c.is_active,
            classroom=c.classroom,
            is_full=c.is_full
        )
        for c in teacher.teaching_classes
        if c.is_active
    ]


@router.get("/{class_id}/stats", response_model=ClassStats)
def get_class_stats(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas da turma
    """
    class_obj = db.query(Class).filter(
        Class.id == class_id,
        Class.institution_id == current_user.institution_id
    ).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    # Get attendance stats for today
    from app.models import Attendance
    today = date.today()
    
    today_attendance = db.query(Attendance).filter(
        Attendance.class_id == class_id,
        Attendance.date == today
    ).all()
    
    present_today = sum(1 for a in today_attendance if a.present)
    absent_today = len(today_attendance) - present_today
    
    # Calculate average attendance
    total_attendance = db.query(Attendance).filter(
        Attendance.class_id == class_id
    ).count()
    
    present_total = db.query(Attendance).filter(
        Attendance.class_id == class_id,
        Attendance.present == True
    ).count()
    
    average_attendance = (present_total / total_attendance * 100) if total_attendance > 0 else 0
    
    # Get average grade
    from app.models import Grade
    avg_grade = db.query(func.avg(Grade.grade)).filter(
        Grade.class_id == class_id
    ).scalar()
    
    # Count pending assignments
    from app.models import Assignment
    pending_assignments = db.query(Assignment).filter(
        Assignment.class_id == class_id,
        Assignment.status == "published",
        Assignment.due_date >= datetime.utcnow()
    ).count()
    
    return ClassStats(
        total_students=class_obj.current_students,
        present_today=present_today,
        absent_today=absent_today,
        average_attendance=round(average_attendance, 2),
        average_grade=float(avg_grade) if avg_grade else None,
        pending_assignments=pending_assignments
    )
