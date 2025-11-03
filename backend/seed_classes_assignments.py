#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados de teste
Cria turmas, tarefas e relacionamentos
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import (
    Class, Assignment, AssignmentSubmission,
    User, Student, Institution, Subject, GradeLevel
)

def seed_classes():
    """
    Cria turmas de exemplo
    """
    db: Session = SessionLocal()
    
    try:
        print("📚 Criando turmas de exemplo...")
        
        # Get institution
        institution = db.query(Institution).first()
        if not institution:
            print("❌ Nenhuma instituição encontrada. Execute seed_data.py primeiro.")
            return False
        
        # Get or create grade levels
        grade_levels = []
        grade_level_data = [
            {"name": "9º Ano", "level": 9, "education_level": "Fundamental"},
            {"name": "1ª Série", "level": 10, "education_level": "Médio"},
            {"name": "2ª Série", "level": 11, "education_level": "Médio"},
            {"name": "3ª Série", "level": 12, "education_level": "Médio"},
        ]
        
        for gl_data in grade_level_data:
            gl = db.query(GradeLevel).filter(
                GradeLevel.name == gl_data["name"],
                GradeLevel.institution_id == institution.id
            ).first()
            
            if not gl:
                from uuid import uuid4
                gl = GradeLevel(
                    id=str(uuid4()),
                    institution_id=institution.id,
                    name=gl_data["name"],
                    level=gl_data["level"],
                    education_level=gl_data["education_level"],
                    active=True,
                    created_at=datetime.utcnow().isoformat(),
                    updated_at=datetime.utcnow().isoformat()
                )
                db.add(gl)
                db.flush()
            
            grade_levels.append(gl)
        
        # Get teacher
        teacher = db.query(User).filter(
            User.role == "professor",
            User.institution_id == institution.id
        ).first()
        
        if not teacher:
            print("❌ Nenhum professor encontrado.")
            return False
        
        # Create classes
        classes_data = [
            {
                "name": "9º Ano A - Matemática",
                "code": "9A-MAT-2025",
                "school_year": "2025",
                "max_students": 40,
                "classroom": "Sala 101"
            },
            {
                "name": "9º Ano B - Matemática",
                "code": "9B-MAT-2025",
                "school_year": "2025",
                "max_students": 40,
                "classroom": "Sala 102"
            },
            {
                "name": "1ª Série A - Física",
                "code": "1A-FIS-2025",
                "school_year": "2025",
                "max_students": 35,
                "classroom": "Lab 201"
            },
            {
                "name": "2ª Série A - Química",
                "code": "2A-QUI-2025",
                "school_year": "2025",
                "max_students": 35,
                "classroom": "Lab 202"
            },
            {
                "name": "3ª Série A - Biologia",
                "code": "3A-BIO-2025",
                "school_year": "2025",
                "max_students": 30,
                "classroom": "Lab 301"
            }
        ]
        
        created_classes = []
        for i, class_data in enumerate(classes_data):
            # Check if already exists
            existing = db.query(Class).filter(
                Class.code == class_data["code"]
            ).first()
            
            if existing:
                print(f"  ⚠️  Turma '{class_data['name']}' já existe")
                created_classes.append(existing)
                continue
            
            new_class = Class(
                name=class_data["name"],
                code=class_data["code"],
                description=f"Turma {class_data['name']} - Ano letivo 2025",
                institution_id=institution.id,
                grade_level_id=grade_levels[min(i, len(grade_levels)-1)].id if grade_levels else None,
                school_year=class_data["school_year"],
                max_students=class_data["max_students"],
                classroom=class_data["classroom"],
                is_active=True,
                created_by=teacher.id
            )
            
            db.add(new_class)
            db.flush()
            
            # Add teacher to class
            new_class.teachers.append(teacher)
            
            created_classes.append(new_class)
            print(f"  ✅ Turma '{class_data['name']}' criada (ID: {new_class.id})")
        
        # Add students to classes
        students = db.query(Student).filter(
            Student.institution_id == institution.id
        ).limit(20).all()
        
        if students:
            print(f"\n👥 Adicionando {len(students)} alunos às turmas...")
            
            for i, student in enumerate(students):
                # Distribute students across classes
                class_obj = created_classes[i % len(created_classes)]
                
                if student not in class_obj.students:
                    class_obj.students.append(student)
                    class_obj.current_students += 1
            
            print(f"  ✅ Alunos distribuídos nas turmas")
        
        db.commit()
        print(f"\n✅ {len(created_classes)} turmas criadas/verificadas!")
        return created_classes
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar turmas: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        db.close()


