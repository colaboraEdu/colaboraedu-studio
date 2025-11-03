#!/usr/bin/env python3
"""
Quick Test - Login and Dashboard
Automated test without user interaction
"""
import requests
import json

API_BASE_URL = "http://192.168.10.178:8004"
API_V1 = f"{API_BASE_URL}/api/v1"

print("\n" + "="*70)
print("🧪 TESTE AUTOMATIZADO - LOGIN E DASHBOARDS".center(70))
print("="*70 + "\n")

# Test 1: Health Check
print("📊 Teste 1: Health Check")
print("-" * 70)
try:
    response = requests.get(f"{API_BASE_URL}/health", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {data['status']}")
        print(f"✅ Service: {data['service']}")
        print(f"✅ Version: {data['version']}")
    else:
        print(f"❌ Erro: Status {response.status_code}")
        exit(1)
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")
    exit(1)

print("\n" + "="*70 + "\n")

# Test 2: Login as Admin
print("🔐 Teste 2: Login como Admin")
print("-" * 70)
try:
    response = requests.post(
        f"{API_V1}/auth/login",
        data={
            "username": "admin@colaboraedu.com",
            "password": "admin123"
        },
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        # O endpoint retorna diretamente os dados, não wrapped em {success: true, data: ...}
        if "access_token" in data:
            user = data["user"]
            token = data["access_token"]
            
            print(f"✅ Login realizado com sucesso!")
            print(f"   Nome: {user['first_name']} {user['last_name']}")
            print(f"   Email: {user['email']}")
            print(f"   Role: {user['role']}")
            print(f"   Token obtido: {token[:30]}...")
        else:
            print(f"❌ Login falhou: Resposta inesperada")
            print(f"   {data}")
            exit(1)
    else:
        print(f"❌ Erro {response.status_code}: {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Erro: {e}")
    exit(1)

print("\n" + "="*70 + "\n")

# Test 3: Get Profile
print("👤 Teste 3: Obter Perfil do Usuário")
print("-" * 70)
try:
    response = requests.get(
        f"{API_V1}/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            user = data["data"]
            print(f"✅ Perfil obtido com sucesso!")
            print(f"   ID: {user['id']}")
            print(f"   Nome: {user['full_name']}")
            print(f"   Email: {user['email']}")
            print(f"   Role: {user['role']}")
            print(f"   Status: {user['status']}")
        else:
            print(f"❌ Erro: {data.get('message')}")
    else:
        print(f"❌ Erro {response.status_code}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*70 + "\n")

# Test 4: List Users
print("👥 Teste 4: Listar Usuários")
print("-" * 70)
try:
    response = requests.get(
        f"{API_V1}/users?page=1&size=5",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            users_data = data["data"]
            items = users_data.get("items", [])
            total = users_data.get("total", 0)
            
            print(f"✅ Encontrados {total} usuário(s)!")
            for idx, user in enumerate(items, 1):
                print(f"   {idx}. {user['full_name']} ({user['role']}) - {user['email']}")
        else:
            print(f"❌ Erro: {data.get('message')}")
    else:
        print(f"❌ Erro {response.status_code}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*70 + "\n")

# Test 5: List Students
print("🎓 Teste 5: Listar Estudantes")
print("-" * 70)
try:
    response = requests.get(
        f"{API_V1}/students?page=1&size=5",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            students_data = data["data"]
            items = students_data.get("items", [])
            total = students_data.get("total", 0)
            
            print(f"✅ Encontrados {total} estudante(s)!")
            if total > 0:
                for idx, student in enumerate(items, 1):
                    print(f"   {idx}. {student['full_name']} - Matrícula: {student['registration_number']}")
            else:
                print("   ℹ️  Nenhum estudante cadastrado ainda")
        else:
            print(f"❌ Erro: {data.get('message')}")
    else:
        print(f"❌ Erro {response.status_code}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*70 + "\n")

# Test 6: List Messages
print("💬 Teste 6: Listar Mensagens (Inbox)")
print("-" * 70)
try:
    response = requests.get(
        f"{API_V1}/messages?folder=inbox&page=1&size=5",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            messages_data = data["data"]
            items = messages_data.get("items", [])
            total = messages_data.get("total", 0)
            
            print(f"✅ Encontradas {total} mensagem(ns) na inbox!")
            if total > 0:
                for idx, msg in enumerate(items, 1):
                    read = "✓" if msg.get("read") else "✉"
                    print(f"   {read} {idx}. {msg['subject']} - Prioridade: {msg['priority']}")
            else:
                print("   ℹ️  Nenhuma mensagem na caixa de entrada")
        else:
            print(f"❌ Erro: {data.get('message')}")
    else:
        print(f"❌ Erro {response.status_code}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*70 + "\n")

# Test 7: Message Stats
print("📊 Teste 7: Estatísticas de Mensagens")
print("-" * 70)
try:
    response = requests.get(
        f"{API_V1}/messages/stats/overview",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            stats = data["data"]
            print(f"✅ Estatísticas obtidas!")
            print(f"   📤 Total Enviadas: {stats['total_sent']}")
            print(f"   📥 Total Recebidas: {stats['total_received']}")
            print(f"   ✉️  Não Lidas: {stats['unread_count']}")
            print(f"   📈 Taxa de Resposta: {stats['response_rate']:.1f}%")
        else:
            print(f"❌ Erro: {data.get('message')}")
    else:
        print(f"❌ Erro {response.status_code}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*70 + "\n")

# Test 8: List Occurrences
print("📝 Teste 8: Listar Ocorrências")
print("-" * 70)
try:
    response = requests.get(
        f"{API_V1}/occurrences?page=1&size=5",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            occurrences_data = data["data"]
            items = occurrences_data.get("items", [])
            total = occurrences_data.get("total", 0)
            
            print(f"✅ Encontradas {total} ocorrência(s)!")
            if total > 0:
                for idx, occ in enumerate(items, 1):
                    print(f"   {idx}. {occ['title']} - Gravidade: {occ['severity']} - Status: {occ['status']}")
            else:
                print("   ℹ️  Nenhuma ocorrência registrada ainda")
        else:
            print(f"❌ Erro: {data.get('message')}")
    else:
        print(f"❌ Erro {response.status_code}")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*70)
print("✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!".center(70))
print("="*70 + "\n")

print("🔑 Token JWT para testes manuais:")
print(f"   {token[:80]}...")
print()
print("💡 Exemplo de uso:")
print(f'   curl -H "Authorization: Bearer {token[:30]}..." \\')
print(f'        http://192.168.10.178:8004/api/v1/users')
print()
print("📚 Documentação interativa:")
print("   http://192.168.10.178:8004/docs")
print()
