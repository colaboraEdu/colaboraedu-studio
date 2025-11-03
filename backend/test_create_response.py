import requests

# Login
login_response = requests.post(
    "http://192.168.10.178:8004/api/v1/auth/login",
    data={"username": "admin@colaboraedu.com", "password": "admin123"}
)

token = login_response.json()["access_token"]

# Criar usuário
from datetime import datetime
timestamp = datetime.now().strftime("%H%M%S")

user_data = {
    "email": f"teste.{timestamp}@teste.com",
    "password": "senha123",
    "first_name": "Frontend",
    "last_name": f"Test {timestamp}",
    "role": "teacher",
    "institution_id": "59523a3f-a7c7-4a3a-adb6-d3941ecad9d9"
}

response = requests.post(
    "http://192.168.10.178:8004/api/v1/users/",
    headers={"Authorization": f"Bearer {token}"},
    json=user_data
)

print(f"Status: {response.status_code}")
print(f"Tipo de resposta: {type(response.json())}")

import json
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
