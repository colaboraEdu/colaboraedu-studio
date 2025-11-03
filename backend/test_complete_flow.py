#!/usr/bin/env python3
"""
Teste completo do fluxo de criação de usuário
Simula exatamente o que acontece na interface
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://192.168.10.178:8004/api/v1"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_complete_flow():
    print_section("TESTE COMPLETO DO FLUXO DE USUÁRIO")
    
    # 1. Login
    print("1️⃣  Fazendo login...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin@colaboraedu.com", "password": "admin123"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Erro no login: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json()["access_token"]
    print("✅ Login realizado com sucesso")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Listar usuários (antes da criação)
    print("\n2️⃣  Listando usuários atuais...")
    list_response = requests.get(f"{BASE_URL}/users", headers=headers)
    
    if list_response.status_code != 200:
        print(f"❌ Erro ao listar: {list_response.status_code}")
        print(list_response.text)
        return
    
    users_data = list_response.json()
    total_before = users_data["pagination"]["total"]
    print(f"✅ Total de usuários antes: {total_before}")
    
    # 3. Listar instituições
    print("\n3️⃣  Buscando instituições...")
    inst_response = requests.get(f"{BASE_URL}/institutions", headers=headers)
    
    if inst_response.status_code != 200:
        print(f"❌ Erro ao buscar instituições: {inst_response.status_code}")
        return
    
    institutions = inst_response.json()
    institution_id = institutions[0]["id"]
    institution_name = institutions[0]["name"]
    print(f"✅ Instituição: {institution_name}")
    
    # 4. Criar novo usuário (EXATAMENTE como o frontend faz)
    print("\n4️⃣  Criando novo usuário...")
    timestamp = datetime.now().strftime("%H%M%S")
    
    # UserDialog divide "João Silva" em first_name="João" e last_name="Silva"
    new_user = {
        "email": f"teste.interface.{timestamp}@teste.com",
        "password": "senha123",
        "first_name": "Teste",
        "last_name": f"Interface {timestamp}",
        "role": "teacher",
        "institution_id": institution_id
    }
    
    print(f"\n📝 Dados enviados:")
    print(json.dumps(new_user, indent=2, ensure_ascii=False))
    
    create_response = requests.post(
        f"{BASE_URL}/users/",
        headers=headers,
        json=new_user
    )
    
    if create_response.status_code != 201:
        print(f"\n❌ ERRO ao criar usuário: {create_response.status_code}")
        print(create_response.text)
        return
    
    created_user = create_response.json()
    print(f"\n✅ USUÁRIO CRIADO!")
    print(f"   ID: {created_user['id']}")
    print(f"   Nome: {created_user['first_name']} {created_user['last_name']}")
    print(f"   Email: {created_user['email']}")
    print(f"   Role: {created_user['role']}")
    
    # 5. Recarregar lista (como o frontend faz após criar)
    print("\n5️⃣  Recarregando lista de usuários...")
    list_response2 = requests.get(f"{BASE_URL}/users", headers=headers)
    
    if list_response2.status_code != 200:
        print(f"❌ Erro ao recarregar: {list_response2.status_code}")
        return
    
    users_data2 = list_response2.json()
    total_after = users_data2["pagination"]["total"]
    users_list = users_data2["data"]
    
    print(f"✅ Total de usuários depois: {total_after}")
    
    # 6. Verificar se o novo usuário está na lista
    print("\n6️⃣  Verificando se o novo usuário aparece na lista...")
    found = False
    for user in users_list:
        if user["id"] == created_user["id"]:
            found = True
            print(f"\n✅ SUCESSO! Usuário encontrado na lista!")
            print(f"   Nome completo: {user['first_name']} {user['last_name']}")
            print(f"   Email: {user['email']}")
            print(f"   Status: {user['status']}")
            break
    
    if not found:
        print(f"\n❌ ERRO: Usuário não encontrado na lista!")
        print(f"   ID procurado: {created_user['id']}")
        print(f"   Total de usuários na resposta: {len(users_list)}")
        return
    
    # 7. Resumo final
    print_section("RESUMO DO TESTE")
    print(f"✅ Login: OK")
    print(f"✅ Listagem inicial: {total_before} usuários")
    print(f"✅ Criação de usuário: OK")
    print(f"✅ Listagem após criação: {total_after} usuários")
    print(f"✅ Usuário aparece na lista: OK")
    print(f"\n🎉 TESTE COMPLETO PASSOU! O formulário está funcionando!")
    
    print(f"\n📊 Estatísticas:")
    print(f"   • Usuários criados neste teste: 1")
    print(f"   • Total no sistema: {total_after}")
    print(f"   • Incremento: +{total_after - total_before}")

if __name__ == "__main__":
    try:
        test_complete_flow()
    except Exception as e:
        print(f"\n❌ ERRO INESPERADO: {e}")
        import traceback
        traceback.print_exc()
