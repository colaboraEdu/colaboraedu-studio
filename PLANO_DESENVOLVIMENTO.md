# 🎯 Plano de Desenvolvimento - colaboraEDU

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Fase 1: Integração Frontend-Backend](#fase-1-integração-frontend-backend)
3. [Fase 2: Endpoints Backend Críticos](#fase-2-endpoints-backend-críticos)
4. [Fase 3: Desenvolvimento de Funcionalidades](#fase-3-desenvolvimento-de-funcionalidades)
5. [Fase 4: Sistema de Relatórios](#fase-4-sistema-de-relatórios)
6. [Fase 5: Refinamento e Testes](#fase-5-refinamento-e-testes)

---

## 🎯 Visão Geral

### Status Atual:
- ✅ Backend FastAPI rodando em `192.168.10.178:8004`
- ✅ Frontend React com Vite estruturado
- ✅ 8 dashboards criados (estrutura base)
- 🔄 **40% de funcionalidades implementadas**
- ⏳ 60% de funcionalidades pendentes

### Objetivo:
Completar 100% das funcionalidades em **5 fases** de desenvolvimento.

---

## 🚀 FASE 1: Integração Frontend-Backend

**Objetivo:** Conectar frontend ao backend existente  
**Duração Estimada:** 2-3 dias  
**Prioridade:** 🔴 CRÍTICA

### Tarefas:

#### 1.1 Criar Camada de API no Frontend
```bash
# Arquivo: src/services/api.ts
```

**Funcionalidades:**
- ✅ Configurar axios com baseURL: `http://192.168.10.178:8004/api/v1`
- ✅ Implementar gerenciamento de JWT token (localStorage)
- ✅ Criar interceptors para autenticação automática
- ✅ Implementar tratamento de erros (401, 403, 500)
- ✅ Criar métodos tipados para cada endpoint

**Código Base:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.10.178:8004/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 1.2 Atualizar Sistema de Autenticação
```bash
# Arquivo: auth.ts
```

**Mudanças:**
- ❌ Remover: `validateCredentials()` com dados mockados
- ✅ Adicionar: `login()` chamando POST /auth/login
- ✅ Adicionar: `getProfile()` chamando GET /auth/me
- ✅ Adicionar: `logout()` limpando token
- ✅ Adicionar: `refreshToken()` se necessário

**Exemplo:**
```typescript
import api from './services/api';

export const login = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const { access_token, user } = response.data;
  localStorage.setItem('token', access_token);
  return user;
};
```

#### 1.3 Integrar Gerenciamento de Usuários
```bash
# Arquivo: components/dashboard/UserManagement.tsx
```

**Endpoints a Integrar:**
- GET /users → Listar todos os usuários
- GET /users/{id} → Buscar usuário específico
- POST /users → Criar novo usuário
- PUT /users/{id} → Atualizar usuário
- DELETE /users/{id} → Deletar usuário

#### 1.4 Integrar Sistema de Chat
```bash
# Arquivo: components/dashboard/chat/ChatWindow.tsx
```

**WebSocket Integration:**
```typescript
const ws = new WebSocket(
  `ws://192.168.10.178:8004/ws/chat?token=${token}`
);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'chat_message':
      setMessages(prev => [...prev, message.data]);
      break;
    case 'typing':
      setTypingUsers(prev => [...prev, message.data.user_id]);
      break;
    case 'online_users':
      setOnlineUsers(message.data.users);
      break;
  }
};

const sendMessage = (content: string) => {
  ws.send(JSON.stringify({
    type: 'chat_message',
    content,
    recipient_id: selectedUserId
  }));
};
```

#### 1.5 Integrar Sistema de Ocorrências
```bash
# Arquivo: components/dashboard/orientador/Ocorrencias.tsx
```

**Endpoints a Integrar:**
- GET /occurrences → Listar ocorrências
- POST /occurrences → Criar ocorrência
- GET /occurrences/analytics/overview → Dashboard de analytics

### Checklist Fase 1:
- [ ] Criar `src/services/api.ts`
- [ ] Atualizar `auth.ts` com API real
- [ ] Testar login com todos os perfis
- [ ] Integrar UserManagement
- [ ] Integrar ChatWindow com WebSocket
- [ ] Integrar Ocorrências
- [ ] Testar conexão com todos os endpoints existentes

---

## 🔧 FASE 2: Endpoints Backend Críticos

**Objetivo:** Criar endpoints essenciais para funcionalidades principais  
**Duração Estimada:** 5-7 dias  
**Prioridade:** 🔴 ALTA

### 2.1 Sistema de Turmas/Classes

**Arquivo:** `backend/app/api/v1/endpoints/classes.py`

**Endpoints a Criar:**
```python
# CRUD Básico
GET    /api/v1/classes                    # Listar turmas
GET    /api/v1/classes/{id}               # Buscar turma
POST   /api/v1/classes                    # Criar turma
PUT    /api/v1/classes/{id}               # Atualizar turma
DELETE /api/v1/classes/{id}               # Deletar turma

# Relacionamentos
GET    /api/v1/classes/{id}/students      # Alunos da turma
POST   /api/v1/classes/{id}/students      # Adicionar aluno
DELETE /api/v1/classes/{id}/students/{student_id}  # Remover aluno

GET    /api/v1/classes/{id}/professors    # Professores da turma
POST   /api/v1/classes/{id}/professors    # Adicionar professor

# Dashboard
GET    /api/v1/professor/classes          # Turmas do professor logado
GET    /api/v1/student/classes            # Turmas do aluno logado
```

**Schema (models/class.py):**
```python
class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"))
    grade_level = Column(String(20))  # "1º ano", "2º ano", etc
    shift = Column(String(20))  # "Matutino", "Vespertino", "Noturno"
    capacity = Column(Integer)
    year = Column(Integer)
    semester = Column(Integer)
    active = Column(Boolean, default=True)
    
    # Relationships
    students = relationship("Student", secondary="class_students")
    professors = relationship("Professor", secondary="class_professors")
    schedules = relationship("Schedule", back_populates="class_")
```

### 2.2 Sistema de Notas/Grades

**Arquivo:** `backend/app/api/v1/endpoints/grades.py`

**Endpoints a Criar:**
```python
# CRUD
GET    /api/v1/grades                     # Listar notas (filtros)
GET    /api/v1/grades/{id}                # Buscar nota específica
POST   /api/v1/grades                     # Lançar nota
PUT    /api/v1/grades/{id}                # Atualizar nota
DELETE /api/v1/grades/{id}                # Deletar nota

# Queries específicas
GET    /api/v1/students/{id}/grades       # Notas de um aluno
GET    /api/v1/classes/{id}/grades        # Notas de uma turma
GET    /api/v1/professor/grades           # Notas das turmas do professor

# Boletim
GET    /api/v1/students/{id}/report-card  # Boletim do aluno
GET    /api/v1/students/{id}/report-card/pdf  # Boletim em PDF
```

**Schema (models/grade.py):**
```python
class Grade(Base):
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    assessment_type = Column(String(50))  # "Prova", "Trabalho", "Participação"
    grade = Column(Float)
    max_grade = Column(Float, default=10.0)
    weight = Column(Float, default=1.0)
    date = Column(Date)
    semester = Column(Integer)
    comments = Column(Text)
    
    # Relationships
    student = relationship("Student")
    class_ = relationship("Class")
    subject = relationship("Subject")
```

### 2.3 Sistema de Presença/Attendance

**Arquivo:** `backend/app/api/v1/endpoints/attendance.py`

**Endpoints a Criar:**
```python
# CRUD
GET    /api/v1/attendance                 # Listar presenças
POST   /api/v1/attendance                 # Registrar presença
PUT    /api/v1/attendance/{id}            # Atualizar presença

# Queries específicas
GET    /api/v1/classes/{id}/attendance    # Presença de uma turma/aula
POST   /api/v1/classes/{id}/attendance/bulk  # Registrar múltiplas presenças

GET    /api/v1/students/{id}/attendance   # Histórico de presença do aluno
GET    /api/v1/students/{id}/attendance/summary  # Resumo (%, faltas)

# Relatórios
GET    /api/v1/attendance/report?class_id=X&month=Y  # Relatório mensal
```

**Schema (models/attendance.py):**
```python
class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    class_id = Column(Integer, ForeignKey("classes.id"))
    date = Column(Date)
    status = Column(String(20))  # "Presente", "Ausente", "Atrasado", "Justificado"
    lesson_number = Column(Integer)  # Número da aula
    justification = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    student = relationship("Student")
    class_ = relationship("Class")
```

### 2.4 Sistema de Tarefas/Assignments

**Arquivo:** `backend/app/api/v1/endpoints/assignments.py`

**Endpoints a Criar:**
```python
# CRUD
GET    /api/v1/assignments                # Listar tarefas
GET    /api/v1/assignments/{id}           # Buscar tarefa
POST   /api/v1/assignments                # Criar tarefa
PUT    /api/v1/assignments/{id}           # Atualizar tarefa
DELETE /api/v1/assignments/{id}           # Deletar tarefa

# Entregas
GET    /api/v1/assignments/{id}/submissions  # Entregas de uma tarefa
POST   /api/v1/assignments/{id}/submissions  # Entregar tarefa
PUT    /api/v1/submissions/{id}/grade        # Corrigir entrega

# Professor
GET    /api/v1/professor/assignments      # Tarefas criadas pelo professor
GET    /api/v1/professor/submissions/pending  # Correções pendentes

# Aluno
GET    /api/v1/student/assignments        # Tarefas do aluno
GET    /api/v1/student/assignments/pending  # Tarefas pendentes
```

**Schema (models/assignment.py):**
```python
class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    professor_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200))
    description = Column(Text)
    due_date = Column(DateTime)
    max_grade = Column(Float)
    attachment_url = Column(String(500))
    
