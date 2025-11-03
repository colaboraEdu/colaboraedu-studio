#!/usr/bin/env python3
"""
Test Script - Login and Dashboard Testing
colaboraEDU API Interactive Tester
"""
import requests
import json
from datetime import datetime
from typing import Optional

# API Configuration
API_BASE_URL = "http://192.168.10.178:8004"
API_V1 = f"{API_BASE_URL}/api/v1"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text: str):
    """Print formatted header"""
    print(f"\n{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(70)}{Colors.END}")
    print(f"{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_info(text: str):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.END}")

def print_data(label: str, value: str):
    """Print labeled data"""
    print(f"{Colors.YELLOW}{label}:{Colors.END} {value}")

# Test users
TEST_USERS = {
    "1": {
        "name": "Admin Sistema",
        "email": "admin@colaboraedu.com",
        "password": "admin123",
        "role": "admin"
    },
    "2": {
        "name": "Maria Professor",
        "email": "professor@colaboraedu.com",
        "password": "senha123",
        "role": "professor"
    },
    "3": {
        "name": "João Estudante",
        "email": "aluno@colaboraedu.com",
        "password": "senha123",
        "role": "aluno"
    },
    "4": {
        "name": "Ana Coordenadora",
        "email": "coordenador@colaboraedu.com",
        "password": "senha123",
        "role": "coordenador"
    },
    "5": {
        "name": "Pedro Secretário",
        "email": "secretario@colaboraedu.com",
        "password": "senha123",
        "role": "secretario"
    },
    "6": {
        "name": "Carla Orientadora",
        "email": "orientador@colaboraedu.com",
        "password": "senha123",
        "role": "orientador"
    }
}

def test_health_check():
    """Test API health check"""
    print_header("TESTE 1: Health Check")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success("API está online!")
            print_data("Status", data.get("status"))
            print_data("Service", data.get("service"))
            print_data("Version", data.get("version"))
            return True
        else:
            print_error(f"API retornou status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Erro ao conectar: {str(e)}")
        return False

