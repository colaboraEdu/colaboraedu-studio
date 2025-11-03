#!/usr/bin/env python3
"""
Database seeding script to create initial users for testing
"""

import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.models import Institution, User
import hashlib


def seed_database():
    """Seed the database with initial data for testing"""
    
    # Create a database session
    db = Session(engine)
    
    try:
        # Check if we already have an institution
        institution = db.query(Institution).first()
        if not institution:
            # Create a default institution
            institution = Institution(
                name="ColaboraEDU Demo School",
                cnpj="00.000.000/0001-00",
                settings={}
            )
            db.add(institution)
            db.commit()
            db.refresh(institution)
            print(f"✅ Created institution: {institution.name}")
        else:
            print(f"✅ Using existing institution: {institution.name}")
        
        # Define test users based on our frontend profiles
        test_users = [
            {
                "email": "admin@colaboraedu.com",
                "password": "123456",
                "first_name": "Admin",
                "last_name": "Sistema",
                "role": "admin"
            },
            {
                "email": "professor@colaboraedu.com", 
                "password": "123456",
                "first_name": "Maria",
                "last_name": "Professor",
                "role": "professor"
            },
            {
                "email": "aluno@colaboraedu.com",
                "password": "123456", 
                "first_name": "João",
                "last_name": "Estudante",
                "role": "aluno"
            },
            {
                "email": "coordenador@colaboraedu.com",
                "password": "123456",
                "first_name": "Ana",
                "last_name": "Coordenadora", 
                "role": "coordenador"
            },
            {
                "email": "secretario@colaboraedu.com",
                "password": "123456",
                "first_name": "Pedro",
                "last_name": "Secretário",
                "role": "secretario"
            },
            {
                "email": "orientador@colaboraedu.com",
                "password": "123456",
                "first_name": "Carla",
                "last_name": "Orientadora",
                "role": "orientador"
            },
            {
                "email": "bibliotecario@colaboraedu.com",
                "password": "123456",
                "first_name": "Lucas",
                "last_name": "Bibliotecário",
                "role": "bibliotecario"
            },
            {
                "email": "responsavel@colaboraedu.com",
                "password": "123456",
                "first_name": "Sandra",
                "last_name": "Responsável",
                "role": "responsavel"
            }
        ]
        
        created_users = 0
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(
                User.email == user_data["email"]
            ).first()
            
            if not existing_user:
                # Create new user
                # Simple hash for demo purposes (in production use proper bcrypt)
                hashed_password = hashlib.sha256(user_data["password"].encode()).hexdigest()
                user = User(
                    institution_id=institution.id,
                    email=user_data["email"],
                    password_hash=hashed_password,
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    role=user_data["role"]
                )
                db.add(user)
                created_users += 1
                print(f"✅ Created user: {user_data['email']} ({user_data['role']})")
            else:
                print(f"⚠️  User already exists: {user_data['email']}")
        
        if created_users > 0:
            db.commit()
            print(f"\n🎉 Successfully created {created_users} new users!")
        else:
            print("\n✅ All users already exist in the database.")
            
        print("\n📊 Database seeding completed successfully!")
        print("You can now test the login with any of the following credentials:")
        print("- admin@colaboraedu.com / admin123")
        print("- professor@colaboraedu.com / prof123")
        print("- aluno@colaboraedu.com / aluno123")
        print("- coordenador@colaboraedu.com / coord123")
        print("- etc...")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding database with test users...")
    seed_database()