"""
Endpoints para parâmetros acadêmicos
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.database import get_db
from app.api.deps import get_current_user
from app.models.academic_parameters import AcademicParameter, GradeLevel, Subject
from app.schemas.academic_parameters import (
    AcademicParameterCreate,
    AcademicParameterUpdate,
    AcademicParameterOut,
    GradeLevelCreate,
    GradeLevelUpdate,
    GradeLevelOut,
    SubjectCreate,
    SubjectUpdate,
    SubjectOut
)

router = APIRouter()


# Academic Parameters Endpoints
@router.get("/parameters", response_model=List[AcademicParameterOut])
def get_academic_parameters(
    institution_id: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Listar parâmetros acadêmicos"""
    query = db.query(AcademicParameter)
    
    if institution_id:
        query = query.filter(AcademicParameter.institution_id == institution_id)
    
    parameters = query.offset(skip).limit(limit).all()
    return parameters


@router.get("/parameters/{parameter_id}", response_model=AcademicParameterOut)
def get_academic_parameter(
    parameter_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter parâmetro acadêmico por ID"""
    parameter = db.query(AcademicParameter).filter(AcademicParameter.id == parameter_id).first()
    if not parameter:
        raise HTTPException(status_code=404, detail="Parâmetro não encontrado")
    return parameter


@router.post("/parameters", response_model=AcademicParameterOut, status_code=status.HTTP_201_CREATED)
def create_academic_parameter(
    parameter: AcademicParameterCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Criar novo parâmetro acadêmico"""
    now = datetime.utcnow().isoformat()
    
    db_parameter = AcademicParameter(
        id=str(uuid.uuid4()),
        **parameter.model_dump(),
        created_at=now,
        updated_at=now,
        created_by=current_user.get("user_id", "system")
    )
    
    db.add(db_parameter)
    db.commit()
    db.refresh(db_parameter)
    
    return db_parameter


@router.put("/parameters/{parameter_id}", response_model=AcademicParameterOut)
def update_academic_parameter(
    parameter_id: str,
    parameter_update: AcademicParameterUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Atualizar parâmetro acadêmico"""
    db_parameter = db.query(AcademicParameter).filter(AcademicParameter.id == parameter_id).first()
    if not db_parameter:
        raise HTTPException(status_code=404, detail="Parâmetro não encontrado")
    
    update_data = parameter_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    update_data["updated_by"] = current_user.get("user_id", "system")
    
    for field, value in update_data.items():
        setattr(db_parameter, field, value)
    
    db.commit()
    db.refresh(db_parameter)
    
    return db_parameter


@router.delete("/parameters/{parameter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_academic_parameter(
    parameter_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletar parâmetro acadêmico"""
    db_parameter = db.query(AcademicParameter).filter(AcademicParameter.id == parameter_id).first()
    if not db_parameter:
        raise HTTPException(status_code=404, detail="Parâmetro não encontrado")
    
    db.delete(db_parameter)
    db.commit()
    
    return None


# Grade Levels Endpoints
@router.get("/grade-levels", response_model=List[GradeLevelOut])
def get_grade_levels(
    institution_id: str = None,
    education_level: str = None,
    active: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Listar níveis escolares"""
    query = db.query(GradeLevel)
    
    if institution_id:
        query = query.filter(GradeLevel.institution_id == institution_id)
    if education_level:
        query = query.filter(GradeLevel.education_level == education_level)
    if active is not None:
        query = query.filter(GradeLevel.active == active)
    
    levels = query.order_by(GradeLevel.level).offset(skip).limit(limit).all()
    return levels


@router.get("/grade-levels/{level_id}", response_model=GradeLevelOut)
def get_grade_level(
    level_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter nível escolar por ID"""
    level = db.query(GradeLevel).filter(GradeLevel.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Nível não encontrado")
    return level


@router.post("/grade-levels", response_model=GradeLevelOut, status_code=status.HTTP_201_CREATED)
def create_grade_level(
    level: GradeLevelCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Criar novo nível escolar"""
    now = datetime.utcnow().isoformat()
    
    db_level = GradeLevel(
        id=str(uuid.uuid4()),
        **level.model_dump(),
        created_at=now,
        updated_at=now
    )
    
    db.add(db_level)
    db.commit()
    db.refresh(db_level)
    
    return db_level


@router.put("/grade-levels/{level_id}", response_model=GradeLevelOut)
def update_grade_level(
    level_id: str,
    level_update: GradeLevelUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Atualizar nível escolar"""
    db_level = db.query(GradeLevel).filter(GradeLevel.id == level_id).first()
    if not db_level:
        raise HTTPException(status_code=404, detail="Nível não encontrado")
    
    update_data = level_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    for field, value in update_data.items():
        setattr(db_level, field, value)
    
    db.commit()
    db.refresh(db_level)
    
    return db_level


@router.delete("/grade-levels/{level_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grade_level(
    level_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletar nível escolar"""
    db_level = db.query(GradeLevel).filter(GradeLevel.id == level_id).first()
    if not db_level:
        raise HTTPException(status_code=404, detail="Nível não encontrado")
    
    db.delete(db_level)
    db.commit()
    
    return None


# Subjects Endpoints
@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(
    institution_id: str = None,
    is_mandatory: bool = None,
    active: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Listar disciplinas"""
    query = db.query(Subject)
    
    if institution_id:
        query = query.filter(Subject.institution_id == institution_id)
    if is_mandatory is not None:
        query = query.filter(Subject.is_mandatory == is_mandatory)
    if active is not None:
        query = query.filter(Subject.active == active)
    
    subjects = query.order_by(Subject.name).offset(skip).limit(limit).all()
    return subjects


@router.get("/subjects/{subject_id}", response_model=SubjectOut)
def get_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obter disciplina por ID"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return subject


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Criar nova disciplina"""
    now = datetime.utcnow().isoformat()
    
    db_subject = Subject(
        id=str(uuid.uuid4()),
        **subject.model_dump(),
        created_at=now,
        updated_at=now
    )
    
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    
    return db_subject


@router.put("/subjects/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: str,
    subject_update: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Atualizar disciplina"""
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    
    update_data = subject_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    for field, value in update_data.items():
        setattr(db_subject, field, value)
    
    db.commit()
    db.refresh(db_subject)
    
    return db_subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deletar disciplina"""
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    
    db.delete(db_subject)
    db.commit()
    
    return None