def test_login(email: str, password: str) -> Optional[dict]:
    """Test user login"""
    print_header(f"TESTE 2: Login - {email}")
    
    try:
        response = requests.post(
            f"{API_V1}/auth/login",
            json={
                "email": email,
                "password": password
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                print_success("Login realizado com sucesso!")
                
                user_data = data["data"]["user"]
                token_data = data["data"]
                
                print()
                print_data("Nome", user_data.get("full_name"))
                print_data("Email", user_data.get("email"))
                print_data("Role", user_data.get("role"))
                print_data("Token Type", token_data.get("token_type"))
                print_data("Expires In", f"{token_data.get('expires_in')} segundos")
                
                return {
                    "token": token_data.get("access_token"),
                    "user": user_data
                }
            else:
                print_error(f"Login falhou: {data.get('message')}")
                return None
        else:
            print_error(f"Erro {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Erro ao fazer login: {str(e)}")
        return None

def test_get_profile(token: str):
    """Test get current user profile"""
    print_header("TESTE 3: Obter Perfil do Usuário")
    
    try:
        response = requests.get(
            f"{API_V1}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                print_success("Perfil obtido com sucesso!")
                
                user = data["data"]
                print()
                print_data("ID", user.get("id"))
                print_data("Nome", user.get("full_name"))
                print_data("Email", user.get("email"))
                print_data("Role", user.get("role"))
                print_data("Status", user.get("status"))
                print_data("Último Login", user.get("last_login", "N/A"))
                
                return True
            else:
                print_error(f"Erro: {data.get('message')}")
                return False
        else:
            print_error(f"Erro {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_list_users(token: str):
    """Test list users endpoint"""
    print_header("TESTE 4: Listar Usuários")
    
    try:
        response = requests.get(
            f"{API_V1}/users?page=1&size=10",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                users_data = data["data"]
                items = users_data.get("items", [])
                total = users_data.get("total", 0)
                
                print_success(f"Encontrados {total} usuário(s)!")
                print()
                
                for idx, user in enumerate(items[:5], 1):
                    print(f"{Colors.CYAN}{idx}. {user.get('full_name')}{Colors.END}")
                    print(f"   Email: {user.get('email')}")
                    print(f"   Role: {user.get('role')}")
                    print()
                
                if total > 5:
                    print_info(f"... e mais {total - 5} usuário(s)")
                
                return True
            else:
                print_error(f"Erro: {data.get('message')}")
                return False
        else:
            print_error(f"Erro {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_list_students(token: str):
    """Test list students endpoint"""
    print_header("TESTE 5: Listar Estudantes")
    
    try:
        response = requests.get(
            f"{API_V1}/students?page=1&size=10",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                students_data = data["data"]
                items = students_data.get("items", [])
                total = students_data.get("total", 0)
                
                print_success(f"Encontrados {total} estudante(s)!")
                
                if total > 0:
                    print()
                    for idx, student in enumerate(items[:5], 1):
                        print(f"{Colors.CYAN}{idx}. {student.get('full_name')}{Colors.END}")
                        print(f"   Matrícula: {student.get('registration_number')}")
                        print(f"   Status: {student.get('status')}")
                        print()
                else:
                    print_info("Nenhum estudante cadastrado ainda")
                
                return True
            else:
                print_error(f"Erro: {data.get('message')}")
                return False
        else:
            print_error(f"Erro {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_list_messages(token: str):
    """Test list messages endpoint"""
    print_header("TESTE 6: Listar Mensagens (Inbox)")
    
    try:
        response = requests.get(
            f"{API_V1}/messages?folder=inbox&page=1&size=10",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                messages_data = data["data"]
                items = messages_data.get("items", [])
                total = messages_data.get("total", 0)
                
                print_success(f"Encontradas {total} mensagem(ns)!")
                
                if total > 0:
                    print()
                    for idx, msg in enumerate(items[:5], 1):
                        read_status = "✓ Lida" if msg.get("read") else "✉ Não lida"
                        print(f"{Colors.CYAN}{idx}. {msg.get('subject')}{Colors.END} [{read_status}]")
                        print(f"   De: {msg.get('sender', {}).get('full_name', 'N/A')}")
                        print(f"   Prioridade: {msg.get('priority')}")
                        print()
                else:
                    print_info("Nenhuma mensagem na caixa de entrada")
                
                return True
            else:
                print_error(f"Erro: {data.get('message')}")
                return False
        else:
            print_error(f"Erro {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def test_message_stats(token: str):
    """Test message statistics endpoint"""
    print_header("TESTE 7: Estatísticas de Mensagens")
    
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
                
                print_success("Estatísticas obtidas!")
                print()
                print_data("Total Enviadas", str(stats.get("total_sent", 0)))
                print_data("Total Recebidas", str(stats.get("total_received", 0)))
                print_data("Não Lidas", str(stats.get("unread_count", 0)))
                print_data("Taxa de Resposta", f"{stats.get('response_rate', 0):.1f}%")
                
                return True
            else:
                print_error(f"Erro: {data.get('message')}")
                return False
        else:
            print_error(f"Erro {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erro: {str(e)}")
        return False

def show_menu():
    """Show user selection menu"""
    print_header("🔐 TESTE DE LOGIN E DASHBOARDS - colaboraEDU")
    
    print(f"{Colors.BOLD}Selecione um usuário para testar:{Colors.END}\n")
    
    for key, user in TEST_USERS.items():
        print(f"  {Colors.GREEN}{key}{Colors.END}. {user['name']} ({user['role']})")
        print(f"     Email: {user['email']}")
        print()
    
    print(f"  {Colors.YELLOW}0{Colors.END}. Sair\n")

def run_full_test(user_data: dict):
    """Run full test suite for a user"""
    # Test 1: Health Check
    if not test_health_check():
        print_error("API não está acessível. Verifique se o servidor está rodando.")
        return
    
    input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    # Test 2: Login
    auth_data = test_login(user_data["email"], user_data["password"])
    
    if not auth_data:
        print_error("Não foi possível fazer login. Teste encerrado.")
        return
    
    token = auth_data["token"]
    
    input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    # Test 3: Get Profile
    test_get_profile(token)
    
    input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    # Test 4: List Users
    test_list_users(token)
    
    input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    # Test 5: List Students
    test_list_students(token)
    
    input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    # Test 6: List Messages
    test_list_messages(token)
    
    input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    # Test 7: Message Stats
    test_message_stats(token)
    
    print_header("✅ TODOS OS TESTES CONCLUÍDOS!")
    
    print(f"\n{Colors.GREEN}Token JWT para uso manual:{Colors.END}")
    print(f"{Colors.CYAN}{token[:50]}...{Colors.END}\n")
    
    print(f"{Colors.YELLOW}💡 Use este token para testar endpoints manualmente:{Colors.END}")
    print(f'   curl -H "Authorization: Bearer {token[:20]}..." \\')
    print(f'        http://192.168.10.178:8004/api/v1/users\n')

def main():
    """Main function"""
    try:
        while True:
            show_menu()
            
            choice = input(f"{Colors.BOLD}Digite sua escolha: {Colors.END}").strip()
            
            if choice == "0":
                print_info("Encerrando...")
                break
            
            if choice in TEST_USERS:
                user_data = TEST_USERS[choice]
                run_full_test(user_data)
                
                input(f"\n{Colors.YELLOW}Pressione Enter para voltar ao menu...{Colors.END}")
            else:
                print_error("Opção inválida! Tente novamente.")
                input(f"\n{Colors.YELLOW}Pressione Enter para continuar...{Colors.END}")
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Teste interrompido pelo usuário.{Colors.END}")
    except Exception as e:
        print_error(f"Erro inesperado: {str(e)}")

if __name__ == "__main__":
    main()
