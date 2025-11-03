#!/usr/bin/env python3
"""
Script para criar/migrar tabelas do banco de dados
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import Base, engine
from app import models  # Import all models

def create_tables():
    """
    Cria todas as tabelas do banco de dados
    """
    print("🔧 Criando tabelas do banco de dados...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Tabelas criadas com sucesso!")
        print("\nTabelas disponíveis:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        import traceback
        traceback.print_exc()
        return False


def drop_tables():
    """
    Remove todas as tabelas (CUIDADO!)
    """
    confirm = input("⚠️  ATENÇÃO: Isso irá deletar TODAS as tabelas! Digite 'CONFIRMAR' para continuar: ")
    
    if confirm != "CONFIRMAR":
        print("❌ Operação cancelada")
        return False
    
    print("🗑️  Removendo tabelas...")
    
    try:
        Base.metadata.drop_all(bind=engine)
        print("✅ Tabelas removidas com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao remover tabelas: {e}")
        return False


def recreate_tables():
    """
    Remove e recria todas as tabelas (CUIDADO!)
    """
    print("🔄 Recriando tabelas...")
    
    if drop_tables():
        return create_tables()
    
    return False


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Gerenciamento do banco de dados")
    parser.add_argument(
        "action",
        choices=["create", "drop", "recreate"],
        help="Ação a ser executada"
    )
    
    args = parser.parse_args()
    
    if args.action == "create":
        success = create_tables()
    elif args.action == "drop":
        success = drop_tables()
    elif args.action == "recreate":
        success = recreate_tables()
    
    sys.exit(0 if success else 1)
