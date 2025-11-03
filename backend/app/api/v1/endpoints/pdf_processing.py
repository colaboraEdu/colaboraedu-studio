"""
Endpoints para processamento de PDFs (Boletins)
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import json
from datetime import datetime
import logging

from ...database import get_db
from ...models.user import User
from ...api.deps import get_current_user
from ...schemas.pdf_extraction import (
    PDFUploadResponse,
    PDFProcessingStatus,
    PDFValidationRequest,
    PDFValidationResponse,
    BulletinData
)
from ...services.pdf_extractor import extract_bulletin_data
from ...models.student import Student
from ...models.grade import Grade
from ...models.attendance import Attendance
from ...config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Armazenamento temporário de processamentos (em produção, usar Redis ou banco)
processing_jobs = {}


async def process_pdf_background(
    job_id: str,
    pdf_bytes: bytes,
    filename: str,
    gemini_key: Optional[str]
):
    """
    Processa PDF em background
    """
    try:
        logger.info(f"Iniciando processamento background do job {job_id}")
        
        # Atualizar status
        processing_jobs[job_id]["status"] = "processing"
        processing_jobs[job_id]["progress"] = 10
        
        # Extrair dados
        bulletin_data = await extract_bulletin_data(
            pdf_bytes=pdf_bytes,
            filename=filename,
            gemini_api_key=gemini_key
        )
        
        # Atualizar progresso
        processing_jobs[job_id]["progress"] = 90
        
        # Salvar resultado
        processing_jobs[job_id].update({
            "status": "completed",
            "progress": 100,
            "extracted_data": bulletin_data.dict(),
            "completed_at": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Job {job_id} concluído com sucesso")
        
    except Exception as e:
        logger.error(f"Erro no job {job_id}: {str(e)}", exc_info=True)
        processing_jobs[job_id].update({
            "status": "failed",
            "error_message": str(e),
            "completed_at": datetime.utcnow().isoformat()
        })


@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload de PDF para extração de dados de boletim
    
    - Aceita apenas arquivos PDF
    - Máximo 50MB
    - Processamento assíncrono em background
    """
    # Validações
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Apenas arquivos PDF são aceitos"
        )
    
    # Ler arquivo
    pdf_bytes = await file.read()
    file_size = len(pdf_bytes)
    
    if file_size > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(
            status_code=400,
            detail="Arquivo muito grande. Máximo 50MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio"
        )
    
    # Criar job de processamento
    job_id = str(uuid.uuid4())
    
    processing_jobs[job_id] = {
        "id": job_id,
        "filename": file.filename,
        "size": file_size,
        "status": "pending",
        "progress": 0,
        "extracted_data": None,
        "error_message": None,
        "created_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "user_id": str(current_user.id)
    }
    
    # Processar em background
    background_tasks.add_task(
        process_pdf_background,
        job_id=job_id,
        pdf_bytes=pdf_bytes,
        filename=file.filename,
        gemini_key=getattr(settings, 'GEMINI_API_KEY', None)
    )
    
    logger.info(f"PDF {file.filename} enviado para processamento (job: {job_id})")
    
    return PDFUploadResponse(
        id=job_id,
        filename=file.filename,
        size=file_size,
        status="pending",
        message="Arquivo recebido e aguardando processamento"
    )


