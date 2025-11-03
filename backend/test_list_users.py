import requests

# Login
login_response = requests.post(
    "http://192.168.10.178:8004/api/v1/auth/login",
    data={"username": "admin@colaboraedu.com", "password": "admin123"}
)

token = login_response.json()["access_token"]

# Listar usuários
response = requests.get(
    "http://192.168.10.178:8004/api/v1/users/",
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status: {response.status_code}")
print(f"Tipo de resposta: {type(response.json())}")

users = response.json()
print(f"\nTotal de usuários: {len(users) if isinstance(users, list) else 'não é lista'}")

if isinstance(users, list) and len(users) > 0:
    print(f"\nPrimeiro usuário:")
    import json
    print(json.dumps(users[0], indent=2, ensure_ascii=False))
    
    # Procurar o usuário que acabamos de criar
    test_user = [u for u in users if "teste.usuario" in u.get("email", "")]
    if test_user:
        print(f"\n✅ Usuários de teste encontrados: {len(test_user)}")
        print(json.dumps(test_user[-1], indent=2, ensure_ascii=False))
else:
    print(f"\nResposta completa:")
    import json
    print(json.dumps(users, indent=2, ensure_ascii=False))
