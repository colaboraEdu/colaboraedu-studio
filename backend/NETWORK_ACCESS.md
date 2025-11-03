# 🌐 colaboraEDU API - Acesso na Rede Local

## ✅ Servidor Configurado e Rodando!

### 📍 Informações de Acesso:

**IP do Servidor:** `192.168.10.178`  
**Porta:** `8004`  
**Status:** ✅ **OPERACIONAL**

---

## 🔗 URLs de Acesso

### API Principal
- **URL Base:** http://192.168.10.178:8004
- **Health Check:** http://192.168.10.178:8004/health
- **Root:** http://192.168.10.178:8004/

### Documentação Interativa
- **Swagger UI:** http://192.168.10.178:8004/docs
- **ReDoc:** http://192.168.10.178:8004/redoc
- **OpenAPI JSON:** http://192.168.10.178:8004/openapi.json

### WebSocket
- **Chat Endpoint:** `ws://192.168.10.178:8004/ws/chat?token=YOUR_JWT_TOKEN`

---

## 📚 Endpoints Disponíveis

### 🔐 Autenticação (`/api/v1/auth`)
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/me` - Perfil do usuário

### 👥 Usuários (`/api/v1/users`)
- `GET /api/v1/users` - Listar usuários
- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users/{id}` - Detalhes do usuário
- `PUT /api/v1/users/{id}` - Atualizar usuário
- `DELETE /api/v1/users/{id}` - Deletar usuário

### 🎓 Estudantes (`/api/v1/students`)
- `GET /api/v1/students` - Listar estudantes
- `POST /api/v1/students` - Criar estudante
- `GET /api/v1/students/{id}` - Detalhes do estudante
- `PUT /api/v1/students/{id}` - Atualizar estudante
- `DELETE /api/v1/students/{id}` - Deletar estudante
- `GET /api/v1/students/{id}/dashboard` - Dashboard do estudante

### 📝 Ocorrências (`/api/v1/occurrences`)
- `GET /api/v1/occurrences` - Listar ocorrências
- `POST /api/v1/occurrences` - Criar ocorrência
- `GET /api/v1/occurrences/{id}` - Detalhes da ocorrência
- `PUT /api/v1/occurrences/{id}` - Atualizar ocorrência
- `DELETE /api/v1/occurrences/{id}` - Deletar ocorrência
- `GET /api/v1/occurrences/student/{id}/history` - Histórico do estudante
- `GET /api/v1/occurrences/analytics/overview` - Analytics de ocorrências

### 💬 Mensagens (`/api/v1/messages`)
- `GET /api/v1/messages` - Listar mensagens
- `POST /api/v1/messages` - Enviar mensagem
- `GET /api/v1/messages/{id}` - Detalhes da mensagem
- `PUT /api/v1/messages/{id}` - Atualizar mensagem
- `DELETE /api/v1/messages/{id}` - Deletar mensagem
- `GET /api/v1/messages/conversations/{user_id}` - Conversa com usuário
- `GET /api/v1/messages/stats/overview` - Estatísticas de mensagens
- `POST /api/v1/messages/bulk` - Operações em lote

### 🔌 WebSocket
- `WS /ws/chat` - Chat em tempo real

---

## 🧪 Exemplos de Uso

### 1️⃣ **Health Check**
```bash
curl http://192.168.10.178:8004/health
```

**Resposta:**
```json
{
  "status": "healthy",
  "service": "colaboraEDU API",
  "version": "1.0.0"
}
```

### 2️⃣ **Login**
```bash
curl -X POST http://192.168.10.178:8004/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "role": "admin"
    }
  }
}
```

### 3️⃣ **Listar Mensagens (Inbox)**
```bash
curl -X GET "http://192.168.10.178:8004/api/v1/messages/?folder=inbox&page=1&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4️⃣ **Enviar Mensagem**
```bash
curl -X POST http://192.168.10.178:8004/api/v1/messages/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user-uuid-here",
    "subject": "Título da mensagem",
    "content": "Conteúdo da mensagem",
    "priority": "normal"
  }'
