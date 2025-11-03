#!/usr/bin/env python3
"""
Wrapper script para facilitar o uso dos comandos CLI do colaboraEDU.
Uso: python manage.py [comando] [opções]
"""
import sys
import os

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importar e executar o CLI
from app.cli import app

if __name__ == "__main__":
    app()
