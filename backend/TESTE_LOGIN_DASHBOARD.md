# 🧪 Guia de Testes - Login e Dashboards

## ✅ Status dos Testes

### Funcionando:
- ✅ **Health Check** - API está online
- ✅ **Login** - Autenticação funcionando
- ✅ **Token JWT** - Geração de tokens OK

### Credenciais de Teste:

| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Admin Sistema | admin@colaboraedu.com | admin123 | admin |
| Maria Professor | professor@colaboraedu.com | senha123 | professor |
| João Estudante | aluno@colaboraedu.com | senha123 | aluno |
| Ana Coordenadora | coordenador@colaboraedu.com | senha123 | coordenador |
| Pedro Secretário | secretario@colaboraedu.com | senha123 | secretario |
| Carla Orientadora | orientador@colaboraedu.com | senha123 | orientador |

---

## 🎯 Como Testar pelo Navegador (RECOMENDADO)

### Passo a Passo:

#### 1. Abra a Documentação Interativa
```
http://192.168.10.178:8004/docs
```

#### 2. Faça Login
1. Clique no botão verde **"Authorize"** no topo da página
2. Na janela que abre, preencha:
   - **username:** `admin@colaboraedu.com`
   - **password:** `admin123`
3. Clique em **"Authorize"**
4. Clique em **"Close"**

#### 3. Testar Endpoints
Agora todos os endpoints estão autenticados! Para testar qualquer um:

1. **Clique** no endpoint desejado (ex: `GET /api/v1/users`)
2. Clique em **"Try it out"**
3. Preencha os parâmetros (se necessário)
4. Clique em **"Execute"**
5. Veja a resposta em **"Response body"**

---

## 📱 Endpoints Principais para Testar

### 🔐 Autenticação
- `POST /api/v1/auth/login` - Fazer login
- `POST /api/v1/auth/logout` - Fazer logout

### 👥 Usuários
- `GET /api/v1/users` - Listar todos os usuários
- `POST /api/v1/users` - Criar novo usuário
- `GET /api/v1/users/{id}` - Ver detalhes de um usuário
- `PUT /api/v1/users/{id}` - Atualizar usuário
- `DELETE /api/v1/users/{id}` - Deletar usuário

### 🎓 Estudantes
- `GET /api/v1/students` - Listar estudantes
- `POST /api/v1/students` - Criar estudante
- `GET /api/v1/students/{id}` - Ver detalhes
- `GET /api/v1/students/{id}/dashboard` - Dashboard do estudante

### 📝 Ocorrências
- `GET /api/v1/occurrences` - Listar ocorrências
- `POST /api/v1/occurrences` - Registrar ocorrência
- `GET /api/v1/occurrences/{id}` - Ver detalhes
- `GET /api/v1/occurrences/analytics/overview` - Analytics

### 💬 Mensagens
- `GET /api/v1/messages` - Listar mensagens
- `POST /api/v1/messages` - Enviar mensagem
- `GET /api/v1/messages/{id}` - Ver mensagem
- `GET /api/v1/messages/conversations/{user_id}` - Ver conversa
- `GET /api/v1/messages/stats/overview` - Estatísticas

---

## 🖥️ Como Testar via Terminal (Avançado)

### 1. Fazer Login e Obter Token
```bash
curl -X POST http://192.168.10.178:8004/api/v1/auth/login \
  -d "username=admin@colaboraedu.com&password=admin123"
```

**Resposta:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {...}
}
```

### 2. Salvar o Token
```bash
TOKEN="cole_o_access_token_aqui"
```

### 3. Testar Endpoints com Token

#### Listar Usuários:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://192.168.10.178:8004/api/v1/users?page=1&size=10
```

#### Listar Estudantes:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://192.168.10.178:8004/api/v1/students?page=1&size=10
```

#### Listar Mensagens:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://192.168.10.178:8004/api/v1/messages?folder=inbox
```

#### Enviar Mensagem:
```bash
curl -X POST http://192.168.10.178:8004/api/v1/messages/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "USER_ID_AQUI",
    "subject": "Teste",
    "content": "Mensagem de teste",
    "priority": "normal"
  }'
```

---

## 🧪 Scripts de Teste Disponíveis

### Teste Rápido Automatizado:
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend
source venv/bin/activate
python test_quick.py
```

### Teste Interativo (Menu):
```bash
python test_login_dashboard.py
```

---

## 📊 Dashboard Features

### Para cada tipo de usuário:

#### Admin:
- ✅ Gerenciar todos os usuários
- ✅ Gerenciar estudantes
- ✅ Ver todas as ocorrências
- ✅ Analytics completo
- ✅ Sistema de mensagens

#### Professor:
- ✅ Ver suas turmas
- ✅ Registrar presença
- ✅ Registrar ocorrências
- ✅ Enviar mensagens

#### Coordenador:
- ✅ Gerenciar professores
- ✅ Ver ocorrências
- ✅ Analytics da coordenação
- ✅ Sistema de mensagens

#### Estudante:
- ✅ Ver suas notas
- ✅ Ver presença
- ✅ Ver ocorrências
- ✅ Receber mensagens

#### Orientador:
- ✅ Gerenciar estudantes
- ✅ Registrar ocorrências
- ✅ Acompanhamento acadêmico

#### Secretário:
- ✅ Gerenciar documentos
- ✅ Cadastros gerais
- ✅ Relatórios

---

## 🌐 Acessar de Outros Computadores

Qualquer computador na rede **192.168.10.x** pode acessar:

1. Abra o navegador
2. Digite: `http://192.168.10.178:8004/docs`
3. Faça login com as credenciais acima
4. Teste todos os endpoints!

---

## 🔧 Troubleshooting

### Problema: "401 Unauthorized"
**Solução:** Faça login novamente e use o novo token

### Problema: "Token expired"
**Solução:** Tokens expiram em 30 minutos. Faça login novamente.

### Problema: "403 Forbidden"
**Solução:** Usuário não tem permissão para essa ação. Use um usuário admin.

### Problema: "Servidor não responde"
**Solução:** 
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend
./status_server.sh
```

---

## 📚 Recursos Adicionais

- **Documentação Swagger:** http://192.168.10.178:8004/docs
- **Documentação ReDoc:** http://192.168.10.178:8004/redoc
- **Health Check:** http://192.168.10.178:8004/health

---

## ✅ Resumo

1. ✅ **Sistema está online** em http://192.168.10.178:8004
2. ✅ **Login funcionando** com as credenciais fornecidas
3. ✅ **Todos os endpoints acessíveis** via documentação interativa
4. ✅ **WebSocket chat** disponível em ws://192.168.10.178:8004/ws/chat
5. ✅ **Acessível na rede local** de qualquer computador 192.168.10.x

**Recomendação:** Use a documentação interativa (Swagger) para testar os endpoints de forma visual e intuitiva!

🎉 **Sistema pronto para testes!**