```

### 5️⃣ **WebSocket Chat (JavaScript)**
```javascript
// Primeiro, faça login e obtenha o token
const token = "YOUR_JWT_TOKEN_HERE";

// Conectar ao WebSocket
const ws = new WebSocket(`ws://192.168.10.178:8004/ws/chat?token=${token}`);

ws.onopen = () => {
  console.log('✅ Conectado ao chat!');
  
  // Enviar mensagem
  ws.send(JSON.stringify({
    type: 'chat_message',
    recipient_id: 'user-uuid-here',
    content: 'Olá!',
    priority: 'normal'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Mensagem recebida:', data);
  
  // Tipos de mensagem:
  // - connected: Bem-vindo
  // - online_users: Lista de usuários online
  // - chat_message: Nova mensagem de chat
  // - message_sent: Confirmação de envio
  // - typing: Alguém está digitando
  // - read_receipt: Mensagem lida
  // - user_joined: Usuário entrou
  // - user_left: Usuário saiu
};

ws.onerror = (error) => {
  console.error('❌ Erro no WebSocket:', error);
};

ws.onclose = () => {
  console.log('🔌 Desconectado do chat');
};
```

### 6️⃣ **WebSocket Chat (Python)**
```python
import asyncio
import websockets
import json

async def connect_chat():
    token = "YOUR_JWT_TOKEN_HERE"
    uri = f"ws://192.168.10.178:8004/ws/chat?token={token}"
    
    async with websockets.connect(uri) as websocket:
        # Receber mensagem de boas-vindas
        welcome = await websocket.recv()
        print(f"Recebido: {welcome}")
        
        # Enviar mensagem
        await websocket.send(json.dumps({
            "type": "chat_message",
            "recipient_id": "user-uuid-here",
            "content": "Olá do Python!",
            "priority": "normal"
        }))
        
        # Receber confirmação
        response = await websocket.recv()
        print(f"Confirmação: {response}")
        
        # Manter conexão aberta
        while True:
            message = await websocket.recv()
            print(f"Nova mensagem: {message}")

asyncio.run(connect_chat())
```

---

## 🌍 Acesso de Outros Computadores na Rede

### Pré-requisitos:
1. ✅ Firewall liberado na porta 8004
2. ✅ Computadores na mesma rede local (192.168.10.x)
3. ✅ CORS configurado para aceitar todas as origens

### Como Acessar:

#### **De Qualquer Navegador:**
- Digite: http://192.168.10.178:8004/docs
- Você verá a documentação interativa Swagger UI
- Pode testar todos os endpoints diretamente pelo navegador

#### **De Aplicações Frontend (React, Vue, Angular):**
```javascript
// Configure a URL base da API
const API_BASE_URL = 'http://192.168.10.178:8004';

// Exemplo de requisição
fetch(`${API_BASE_URL}/api/v1/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'senha123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### **De Aplicações Mobile (React Native, Flutter):**
```dart
// Flutter exemplo
final response = await http.post(
  Uri.parse('http://192.168.10.178:8004/api/v1/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': 'user@example.com',
    'password': 'senha123'
  })
);
```

---

## 🔒 Segurança

### ⚠️ Configuração Atual (DESENVOLVIMENTO):
- ✅ CORS: **Liberado para todas as origens** (`allow_origins=["*"]`)
- ✅ TrustedHost: **Removido** para facilitar acesso na rede local
- ✅ JWT: **Autenticação obrigatória** em todos os endpoints protegidos
- ⚠️ HTTPS: **Não configurado** (apenas HTTP)

### 🔐 Para PRODUÇÃO, configure:
1. **CORS restrito**: Apenas origens específicas
2. **HTTPS**: Certificado SSL/TLS
3. **TrustedHost**: Lista específica de hosts permitidos
4. **Rate Limiting**: Limite de requisições por IP
5. **Secret Key**: Altere a chave JWT no `.env`

---

## 🛠️ Gerenciamento do Servidor

### Verificar Status:
```bash
curl http://192.168.10.178:8004/health
```

### Ver Logs em Tempo Real:
```bash
tail -f /tmp/colaboraedu_server.log
```

### Parar o Servidor:
```bash
pkill -f "uvicorn.*8004"
```

### Reiniciar o Servidor:
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend
source venv/bin/activate
nohup uvicorn app.main:app --host 192.168.10.178 --port 8004 --reload > /tmp/colaboraedu_server.log 2>&1 &
```

### Ver Processo do Servidor:
```bash
ps aux | grep uvicorn | grep 8004
```

---

## 📊 Monitoramento

### Endpoints de Saúde:
- **Health Check:** http://192.168.10.178:8004/health
- **OpenAPI Spec:** http://192.168.10.178:8004/openapi.json

### Informações do Sistema:
```bash
# CPU e Memória
top -p $(pgrep -f "uvicorn.*8004")

# Conexões ativas
netstat -an | grep 8004

# Logs de erro
grep -i error /tmp/colaboraedu_server.log
```

---

## 🚀 Próximos Passos

### Frontend Integration:
1. ✅ Backend configurado e acessível na rede
2. ⏳ Criar interface shadcn/ui para chat
3. ⏳ Conectar WebSocket no frontend
4. ⏳ Implementar sistema de relatórios

### Melhorias Sugeridas:
- [ ] Configurar HTTPS com certificado SSL
- [ ] Implementar rate limiting
- [ ] Adicionar logging estruturado
- [ ] Configurar backup automático do banco
- [ ] Implementar health checks avançados
- [ ] Adicionar métricas e dashboards

---

## 📞 Suporte

### Documentação:
- **Swagger UI:** http://192.168.10.178:8004/docs (melhor para testes)
- **ReDoc:** http://192.168.10.178:8004/redoc (melhor para leitura)

### Logs:
- **Arquivo de Log:** `/tmp/colaboraedu_server.log`
- **Nível de Log:** INFO (desenvolvimento)

### Troubleshooting:

**Problema:** Não consigo acessar de outro computador
- ✅ Verifique se está na mesma rede (192.168.10.x)
- ✅ Teste: `ping 192.168.10.178`
- ✅ Verifique firewall: `sudo ufw status`
- ✅ Teste localmente primeiro: `curl http://192.168.10.178:8004/health`

**Problema:** WebSocket não conecta
- ✅ Verifique se está usando `ws://` e não `http://`
- ✅ Token JWT deve estar válido (obtenha via `/api/v1/auth/login`)
- ✅ Token deve ser passado como query parameter: `?token=YOUR_TOKEN`

**Problema:** Erro 401 (Unauthorized)
- ✅ Faça login primeiro: `POST /api/v1/auth/login`
- ✅ Use o token retornado: `Authorization: Bearer TOKEN`
- ✅ Verifique se o token não expirou (validade: 30 minutos)

**Problema:** Servidor parou de responder
- ✅ Verifique se está rodando: `ps aux | grep uvicorn`
- ✅ Reinicie: `pkill -f uvicorn && nohup uvicorn...`
- ✅ Verifique logs: `tail -100 /tmp/colaboraedu_server.log`

---

## ✅ Checklist de Configuração

- [x] Servidor rodando no IP 192.168.10.178
- [x] Porta 8004 configurada e acessível
- [x] CORS liberado para todas as origens
- [x] TrustedHost middleware removido
- [x] Documentação acessível em /docs
- [x] Health check funcionando
- [x] WebSocket endpoint operacional
- [x] Logs configurados
- [x] Auto-reload ativado para desenvolvimento

---

## 🎉 Tudo Pronto!

O sistema colaboraEDU está **100% operacional** e acessível na rede local!

**URL Principal:** http://192.168.10.178:8004  
**Documentação:** http://192.168.10.178:8004/docs  
**WebSocket:** ws://192.168.10.178:8004/ws/chat

Qualquer computador na rede **192.168.10.x** pode acessar a API! 🚀