@router.get("/status/{job_id}", response_model=PDFProcessingStatus)
async def get_processing_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Consulta status do processamento de um PDF
    """
    if job_id not in processing_jobs:
        raise HTTPException(
            status_code=404,
            detail="Job de processamento não encontrado"
        )
    
    job_data = processing_jobs[job_id]
    
    # Verificar permissão (usuário deve ser dono do job)
    if job_data["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para acessar este job"
        )
    
    # Converter extracted_data de dict para BulletinData se existir
    extracted_data = None
    if job_data["extracted_data"]:
        try:
            extracted_data = BulletinData(**job_data["extracted_data"])
        except Exception as e:
            logger.error(f"Erro ao converter extracted_data: {e}")
    
    return PDFProcessingStatus(
        id=job_data["id"],
        filename=job_data["filename"],
        status=job_data["status"],
        progress=job_data["progress"],
        extracted_data=extracted_data,
        error_message=job_data["error_message"],
        created_at=datetime.fromisoformat(job_data["created_at"]),
        completed_at=datetime.fromisoformat(job_data["completed_at"]) if job_data["completed_at"] else None
    )


@router.get("/list", response_model=List[PDFProcessingStatus])
async def list_processing_jobs(
    current_user: User = Depends(get_current_user),
    limit: int = 50
):
    """
    Lista todos os jobs de processamento do usuário
    """
    user_jobs = [
        job for job in processing_jobs.values()
        if job["user_id"] == str(current_user.id)
    ]
    
    # Ordenar por data de criação (mais recente primeiro)
    user_jobs.sort(
        key=lambda x: x["created_at"],
        reverse=True
    )
    
    # Limitar resultados
    user_jobs = user_jobs[:limit]
    
    # Converter para response model
    result = []
    for job_data in user_jobs:
        extracted_data = None
        if job_data["extracted_data"]:
            try:
                extracted_data = BulletinData(**job_data["extracted_data"])
            except:
                pass
        
        result.append(PDFProcessingStatus(
            id=job_data["id"],
            filename=job_data["filename"],
            status=job_data["status"],
            progress=job_data["progress"],
            extracted_data=extracted_data,
            error_message=job_data["error_message"],
            created_at=datetime.fromisoformat(job_data["created_at"]),
            completed_at=datetime.fromisoformat(job_data["completed_at"]) if job_data["completed_at"] else None
        ))
    
    return result


@router.post("/validate", response_model=PDFValidationResponse)
async def validate_and_save(
    request: PDFValidationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Valida dados extraídos e salva no banco de dados
    
    - Permite correções manuais antes de salvar
    - Cria/atualiza aluno, notas e frequência
    - Retorna estatísticas de criação
    """
    # Verificar se job existe
    if request.extraction_id not in processing_jobs:
        raise HTTPException(
            status_code=404,
            detail="Job de processamento não encontrado"
        )
    
    job_data = processing_jobs[request.extraction_id]
    
    # Verificar permissão
    if job_data["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para validar este job"
        )
    
    if not request.approve:
        return PDFValidationResponse(
            success=False,
            message="Dados não aprovados. Nenhuma alteração foi feita no banco de dados."
        )
    
    errors = []
    students_created = 0
    grades_created = 0
    attendance_created = 0
    
    try:
        bulletin = request.validated_data
        
        # 1. Buscar ou criar aluno
        student = None
        if bulletin.student.enrollment_number:
            student = db.query(Student).filter(
                Student.enrollment_number == bulletin.student.enrollment_number
            ).first()
        
        if not student:
            # Criar novo aluno
            student = Student(
                id=str(uuid.uuid4()),
                full_name=bulletin.student.full_name,
                enrollment_number=bulletin.student.enrollment_number or str(uuid.uuid4())[:8],
                birth_date=bulletin.student.birth_date if bulletin.student.birth_date else None,
                class_name=bulletin.student.class_name,
                academic_year=bulletin.student.academic_year,
                institution_id=current_user.institution_id,
                created_by=str(current_user.id)
            )
            db.add(student)
            students_created += 1
            logger.info(f"Novo aluno criado: {student.full_name}")
        else:
            # Atualizar informações
            student.full_name = bulletin.student.full_name
            if bulletin.student.class_name:
                student.class_name = bulletin.student.class_name
            logger.info(f"Aluno atualizado: {student.full_name}")
        
        db.flush()  # Garante que student.id está disponível
        
        # 2. Criar notas
        for subject_grade in bulletin.grades:
            # Verificar se já existe nota para esta disciplina/período
            existing_grade = db.query(Grade).filter(
                Grade.student_id == student.id,
                Grade.subject == subject_grade.subject_name,
                Grade.academic_year == bulletin.student.academic_year,
                Grade.semester == bulletin.student.semester or 1
            ).first()
            
            if not existing_grade:
                # Criar novas notas (uma por bimestre)
                for bim_num, grade_value in enumerate([
                    subject_grade.grade_1,
                    subject_grade.grade_2,
                    subject_grade.grade_3,
                    subject_grade.grade_4
                ], 1):
                    if grade_value is not None:
                        grade = Grade(
                            id=str(uuid.uuid4()),
                            student_id=student.id,
                            subject=subject_grade.subject_name,
                            grade=float(grade_value),
                            academic_year=bulletin.student.academic_year,
                            semester=bulletin.student.semester or 1,
                            quarter=bim_num,
                            created_by=str(current_user.id)
                        )
                        db.add(grade)
                        grades_created += 1
            else:
                logger.info(f"Nota já existe para {subject_grade.subject_name}, pulando...")
        
        # 3. Criar/atualizar frequência
        if bulletin.attendance:
            attendance = db.query(Attendance).filter(
                Attendance.student_id == student.id,
                Attendance.academic_year == bulletin.student.academic_year
            ).first()
            
            if not attendance:
                attendance = Attendance(
                    id=str(uuid.uuid4()),
                    student_id=student.id,
                    total_classes=bulletin.attendance.total_days,
                    attended_classes=bulletin.attendance.present_days,
                    academic_year=bulletin.student.academic_year,
                    created_by=str(current_user.id)
                )
                db.add(attendance)
                attendance_created += 1
            else:
                attendance.total_classes = bulletin.attendance.total_days
                attendance.attended_classes = bulletin.attendance.present_days
        
        # Commit no banco
        db.commit()
        
        logger.info(
            f"Validação concluída: {students_created} alunos, "
            f"{grades_created} notas, {attendance_created} frequências criadas"
        )
        
        return PDFValidationResponse(
            success=True,
            message="Dados validados e salvos com sucesso!",
            students_created=students_created,
            grades_created=grades_created,
            attendance_created=attendance_created,
            errors=errors
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao salvar dados: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar dados no banco: {str(e)}"
        )


@router.delete("/{job_id}")
async def delete_processing_job(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Remove um job de processamento
    """
    if job_id not in processing_jobs:
        raise HTTPException(
            status_code=404,
            detail="Job não encontrado"
        )
    
    job_data = processing_jobs[job_id]
    
    if job_data["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para deletar este job"
        )
    
    del processing_jobs[job_id]
    
    return {"message": "Job removido com sucesso"}
