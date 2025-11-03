#!/usr/bin/env python3
"""
Teste de criação de usuário
"""
import requests
import json

# Configuração
BASE_URL = "http://192.168.10.178:8004/api/v1"

# 1. Fazer login
print("=" * 60)
print("1. Fazendo login...")
login_data = {
    "username": "admin@colaboraedu.com",
    "password": "admin123"
}
response = requests.post(
    f"{BASE_URL}/auth/login",
    data=login_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

if response.status_code != 200:
    print(f"❌ Erro no login: {response.status_code}")
    print(response.text)
    exit(1)

login_response = response.json()
token = login_response["access_token"]
print(f"✅ Login bem-sucedido!")
print(f"   Token: {token[:50]}...")
print(f"   User: {login_response['user']['email']}")

# 2. Listar instituições para pegar um ID válido
print("\n" + "=" * 60)
print("2. Listando instituições...")
response = requests.get(
    f"{BASE_URL}/institutions",
    headers={"Authorization": f"Bearer {token}"}
)

if response.status_code == 200:
    institutions = response.json()
    if institutions:
        institution_id = institutions[0]["id"]
        print(f"✅ Instituição encontrada: {institution_id}")
    else:
        print("❌ Nenhuma instituição encontrada")
        exit(1)
else:
    print(f"⚠️  Endpoint de instituições não disponível, usando ID fixo")
    institution_id = "00000000-0000-0000-0000-000000000001"

# 3. Criar usuário
print("\n" + "=" * 60)
print("3. Criando novo usuário...")
user_data = {
    "email": "teste.usuario@example.com",
    "password": "senha12346",
    "first_name": "Teste",
    "last_name": "Usuário",
    "role": "aluno",
    "institution_id": institution_id
}

print(f"   Dados: {json.dumps(user_data, indent=2)}")

response = requests.post(
    f"{BASE_URL}/users",
    json=user_data,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(f"\n   Status: {response.status_code}")
print(f"   Resposta: {response.text[:500]}")

if response.status_code in [200, 201]:
    print("✅ Usuário criado com sucesso!")
    user = response.json()
    print(f"   ID: {user.get('id')}")
    print(f"   Nome: {user.get('first_name')} {user.get('last_name')}")
    print(f"   Email: {user.get('email')}")
else:
    print(f"❌ Erro ao criar usuário: {response.status_code}")
    print(f"   Detalhes: {response.text}")

print("\n" + "=" * 60)