def seed_assignments():
    """
    Cria tarefas de exemplo para as turmas
    """
    db: Session = SessionLocal()
    
    try:
        print("\n📝 Criando tarefas de exemplo...")
        
        # Get teacher
        teacher = db.query(User).filter(User.role == "professor").first()
        
        if not teacher:
            print("❌ Nenhum professor encontrado.")
            return False
        
        # Get all classes
        classes = db.query(Class).all()
        
        if not classes:
            print("❌ Nenhuma turma encontrada.")
            return False
        
        # Assignment types and titles
        assignments_data = [
            {
                "title": "Exercícios de Álgebra - Capítulo 3",
                "type": "homework",
                "description": "Resolver todos os exercícios das páginas 45 a 52",
                "max_score": 10.0,
                "due_days": 7
            },
            {
                "title": "Trabalho em Grupo - Geometria Espacial",
                "type": "project",
                "description": "Criar uma maquete de sólidos geométricos",
                "max_score": 20.0,
                "due_days": 14
            },
            {
                "title": "Prova Bimestral",
                "type": "exam",
                "description": "Avaliação sobre todo o conteúdo do bimestre",
                "max_score": 30.0,
                "due_days": 3
            },
            {
                "title": "Quiz Rápido - Equações",
                "type": "quiz",
                "description": "Quiz online de 10 questões",
                "max_score": 5.0,
                "due_days": 2
            },
            {
                "title": "Redação sobre Método Científico",
                "type": "essay",
                "description": "Redação de 2 páginas sobre a importância do método científico",
                "max_score": 10.0,
                "due_days": 10
            }
        ]
        
        created_count = 0
        
        for class_obj in classes:
            # Create 2-3 assignments per class
            for i in range(3):
                assign_data = assignments_data[i % len(assignments_data)]
                
                # Check if similar assignment exists
                existing = db.query(Assignment).filter(
                    Assignment.class_id == class_obj.id,
                    Assignment.title == assign_data["title"]
                ).first()
                
                if existing:
                    continue
                
                due_date = datetime.utcnow() + timedelta(days=assign_data["due_days"])
                
                new_assignment = Assignment(
                    title=assign_data["title"],
                    description=assign_data["description"],
                    instructions=f"Instruções detalhadas para {assign_data['title']}",
                    type=assign_data["type"],
                    status="published",
                    class_id=class_obj.id,
                    teacher_id=teacher.id,
                    institution_id=class_obj.institution_id,
                    due_date=due_date,
                    max_score=assign_data["max_score"],
                    allow_late_submission=True,
                    late_penalty=10.0
                )
                
                db.add(new_assignment)
                created_count += 1
        
        db.commit()
        print(f"✅ {created_count} tarefas criadas!")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar tarefas: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        db.close()


def main():
    """
    Executa todos os seeds
    """
    print("🌱 Iniciando seed de dados de teste...\n")
    
    # Seed classes
    classes = seed_classes()
    
    if not classes:
        print("\n❌ Falha ao criar turmas. Abortando.")
        return False
    
    # Seed assignments
    if not seed_assignments():
        print("\n❌ Falha ao criar tarefas.")
        return False
    
    print("\n🎉 Seed de dados concluído com sucesso!")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
