# 🚀 colaboraEDU - Guia de Acesso Rápido

## 📍 URLs do Sistema

### Frontend (Interface do Usuário)
- **URL Principal:** http://192.168.10.178:3000
- **Status:** ✅ Funcionando

### Backend (API)
- **URL API:** http://192.168.10.178:8004
- **Documentação:** http://192.168.10.178:8004/docs
- **Health Check:** http://192.168.10.178:8004/health
- **Status:** ✅ Funcionando

---

## 👥 Credenciais de Acesso Demo

### 1️⃣ Administrador
- **Email:** admin@colaboraedu.com
- **Senha:** admin123
- **Acesso:** Dashboard completo, gestão de usuários, configurações do sistema

### 2️⃣ Professor
- **Email:** professor@colaboraedu.com
- **Senha:** professor123
- **Acesso:** Gestão de turmas, alunos, notas e conteúdos

### 3️⃣ Aluno
- **Email:** aluno@colaboraedu.com
- **Senha:** aluno123
- **Acesso:** Visualização de notas, materiais, calendário

### 4️⃣ Coordenador
- **Email:** coordenador@colaboraedu.com
- **Senha:** coord123
- **Acesso:** Coordenação acadêmica, relatórios, gestão pedagógica

---

## 🎯 Como Fazer Login

1. **Acesse:** http://192.168.10.178:3000
2. **Clique em:** Botão "Login" ou "Acessar Plataforma"
3. **Selecione o perfil** na seção "Demo - Selecione um perfil"
4. **Credenciais pré-preenchidas** automaticamente
5. **Clique em:** "Entrar no Sistema"
6. **Dashboard carregado** conforme o perfil selecionado

---

## 🛠️ Gerenciamento do Sistema

### Iniciar Todo o Sistema
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1
./start_all.sh
```

### Parar Todo o Sistema
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1
./stop_all.sh
```

### Apenas Frontend
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1
npm run dev -- --host 192.168.10.178 --port 3000
```

### Apenas Backend
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend
./start_server.sh  # Iniciar
./stop_server.sh   # Parar
./status_server.sh # Verificar status
```

---

## 📊 Verificar Logs

### Frontend (Vite)
```bash
tail -f /tmp/vite.log
```

### Backend (FastAPI)
```bash
tail -f /tmp/colaboraedu_server.log
```

---

## 🔍 Verificar Status dos Serviços

### Verificar Processos
```bash
ps aux | grep -E "(vite|uvicorn)" | grep -v grep
```

### Testar Frontend
```bash
curl -I http://192.168.10.178:3000
```

### Testar Backend
```bash
curl http://192.168.10.178:8004/health
```

---

## 🎨 Dashboards Disponíveis por Perfil

### 🔐 Admin Dashboard
- Gestão completa de usuários
- Configurações do sistema
- Métricas e estatísticas gerais
- Gestão de instituições

### 📚 Professor Dashboard
- Lista de turmas e alunos
- Lançamento de notas
- Gestão de conteúdos e materiais
- Calendário acadêmico

### 🎓 Aluno Dashboard
- Visualização de notas
- Materiais de aula
- Calendário de atividades
- Perfil pessoal

### 🎯 Coordenador Dashboard
- Relatórios acadêmicos
- Gestão pedagógica
- Acompanhamento de turmas
- Análises e métricas

---

## 🔧 Solução de Problemas

### Frontend não carrega (ERR_CONNECTION_REFUSED)
```bash
# 1. Verificar se está rodando
ps aux | grep vite | grep -v grep

# 2. Se não estiver, reiniciar
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1
./start_all.sh
```

### Backend não responde
```bash
# 1. Verificar status
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend
./status_server.sh

# 2. Se não estiver rodando
./start_server.sh
```

### Porta em uso
```bash
# Frontend (3000)
lsof -ti:3000 | xargs kill -9

# Backend (8004)
lsof -ti:8004 | xargs kill -9
```

---

## 📱 Funcionalidades Implementadas

✅ **Autenticação JWT** - Login seguro com tokens  
✅ **Multi-perfil** - 8 tipos diferentes de usuários  
✅ **Zustand Store** - Gerenciamento de estado global  
✅ **shadcn/ui** - Componentes modernos e acessíveis  
✅ **Responsive Design** - Funciona em desktop e mobile  
✅ **Toast Notifications** - Feedback visual para ações  
✅ **Loading States** - Indicadores de carregamento  
✅ **Error Handling** - Tratamento robusto de erros  
✅ **Persistência** - Estado mantido entre sessões  

---

## 🎉 Sistema Pronto!

O colaboraEDU está **totalmente operacional** e pronto para uso!

**Acesse agora:** http://192.168.10.178:3000

---

*Última atualização: 29/10/2025*