class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    
    id = Column(Integer, primary_key=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    submission_date = Column(DateTime)
    content = Column(Text)
    attachment_url = Column(String(500))
    grade = Column(Float)
    feedback = Column(Text)
    status = Column(String(20))  # "Pendente", "Entregue", "Corrigido"
```

### 2.5 Sistema de Horários/Schedules

**Arquivo:** `backend/app/api/v1/endpoints/schedules.py`

**Endpoints:**
```python
GET    /api/v1/schedules                  # Listar horários
POST   /api/v1/schedules                  # Criar horário
PUT    /api/v1/schedules/{id}             # Atualizar horário
DELETE /api/v1/schedules/{id}             # Deletar horário

GET    /api/v1/classes/{id}/schedule      # Grade horária da turma
GET    /api/v1/professor/schedule         # Grade do professor
GET    /api/v1/student/schedule           # Grade do aluno
```

### Checklist Fase 2:
- [ ] Implementar endpoints de turmas/classes
- [ ] Implementar endpoints de notas/grades
- [ ] Implementar endpoints de presença/attendance
- [ ] Implementar endpoints de tarefas/assignments
- [ ] Implementar endpoints de horários/schedules
- [ ] Criar models e schemas correspondentes
- [ ] Testar todos os endpoints com Postman/curl
- [ ] Documentar no Swagger (/docs)

---

## 🎨 FASE 3: Desenvolvimento de Funcionalidades

**Objetivo:** Completar dashboards e funcionalidades pendentes  
**Duração Estimada:** 10-14 dias  
**Prioridade:** 🟡 MÉDIA-ALTA

### 3.1 Professor Dashboard

#### Funcionalidades a Desenvolver:

**1. Criar Aula**
- Formulário para criar nova aula
- Upload de material didático
- Definir data, horário, conteúdo
- Associar à turma e disciplina

**2. Minhas Aulas**
- Lista de aulas criadas
- Filtros: turma, disciplina, data
- Edição e exclusão de aulas
- Visualização de materiais

**3. Diário de Classe**
- Registro de conteúdo ministrado
- Observações sobre a aula
- Lista de presença integrada
- Histórico de aulas

**4. Correções**
- Lista de trabalhos/provas para corrigir
- Interface de correção com feedback
- Lançamento de notas
- Notificações aos alunos

**5. Relatórios**
- Relatório de desempenho da turma
- Relatório de frequência
- Exportar em PDF/Excel

### 3.2 Aluno Dashboard

#### Funcionalidades a Desenvolver:

**1. Tarefas**
- Lista de tarefas pendentes
- Prazo de entrega destacado
- Upload de arquivos
- Histórico de entregas

**2. Agenda**
- Calendário com aulas e provas
- Eventos da escola
- Tarefas com prazo
- Sincronização com Google Calendar (opcional)

**3. Materiais**
- Biblioteca de materiais por disciplina
- Download de arquivos
- Visualização de PDFs
- Organização por turma

**4. Boletim**
- Notas por disciplina
- Média geral
- Comparação com trimestres anteriores
- Gráficos de desempenho

**5. Histórico**
- Histórico escolar completo
- Anos anteriores
- Certificados
- Transferências

### 3.3 Coordenador Dashboard

#### Funcionalidades a Desenvolver:

**1. Turmas**
- CRUD completo de turmas
- Alocação de professores
- Matrícula de alunos
- Capacidade e ocupação

**2. Disciplinas**
- CRUD de disciplinas
- Carga horária
- Professores habilitados
- Programa curricular

**3. Horários**
- Montagem de grade horária
- Conflitos de horário
- Visualização por turma/professor
- Exportar grade

**4. Calendário Acadêmico**
- Datas importantes
- Períodos de avaliação
- Feriados e recessos
- Eventos escolares

**5. Relatórios Pedagógicos**
- Desempenho geral da escola
- Índices de aprovação
- Evasão escolar
- Análise comparativa

### 3.4 Secretário Dashboard

#### Funcionalidades a Desenvolver:

**1. Matrículas**
- Novo aluno
- Renovação de matrícula
- Transferências
- Cancelamentos

**2. Documentos**
- Histórico escolar
- Declarações
- Certificados
- Transferências
- Arquivo digital

**3. Relatórios Administrativos**
- Número de alunos por turma
- Taxa de ocupação
- Documentação pendente

### 3.5 Bibliotecário Dashboard

#### Funcionalidades a Desenvolver:

**1. Empréstimos**
- Registrar empréstimo
- Devolução
- Renovação
- Histórico

**2. Reservas**
- Sistema de reserva de livros
- Fila de espera
- Notificações

**3. Multas**
- Cálculo automático
- Pagamento
- Histórico

### Checklist Fase 3:
- [ ] Completar Professor Dashboard (8 funcionalidades)
- [ ] Completar Aluno Dashboard (7 funcionalidades)
- [ ] Completar Coordenador Dashboard (5 funcionalidades)
- [ ] Completar Secretário Dashboard (7 funcionalidades)
- [ ] Completar Bibliotecário Dashboard (6 funcionalidades)
- [ ] Completar Orientador Dashboard (4 funcionalidades)
- [ ] Completar Responsável Dashboard (3 funcionalidades)
- [ ] Implementar "Meu Perfil" em todos os dashboards

---

## 📊 FASE 4: Sistema de Relatórios

**Objetivo:** Implementar geração de relatórios em PDF e Excel  
**Duração Estimada:** 5-7 dias  
**Prioridade:** 🟡 MÉDIA

### 4.1 Backend - Geração de Relatórios

**Instalar Bibliotecas:**
```bash
cd backend
pip install reportlab openpyxl matplotlib
```

**Arquivo:** `backend/app/api/v1/endpoints/reports.py`

**Endpoints:**
```python
GET /api/v1/reports/student/{id}/complete           # Relatório completo do aluno
GET /api/v1/reports/student/{id}/grades             # Boletim PDF
GET /api/v1/reports/student/{id}/attendance         # Frequência PDF
GET /api/v1/reports/class/{id}/performance          # Desempenho da turma
GET /api/v1/reports/class/{id}/grades-spreadsheet   # Planilha de notas Excel
GET /api/v1/reports/professor/{id}/summary          # Resumo professor
GET /api/v1/reports/school/overview                 # Relatório geral da escola
```

### 4.2 Templates de PDF

**Criar templates com ReportLab:**
- Boletim do aluno
- Histórico escolar
- Certificado de conclusão
- Declaração de matrícula
- Relatório de frequência
- Relatório de desempenho

### 4.3 Exportação Excel

**Planilhas a implementar:**
- Lista de alunos por turma
- Notas gerais
- Frequência mensal
- Relatório financeiro
- Inventário da biblioteca

### Checklist Fase 4:
- [ ] Instalar bibliotecas de relatórios
- [ ] Criar service de geração de PDF
- [ ] Criar service de geração de Excel
- [ ] Implementar endpoints de relatórios
- [ ] Criar templates de PDF
- [ ] Integrar com dashboards
- [ ] Testar geração de todos os tipos

---

## 🧪 FASE 5: Refinamento e Testes

**Objetivo:** Polir aplicação e garantir qualidade  
**Duração Estimada:** 5-7 dias  
**Prioridade:** 🟢 MÉDIA

### 5.1 Testes Automatizados

**Backend:**
```bash
# Instalar pytest
pip install pytest pytest-asyncio httpx

# Criar testes
backend/tests/
├── test_auth.py
├── test_users.py
├── test_classes.py
├── test_grades.py
└── test_attendance.py
```

**Frontend:**
```bash
# Instalar testing library
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Criar testes
src/tests/
├── LoginForm.test.tsx
├── UserManagement.test.tsx
└── dashboards/
    ├── AdminDashboard.test.tsx
    └── ProfessorDashboard.test.tsx
```

### 5.2 Melhorias de UX

- Loading states em todas as requisições
- Mensagens de erro amigáveis
- Confirmações de ações críticas
- Toasts de sucesso/erro
- Skeleton screens
- Animações suaves

### 5.3 Otimizações

**Frontend:**
- Code splitting por dashboard
- Lazy loading de componentes
- Memoização de componentes pesados
- Otimização de imagens
- Bundle analysis

**Backend:**
- Queries otimizadas (select específico)
- Índices no banco de dados
- Cache de queries frequentes (Redis)
- Pagination em todas as listagens
- Compressão de respostas

### 5.4 Segurança

- Validação de inputs
- Sanitização de dados
- Rate limiting
- HTTPS em produção
- Proteção contra SQL injection
- Proteção contra XSS
- CORS configurado adequadamente

### Checklist Fase 5:
- [ ] Criar suite de testes backend (pytest)
- [ ] Criar suite de testes frontend (vitest)
- [ ] Implementar loading states
- [ ] Implementar error boundaries
- [ ] Adicionar confirmações de ações
- [ ] Otimizar queries do banco
- [ ] Adicionar índices no banco
- [ ] Code splitting no frontend
- [ ] Implementar rate limiting
- [ ] Auditoria de segurança

---

## 📊 Resumo das Fases

| Fase | Duração | Prioridade | Status |
|------|---------|------------|--------|
| 1. Integração Frontend-Backend | 2-3 dias | 🔴 CRÍTICA | ⏳ Pendente |
| 2. Endpoints Backend Críticos | 5-7 dias | 🔴 ALTA | ⏳ Pendente |
| 3. Desenvolvimento de Funcionalidades | 10-14 dias | 🟡 MÉDIA-ALTA | ⏳ Pendente |
| 4. Sistema de Relatórios | 5-7 dias | 🟡 MÉDIA | ⏳ Pendente |
| 5. Refinamento e Testes | 5-7 dias | 🟢 MÉDIA | ⏳ Pendente |
| **TOTAL** | **27-38 dias** | | **0%** |

---

## 🚀 Como Começar

### 1. Iniciar Fase 1 AGORA:

```bash
# 1. Criar arquivo de API service
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1
mkdir -p src/services
touch src/services/api.ts

# 2. Instalar axios se necessário
npm install axios

# 3. Começar a implementar apiService
```

### 2. Testar Incrementalmente:

Após cada funcionalidade implementada:
1. Testar endpoint no backend (/docs)
2. Testar integração no frontend
3. Verificar no navegador
4. Marcar como concluída

### 3. Documentar Progresso:

Manter este documento atualizado:
- Marcar checkboxes conforme conclusão
- Anotar problemas encontrados
- Registrar decisões técnicas

---

## 📝 Próximos Passos Imediatos

1. ✅ Criar `src/services/api.ts`
2. ✅ Atualizar `auth.ts`
3. ✅ Testar login com backend real
4. ✅ Integrar primeiro dashboard (Admin)
5. ✅ Integrar Chat com WebSocket

**Comando para começar:**
```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1
code src/services/api.ts
```

---

**Última Atualização:** 28 de Outubro de 2025  
**Progresso Geral:** 0/5 fases (0%)
