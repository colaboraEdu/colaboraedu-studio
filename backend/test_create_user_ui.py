"""
Script para testar a criação de usuário através da API
como se fosse feito pelo formulário da interface
"""

import requests
import json
from datetime import datetime

# URL do backend
BASE_URL = "http://192.168.10.178:8004"

def test_user_creation():
    """Testa criação de usuário exatamente como o formulário faz"""
    
    print("\n=== TESTE DE CRIAÇÃO DE USUÁRIO ===\n")
    
    # 1. Fazer login para obter token
    print("1. Fazendo login...")
    login_data = {
        "username": "admin@colaboraedu.com",
        "password": "admin123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data=login_data
    )
    
    if response.status_code != 200:
        print(f"❌ Erro no login: {response.status_code}")
        print(f"Resposta: {response.text}")
        return
    
    token = response.json()["access_token"]
    print("✅ Login bem-sucedido")
    
    # Headers com token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Listar instituições para pegar um ID válido
    print("\n2. Listando instituições...")
    response = requests.get(
        f"{BASE_URL}/api/v1/institutions",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao listar instituições: {response.status_code}")
        print(f"Resposta: {response.text}")
        return
    
    institutions = response.json()
    if not institutions:
        print("❌ Nenhuma instituição encontrada")
        return
    
    institution_id = institutions[0]["id"]
    print(f"✅ Instituição encontrada: {institutions[0]['name']} (ID: {institution_id})")
    
    # 3. Criar novo usuário (simulando o formulário)
    print("\n3. Criando novo usuário...")
    timestamp = datetime.now().strftime("%H%M%S")
    user_data = {
        "email": f"teste.usuario.{timestamp}@teste.com",
        "password": "senha123",
        "first_name": "Teste",
        "last_name": f"Usuario {timestamp}",
        "role": "teacher",
        "institution_id": institution_id
    }
    
    print(f"\nDados do usuário:")
    print(json.dumps(user_data, indent=2, ensure_ascii=False))
    
    response = requests.post(
        f"{BASE_URL}/api/v1/users/",
        headers=headers,
        json=user_data
    )
    
    if response.status_code == 201:
        created_user = response.json()
        print(f"\n✅ USUÁRIO CRIADO COM SUCESSO!")
        print(f"\nDados retornados:")
        print(json.dumps(created_user, indent=2, ensure_ascii=False))
        
        # 4. Listar usuários para verificar se aparece
        print("\n4. Verificando lista de usuários...")
        response = requests.get(
            f"{BASE_URL}/api/v1/users/",
            headers=headers
        )
        
        if response.status_code == 200:
            users = response.json()
            user_found = any(u["id"] == created_user["id"] for u in users)
            
            if user_found:
                print(f"✅ Usuário encontrado na lista! Total de usuários: {len(users)}")
            else:
                print(f"❌ Usuário NÃO encontrado na lista")
        else:
            print(f"❌ Erro ao listar usuários: {response.status_code}")
            
    else:
        print(f"\n❌ ERRO AO CRIAR USUÁRIO: {response.status_code}")
        print(f"Resposta: {response.text}")

if __name__ == "__main__":
    test_user_creation()
