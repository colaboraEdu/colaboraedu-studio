"""
Attendance API endpoints
Student attendance tracking and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date, datetime, timedelta

from app.api.deps import get_db, get_current_user
from app.models import Attendance, User, Student, Class

router = APIRouter()


@router.post("/")
async def create_attendance(
    student_id: str,
    class_id: int,
    date: date,
    present: bool,
    period: Optional[str] = None,
    justified: bool = False,
    justification: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar presença individual
    """
    # Verify student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Check if attendance already exists
    existing = db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.class_id == class_id,
        Attendance.date == date,
        Attendance.period == period
    ).first()
    
    if existing:
        # Update existing
        existing.present = present
        existing.justified = justified
        existing.justification = justification
        existing.recorded_by = current_user.id
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new attendance
    attendance = Attendance(
        institution_id=current_user.institution_id,
        student_id=student_id,
        class_id=class_id,
        date=date,
        period=period,
        present=present,
        justified=justified,
        justification=justification,
        recorded_by=current_user.id
    )
    
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    
    return attendance


@router.post("/bulk")
async def create_bulk_attendance(
    class_id: int,
    date: date,
    attendances: List[dict],
    period: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar presença em massa para uma turma
    
    attendances exemplo:
    [
        {"student_id": "123", "present": true},
        {"student_id": "456", "present": false, "justified": true, "justification": "Atestado médico"}
    ]
    """
    # Verify class
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    created = []
    updated = []
    errors = []
    
    for att_data in attendances:
        try:
            student_id = att_data["student_id"]
            
            # Check if student is in class
            student = db.query(Student).filter(Student.id == student_id).first()
            if not student or student not in class_obj.students:
                errors.append(f"Aluno {student_id} não encontrado na turma")
                continue
            
            # Check if attendance already exists
            existing = db.query(Attendance).filter(
                Attendance.student_id == student_id,
                Attendance.class_id == class_id,
                Attendance.date == date,
                Attendance.period == period
            ).first()
            
            if existing:
                # Update
                existing.present = att_data["present"]
                existing.justified = att_data.get("justified", False)
                existing.justification = att_data.get("justification")
                existing.recorded_by = current_user.id
                updated.append(existing)
            else:
                # Create
                attendance = Attendance(
                    institution_id=current_user.institution_id,
                    student_id=student_id,
                    class_id=class_id,
                    date=date,
                    period=period,
                    present=att_data["present"],
                    justified=att_data.get("justified", False),
                    justification=att_data.get("justification"),
                    recorded_by=current_user.id
                )
                db.add(attendance)
                created.append(attendance)
        
        except Exception as e:
            errors.append(f"Erro ao processar aluno {att_data.get('student_id')}: {str(e)}")
    
    if created or updated:
        db.commit()
        for att in created:
            db.refresh(att)
        for att in updated:
            db.refresh(att)
    
    return {
        "success": True,
        "created": len(created),
        "updated": len(updated),
        "errors": len(errors),
        "error_messages": errors,
        "total_processed": len(created) + len(updated)
    }


@router.get("/class/{class_id}/date/{attendance_date}")
async def get_class_attendance_by_date(
    class_id: int,
    attendance_date: date,
    period: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar presença de uma turma em uma data específica
    """
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    query = db.query(Attendance).filter(
        Attendance.class_id == class_id,
        Attendance.date == attendance_date
    )
    
    if period:
        query = query.filter(Attendance.period == period)
    
    attendances = query.all()
    
    # Get all students in class
    all_students = class_obj.students
    
    # Create dict of recorded attendances
    recorded = {att.student_id: att for att in attendances}
    
    result = []
    for student in all_students:
        if student.id in recorded:
            att = recorded[student.id]
            result.append({
                "student_id": student.id,
                "student_name": f"{student.user.first_name} {student.user.last_name}",
                "enrollment": student.enrollment_number,
                "present": att.present,
                "justified": att.justified,
                "justification": att.justification,
                "recorded": True
            })
        else:
            result.append({
                "student_id": student.id,
                "student_name": f"{student.user.first_name} {student.user.last_name}",
                "enrollment": student.enrollment_number,
                "present": None,
                "justified": False,
                "justification": None,
                "recorded": False
            })
    
    present_count = sum(1 for att in attendances if att.present)
    absent_count = len(attendances) - present_count
    
    return {
        "class_id": class_id,
        "class_name": class_obj.name,
        "date": str(attendance_date),
        "period": period,
        "total_students": len(all_students),
        "recorded": len(attendances),
        "present": present_count,
        "absent": absent_count,
        "not_recorded": len(all_students) - len(attendances),
        "students": result
    }


@router.get("/student/{student_id}/report")
async def get_student_attendance_report(
    student_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Relatório de presença de um aluno
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    query = db.query(Attendance).filter(Attendance.student_id == student_id)
    
    if class_id:
        query = query.filter(Attendance.class_id == class_id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    attendances = query.all()
    
    if not attendances:
        return {"message": "Nenhuma presença registrada para este aluno"}
    
    total = len(attendances)
    present = sum(1 for att in attendances if att.present)
    absent = total - present
    justified = sum(1 for att in attendances if not att.present and att.justified)
    unjustified = absent - justified
    
    # Calculate percentage
    attendance_rate = (present / total * 100) if total > 0 else 0
    
    # Group by month
    by_month = {}
    for att in attendances:
        month_key = att.date.strftime("%Y-%m")
        if month_key not in by_month:
            by_month[month_key] = {"present": 0, "absent": 0, "total": 0}
        
        by_month[month_key]["total"] += 1
        if att.present:
            by_month[month_key]["present"] += 1
        else:
            by_month[month_key]["absent"] += 1
    
    return {
        "student": {
            "id": student.id,
            "name": f"{student.user.first_name} {student.user.last_name}",
            "enrollment": student.enrollment_number,
            "grade": student.current_grade
        },
        "period": {
            "start": str(start_date) if start_date else "início",
            "end": str(end_date) if end_date else "atual"
        },
        "summary": {
            "total": total,
            "present": present,
            "absent": absent,
            "justified_absences": justified,
            "unjustified_absences": unjustified,
            "attendance_rate": round(attendance_rate, 2)
        },
        "by_month": by_month,
        "status": "Aprovado" if attendance_rate >= 75 else "Reprovado por Falta"
    }


@router.get("/class/{class_id}/statistics")
async def get_class_attendance_statistics(
    class_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Estatísticas de presença de uma turma
    """
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Turma não encontrada")
    
    query = db.query(Attendance).filter(Attendance.class_id == class_id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    attendances = query.all()
    
    if not attendances:
        return {"message": "Nenhuma presença registrada"}
    
    total = len(attendances)
    present = sum(1 for att in attendances if att.present)
    absent = total - present
    
    # Attendance by student
    by_student = {}
    for att in attendances:
        if att.student_id not in by_student:
            by_student[att.student_id] = {"present": 0, "absent": 0, "total": 0}
        
        by_student[att.student_id]["total"] += 1
        if att.present:
            by_student[att.student_id]["present"] += 1
        else:
            by_student[att.student_id]["absent"] += 1
    
    # Students with low attendance
    low_attendance = []
    for student_id, stats in by_student.items():
        rate = (stats["present"] / stats["total"] * 100) if stats["total"] > 0 else 0
        if rate < 75:
            student = db.query(Student).filter(Student.id == student_id).first()
            if student:
                low_attendance.append({
                    "student_id": student_id,
                    "student_name": f"{student.user.first_name} {student.user.last_name}",
                    "attendance_rate": round(rate, 2),
                    "total": stats["total"],
                    "present": stats["present"],
                    "absent": stats["absent"]
                })
    
    return {
        "class_id": class_id,
        "class_name": class_obj.name,
        "period": {
            "start": str(start_date) if start_date else "início",
            "end": str(end_date) if end_date else "atual"
        },
        "overall": {
            "total_records": total,
            "present": present,
            "absent": absent,
            "attendance_rate": round((present / total * 100), 2) if total > 0 else 0
        },
        "students_tracked": len(by_student),
        "students_low_attendance": len(low_attendance),
        "low_attendance_details": low_attendance
    }


@router.delete("/{attendance_id}")
async def delete_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletar registro de presença
    """
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Registro de presença não encontrado")
    
    db.delete(attendance)
    db.commit()
    
    return {"message": "Registro deletado com sucesso"}
