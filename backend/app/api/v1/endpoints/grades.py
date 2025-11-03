"""
Grades API endpoints
Academic grade management
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.models import User, Student, Grade
from app.schemas.grade import GradeCreate, GradeUpdate, GradeResponse
from app.schemas.pagination import PaginatedResponse
from app.core.security import get_user_permissions


router = APIRouter()


@router.get("/", response_model=PaginatedResponse[GradeResponse])
async def get_grades(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    student_id: str = Query(None),
    subject: str = Query(None),
    semester: int = Query(None),
    academic_year: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of grades with optional filtering"""
    
    # Check permissions
    if not get_user_permissions(current_user.role, "grades", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(Grade).join(Student).join(User)
    
    # Apply institution filter for non-admin users
    if current_user.role != "admin":
        query = query.filter(User.institution_id == current_user.institution_id)
    
    # Apply filters
    if student_id:
        query = query.filter(Grade.student_id == student_id)
    if subject:
        query = query.filter(Grade.subject == subject)
    if semester:
        query = query.filter(Grade.semester == semester)
    if academic_year:
        query = query.filter(Grade.academic_year == academic_year)
    
    # Apply soft delete filter
    query = query.filter(User.deleted_at.is_(None))
    
    total = query.count()
    grades = query.offset(skip).limit(limit).all()
    
    return PaginatedResponse(
        items=grades,
        total=total,
        page=skip // limit + 1,
        per_page=limit,
        pages=(total + limit - 1) // limit
    )


@router.get("/{grade_id}", response_model=GradeResponse)
async def get_grade(
    grade_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get grade by ID"""
    
    # Check permissions
    if not get_user_permissions(current_user.role, "grades", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grade = db.query(Grade).join(Student).join(User).filter(
        Grade.id == grade_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    # Check if user can access this grade (same institution for non-admin)
    if current_user.role != "admin" and grade.student.user.institution_id != current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return grade


@router.post("/", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
async def create_grade(
    grade_data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new grade"""
    
    # Check permissions
    if not get_user_permissions(current_user.role, "grades", "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if student exists
    student = db.query(Student).join(User).filter(
        Student.id == grade_data.student_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student not found"
        )
    
    # Non-admin users can only create grades for students in their own institution
    if current_user.role != "admin" and student.user.institution_id != current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create grades for students in your own institution"
        )
    
    # Create grade
    db_grade = Grade(
        student_id=grade_data.student_id,
        subject=grade_data.subject,
        grade_value=grade_data.grade_value,
        grade_type=grade_data.grade_type,
        semester=grade_data.semester,
        academic_year=grade_data.academic_year,
        teacher_id=current_user.id,  # Set current user as teacher
        comments=grade_data.comments
    )
    
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    
    return db_grade


@router.put("/{grade_id}", response_model=GradeResponse)
async def update_grade(
    grade_id: str,
    grade_data: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update grade"""
    
    # Check permissions
    if not get_user_permissions(current_user.role, "grades", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grade = db.query(Grade).join(Student).join(User).filter(
        Grade.id == grade_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    # Check if user can update this grade (same institution for non-admin)
    if current_user.role != "admin" and grade.student.user.institution_id != current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Teachers can only update their own grades (unless admin/coordinator)
    if (current_user.role == "professor" and 
        grade.teacher_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own grades"
        )
    
    # Update fields
    update_data = grade_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(grade, field, value)
    
    db.commit()
    db.refresh(grade)
    
    return grade


@router.delete("/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_grade(
    grade_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete grade"""
    
    # Check permissions
    if not get_user_permissions(current_user.role, "grades", "delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    grade = db.query(Grade).join(Student).join(User).filter(
        Grade.id == grade_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grade not found"
        )
    
    # Check if user can delete this grade (same institution for non-admin)
    if current_user.role != "admin" and grade.student.user.institution_id != current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Teachers can only delete their own grades (unless admin/coordinator)
    if (current_user.role == "professor" and 
        grade.teacher_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete your own grades"
        )
    
    db.delete(grade)
    db.commit()


@router.get("/student/{student_id}/summary", response_model=dict)
async def get_student_grade_summary(
    student_id: str,
    academic_year: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get grade summary for a student"""
    
    # Check permissions
    if not get_user_permissions(current_user.role, "grades", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify student exists and user has access
    student = db.query(Student).join(User).filter(
        Student.id == student_id,
        User.deleted_at.is_(None)
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if user can access this student
    if current_user.role != "admin" and student.user.institution_id != current_user.institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get grades
    query = db.query(Grade).filter(Grade.student_id == student_id)
    
    if academic_year:
        query = query.filter(Grade.academic_year == academic_year)
    
    grades = query.all()
    
    # Calculate summary
    if not grades:
        return {"message": "No grades found for this student"}
    
    # Group by subject and semester
    subjects = {}
    for grade in grades:
        if grade.subject not in subjects:
            subjects[grade.subject] = {}
        
        semester_key = f"semester_{grade.semester}"
        if semester_key not in subjects[grade.subject]:
            subjects[grade.subject][semester_key] = []
        
        subjects[grade.subject][semester_key].append({
            "grade_value": float(grade.grade),
            "created_at": str(grade.created_at)
        })
    
    # Calculate averages
    for subject in subjects:
        for semester in subjects[subject]:
            if isinstance(subjects[subject][semester], list):
                grades_list = subjects[subject][semester]
                if grades_list:
                    avg = sum(g["grade_value"] for g in grades_list) / len(grades_list)
                    subjects[subject][f"{semester}_average"] = round(avg, 2)
    
    return {
        "student_id": student_id,
        "student_name": f"{student.user.first_name} {student.user.last_name}",
        "academic_year": academic_year,
        "subjects": subjects,
        "total_grades": len(grades)
    }


@router.get("/student/{student_id}/report-card")
async def get_student_report_card(
    student_id: str,
    academic_year: int = Query(..., description="Ano letivo"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gera boletim completo do aluno
    """
    from sqlalchemy import func
    
    # Verify student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Get all grades for the year
    grades = db.query(Grade).filter(
        Grade.student_id == student_id,
        Grade.academic_year == academic_year
    ).all()
    
    # Group by subject
    report = {}
    for grade in grades:
        if grade.subject not in report:
            report[grade.subject] = {
                "grades": [],
                "semester_1": [],
                "semester_2": [],
                "final_average": 0
            }
        
        grade_data = {
            "value": float(grade.grade),
            "semester": grade.semester,
            "date": str(grade.created_at)
        }
        report[grade.subject]["grades"].append(grade_data)
        
        if grade.semester == 1:
            report[grade.subject]["semester_1"].append(float(grade.grade))
        elif grade.semester == 2:
            report[grade.subject]["semester_2"].append(float(grade.grade))
    
    # Calculate averages
    for subject in report:
        s1 = report[subject]["semester_1"]
        s2 = report[subject]["semester_2"]
        
        report[subject]["semester_1_avg"] = round(sum(s1) / len(s1), 2) if s1 else 0
        report[subject]["semester_2_avg"] = round(sum(s2) / len(s2), 2) if s2 else 0
        
        all_grades = s1 + s2
        report[subject]["final_average"] = round(sum(all_grades) / len(all_grades), 2) if all_grades else 0
        report[subject]["status"] = "Aprovado" if report[subject]["final_average"] >= 6.0 else "Reprovado"
    
    # Calculate general average
    final_averages = [report[s]["final_average"] for s in report]
    general_average = round(sum(final_averages) / len(final_averages), 2) if final_averages else 0
    
    return {
        "student": {
            "id": student.id,
            "name": f"{student.user.first_name} {student.user.last_name}",
            "enrollment": student.enrollment_number,
            "grade": student.current_grade
        },
        "academic_year": academic_year,
        "subjects": report,
        "general_average": general_average,
        "total_subjects": len(report),
        "generated_at": str(func.now())
    }


@router.get("/class/{class_id}/grades")
async def get_class_grades(
    class_id: int,
    subject: str = Query(None),
    semester: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as notas de uma turma
    """
    from app.models import Class
    
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    # Get all students in class
    students = class_obj.students
    
    result = []
    for student in students:
        query = db.query(Grade).filter(Grade.student_id == student.id)
        
        if subject:
            query = query.filter(Grade.subject == subject)
        if semester:
            query = query.filter(Grade.semester == semester)
        
        grades = query.all()
        
        if grades:
            avg = sum(float(g.grade) for g in grades) / len(grades)
        else:
            avg = 0
        
        result.append({
            "student_id": student.id,
            "student_name": f"{student.user.first_name} {student.user.last_name}",
            "enrollment": student.enrollment_number,
            "grades": [{
                "id": g.id,
                "subject": g.subject,
                "grade": float(g.grade),
                "semester": g.semester,
                "academic_year": g.academic_year
            } for g in grades],
            "average": round(avg, 2),
            "total_grades": len(grades)
        })
    
    return {
        "class_id": class_id,
        "class_name": class_obj.name,
        "students": result,
        "total_students": len(result)
    }


@router.post("/class/{class_id}/bulk")
async def create_bulk_grades(
    class_id: int,
    grades_data: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lançar notas em massa para uma turma
    
    grades_data exemplo:
    [
        {"student_id": "123", "subject": "Matemática", "grade": 8.5, "semester": 1},
        {"student_id": "456", "subject": "Matemática", "grade": 7.0, "semester": 1}
    ]
    """
    from app.models import Class
    from datetime import datetime
    
    # Verify class
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    created_grades = []
    errors = []
    
    for grade_info in grades_data:
        try:
            # Verify student is in class
            student = db.query(Student).filter(Student.id == grade_info["student_id"]).first()
            if not student or student not in class_obj.students:
                errors.append(f"Aluno {grade_info['student_id']} não encontrado na turma")
                continue
            
            new_grade = Grade(
                student_id=grade_info["student_id"],
                subject=grade_info["subject"],
                grade=grade_info["grade"],
                semester=grade_info.get("semester", 1),
                academic_year=grade_info.get("academic_year", datetime.now().year),
                class_id=class_id,
                institution_id=class_obj.institution_id
            )
            
            db.add(new_grade)
            created_grades.append(new_grade)
            
        except Exception as e:
            errors.append(f"Erro ao criar nota para aluno {grade_info.get('student_id')}: {str(e)}")
    
    if created_grades:
        db.commit()
        for grade in created_grades:
            db.refresh(grade)
    
    return {
        "success": len(created_grades),
        "errors": len(errors),
        "created_grades": [{
            "id": g.id,
            "student_id": g.student_id,
            "subject": g.subject,
            "grade": float(g.grade)
        } for g in created_grades],
        "error_messages": errors
    }


@router.get("/statistics/class/{class_id}")
async def get_class_statistics(
    class_id: int,
    subject: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Estatísticas de notas de uma turma
    """
    from app.models import Class
    from sqlalchemy import func
    
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    query = db.query(Grade).filter(Grade.class_id == class_id)
    
    if subject:
        query = query.filter(Grade.subject == subject)
    
    grades = query.all()
    
    if not grades:
        return {"message": "Nenhuma nota encontrada"}
    
    grade_values = [float(g.grade) for g in grades]
    
    return {
        "class_id": class_id,
        "class_name": class_obj.name,
        "subject": subject,
        "total_grades": len(grades),
        "average": round(sum(grade_values) / len(grade_values), 2),
        "highest": max(grade_values),
        "lowest": min(grade_values),
        "approved": len([g for g in grade_values if g >= 6.0]),
        "failed": len([g for g in grade_values if g < 6.0]),
        "approval_rate": round(len([g for g in grade_values if g >= 6.0]) / len(grade_values) * 100, 2)
    }