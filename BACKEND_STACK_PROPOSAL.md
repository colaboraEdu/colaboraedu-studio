# 🚀 Proposta de Stack Backend - colaboraEDU

## 📊 Análise Detalhada do Sistema Atual

### Frontend Existente
- **Framework**: React 19.2.0 + TypeScript
- **Build**: Vite 6.2.0
- **Animações**: Framer Motion
- **Comunicação**: Chat mockado
- **Processamento**: PDF processor (frontend simulado)

### Funcionalidades Identificadas
1. ✅ Sistema multi-perfil (8 perfis diferentes)
2. ✅ Gestão de instituições
3. ✅ Chat/comunicação interna
4. ✅ Processamento de PDFs
5. ✅ Ocorrências de alunos
6. ⚠️ Notificações automáticas (não implementado)
7. ⚠️ Relatórios e gráficos (não implementado)
8. ⚠️ App mobile (não existe)

---

## 🎯 Requisitos do Backend

### Requisitos Funcionais

#### 1. **Extração de Dados de PDFs**
- Processar históricos escolares
- Extrair boletins e relatórios
- OCR para documentos digitalizados
- Validação e normalização de dados
- Armazenamento estruturado

#### 2. **Sistema de Notificações Automáticas**
- Email para responsáveis
- SMS/WhatsApp (opcional)
- Notificações push (app mobile)
- Alertas em tempo real
- Agendamento de envios

#### 3. **Multi-tenancy (Por Instituição)**
- Isolamento de dados por instituição
- Configurações personalizadas
- Gestão de permissões hierárquicas
- Suporte a múltiplas instituições

#### 4. **Comunicação Interna**
- Chat em tempo real
- Mensagens diretas e grupos
- Histórico de conversas
- Anexos e arquivos
- Status de leitura

#### 5. **Alertas Acadêmicos**
- Monitoramento de notas
- Controle de frequência
- Detecção de padrões
- Alertas configuráveis
- Disparos automatizados

#### 6. **API para App Mobile**
- RESTful API
- Autenticação JWT
- Push notifications
- Sincronização offline
- WebSocket para real-time

#### 7. **Relatórios e Gráficos**
- Dashboards analíticos
- Exportação (PDF, Excel, CSV)
- Gráficos interativos
- Agregações complexas
- Business Intelligence

#### 8. **Extensibilidade**
- Arquitetura modular
- Sistema de plugins
- Webhooks
- Integrações externas
- API bem documentada

---

## 🏗️ STACK BACKEND COMPLETA (Python-Based)

### **Arquitetura: Microserviços com API Gateway**

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  React Web   │  React Native│  Admin Panel │  PWA Mobile    │
└──────────────┴──────────────┴──────────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Kong/Traefik)               │
│  • Rate Limiting  • Authentication  • Load Balancing        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Auth Service │  │  Core API        │  │  Real-time       │
│  (FastAPI)    │  │  (FastAPI)       │  │  (FastAPI+WS)    │
└───────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PDF Service  │  │  Notification    │  │  Analytics       │
│  (FastAPI)    │  │  Service         │  │  (FastAPI)       │
│               │  │  (Celery)        │  │                  │
└───────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL   │  │  Redis           │  │  MongoDB         │
│  (Relational) │  │  (Cache/Queue)   │  │  (Documents)     │
└───────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🛠️ STACK DETALHADA

### **1. Framework Principal: FastAPI** ⚡
**Por quê?**
- Performance superior (baseado em Starlette + Pydantic)
- Async/await nativo (ideal para I/O intensivo)
- Documentação automática (OpenAPI/Swagger)
- Validação automática de dados (Pydantic)
- WebSocket support nativo
- Type hints nativos (ótima DX)

```python
# Exemplo de endpoint
from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI(title="colaboraEDU API")

class Student(BaseModel):
    name: str
    email: str
    institution_id: int

@app.post("/api/students/")
async def create_student(student: Student):
    return {"message": "Aluno criado", "data": student}
```

---

### **2. Banco de Dados**

#### **PostgreSQL 15+** (Banco Principal)
**Uso:**
- Dados estruturados (usuários, instituições, notas, frequência)
- Relacionamentos complexos
- ACID compliance
- Suporte a JSON (dados flexíveis)

**Extensões:**
- `pgvector` - Busca semântica (para PDFs processados)
- `pg_partman` - Particionamento (multi-tenancy)
- `TimescaleDB` - Séries temporais (métricas)

```sql
-- Exemplo de schema multi-tenant
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    grades JSONB,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY LIST (institution_id);
```

#### **Redis 7+** (Cache & Message Broker)
**Uso:**
- Cache de sessões
- Rate limiting
- Queue para Celery
- WebSocket pub/sub
- Cache de queries frequentes

#### **MongoDB 7+** (Opcional - Documentos)
**Uso:**
- Logs e auditoria
- Dados não estruturados de PDFs
- Histórico de mensagens do chat
- Armazenamento de eventos

---

### **3. Processamento de PDFs** 📄

#### **Stack de PDF:**
```python
# bibliotecas principais
pdfplumber==0.10.3      # Extração de texto/tabelas
PyPDF2==3.0.1           # Manipulação de PDFs
pdf2image==1.16.3       # Conversão para imagens
pytesseract==0.3.10     # OCR (Tesseract)
opencv-python==4.8.1    # Processamento de imagem
```

#### **AI para Processamento Inteligente:**
```python
# Gemini AI (Google) - já mencionado no projeto
google-generativeai==0.3.2

# Alternativa: OpenAI
openai==1.3.0

# Processamento de linguagem natural
spacy==3.7.2
transformers==4.35.0    # Hugging Face

# Extração de dados estruturados
pydantic==2.5.0
```

**Serviço de PDF (pdf_service.py):**
```python
from fastapi import FastAPI, UploadFile, File
import pdfplumber
from google.generativeai import GenerativeModel
import json

app = FastAPI()

class PDFProcessor:
    def __init__(self):
        self.model = GenerativeModel('gemini-pro')
    
    async def extract_student_data(self, pdf_file: bytes):
        """Extrai dados de histórico escolar"""
        with pdfplumber.open(pdf_file) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text()
        
        # Usar Gemini para estruturar dados
        prompt = f"""
        Extraia do seguinte texto de histórico escolar:
        - Nome do aluno
        - Matrícula
        - Disciplinas e notas
        - Frequência
        
        Retorne em formato JSON.
        
        Texto: {text}
        """
        
        response = self.model.generate_content(prompt)
        return json.loads(response.text)

@app.post("/api/pdf/process")
async def process_pdf(file: UploadFile = File(...)):
    processor = PDFProcessor()
    data = await processor.extract_student_data(await file.read())
    return {"status": "success", "data": data}
```

---

### **4. Sistema de Notificações** 🔔

#### **Celery + Redis** (Task Queue)
```python
# celery_app.py
from celery import Celery

app = Celery(
    'colaboraedu',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)

@app.task
def send_occurrence_notification(student_id: str, occurrence_type: str):
    """Envia notificação quando aluno tem ocorrência"""
    student = get_student(student_id)
    parents = get_student_parents(student_id)
    
    for parent in parents:
        # Email
        send_email(
            to=parent.email,
            subject=f"Ocorrência Registrada - {student.name}",
            template="occurrence_alert",
            context={"student": student, "type": occurrence_type}
        )
        
        # SMS (Twilio)
        send_sms(
            to=parent.phone,
            message=f"Atenção: {student.name} teve uma ocorrência registrada."
        )
        
        # Push notification (Firebase)
        send_push(
            token=parent.fcm_token,
            title="Nova Ocorrência",
            body=f"{student.name} - {occurrence_type}"
        )
```

#### **Bibliotecas de Notificação:**
```python
# Email
fastapi-mail==1.4.1
python-decouple==3.8      # Variáveis de ambiente

# SMS
twilio==8.10.0

# Push Notifications
firebase-admin==6.3.0

# WhatsApp (Business API)
python-whatsapp-business==1.0.0
```

---

### **5. Comunicação em Tempo Real** 💬

#### **WebSocket com FastAPI + Redis Pub/Sub**

```python
# websocket_service.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import redis
import json

app = FastAPI()
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    
    # Subscribe to Redis channel
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f"user:{user_id}")
    
    try:
        while True:
            # Receber mensagens do cliente
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Processar e enviar
            recipient_id = message['to']
            redis_client.publish(
                f"user:{recipient_id}",
                json.dumps({
                    "from": user_id,
                    "message": message['text'],
                    "timestamp": datetime.now().isoformat()
                })
            )
            
            # Salvar no banco
            save_message_to_db(message)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        pubsub.unsubscribe()
```

---

### **6. Autenticação & Autorização** 🔐

#### **JWT + OAuth2**

```python
# auth_service.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

# Configurações
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        institution_id: str = payload.get("institution_id")
        
        if user_id is None:
            raise HTTPException(status_code=401)
        
        # Validar multi-tenancy
        return {"user_id": user_id, "institution_id": institution_id}
    except JWTError:
        raise HTTPException(status_code=401)

# Middleware de Multi-tenancy
async def verify_institution_access(
    current_user: dict = Depends(get_current_user),
    resource_institution_id: str = None
):
    """Garante que usuário só acessa dados da sua instituição"""
    if current_user["institution_id"] != resource_institution_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return True
```

**Bibliotecas:**
```python
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

---

### **7. Analytics & Relatórios** 📊

#### **Pandas + Plotly + ReportLab**

```python
# analytics_service.py
import pandas as pd
import plotly.express as px
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO

class AnalyticsService:
    async def generate_student_report(self, student_id: str):
        # Buscar dados
        grades = await get_student_grades(student_id)
        attendance = await get_student_attendance(student_id)
        
        # Criar DataFrame
        df_grades = pd.DataFrame(grades)
        
        # Gráficos
        fig = px.line(
            df_grades, 
            x='date', 
            y='grade',
            title='Evolução de Notas',
            color='subject'
        )
        
        # Converter para imagem
        img_bytes = fig.to_image(format="png")
        
        # Gerar PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        
        p.drawString(100, 800, f"Relatório do Aluno: {student_id}")
        p.drawImage(img_bytes, 100, 400, width=400, height=300)
        
        p.showPage()
        p.save()
        
        return buffer.getvalue()

# Exportação Excel
@app.get("/api/reports/export/excel")
async def export_excel(institution_id: str):
    students = await get_all_students(institution_id)
    df = pd.DataFrame(students)
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Alunos', index=False)
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': 'attachment; filename=alunos.xlsx'}
    )
```

**Bibliotecas:**
```python
pandas==2.1.4
plotly==5.18.0
reportlab==4.0.7
xlsxwriter==3.1.9
openpyxl==3.1.2
matplotlib==3.8.2
seaborn==0.13.0
```

---

### **8. API para Mobile** 📱

#### **FastAPI + Pydantic (Schema Validation)**

```python
# mobile_api.py
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="colaboraEDU Mobile API")

class StudentGrade(BaseModel):
    subject: str
    grade: float
    date: str
    semester: int

class StudentDashboard(BaseModel):
    name: str
    avatar: str
    average_grade: float
    attendance_percentage: float
    recent_grades: List[StudentGrade]
    pending_assignments: int
    next_class: Optional[str]

@app.get("/api/mobile/student/{student_id}/dashboard")
async def get_student_dashboard(
    student_id: str,
    current_user: dict = Depends(get_current_user)
) -> StudentDashboard:
    """Dashboard otimizado para mobile"""
    
    # Uma única query agregada
    data = await db.fetch_one("""
        SELECT 
            s.name,
            s.avatar,
            AVG(g.grade) as average_grade,
            (COUNT(CASE WHEN a.present THEN 1 END) * 100.0 / COUNT(*)) as attendance,
            COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks
        FROM students s
        LEFT JOIN grades g ON s.id = g.student_id
        LEFT JOIN attendance a ON s.id = a.student_id
        LEFT JOIN tasks t ON s.id = t.student_id
        WHERE s.id = :student_id
        GROUP BY s.id
    """, {"student_id": student_id})
    
    return StudentDashboard(**data)

# Push Notifications
from firebase_admin import messaging

@app.post("/api/mobile/notifications/register")
async def register_fcm_token(
    token: str,
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Registra token FCM para push notifications"""
    await db.execute(
        "UPDATE users SET fcm_token = :token WHERE id = :user_id",
        {"token": token, "user_id": user_id}
    )
    return {"message": "Token registrado"}

async def send_push_notification(user_id: str, title: str, body: str):
    """Envia push notification"""
    token = await get_user_fcm_token(user_id)
    
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        token=token
    )
    
    response = messaging.send(message)
    return response
```

---

### **9. ORM & Migrations** 🗃️

#### **SQLAlchemy 2.0 + Alembic**

```python
# models.py
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from database import Base

class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    students = relationship("Student", back_populates="institution")
    teachers = relationship("Teacher", back_populates="institution")

class Student(Base):
    __tablename__ = "students"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id"))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True)
    metadata = Column(JSON)  # Dados flexíveis
    
    # Relationships
    institution = relationship("Institution", back_populates="students")
    grades = relationship("Grade", back_populates="student")
    occurrences = relationship("Occurrence", back_populates="student")

class Occurrence(Base):
    __tablename__ = "occurrences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"))
    type = Column(String(50))  # 'disciplinary', 'academic', 'health'
    severity = Column(String(20))  # 'low', 'medium', 'high'
    description = Column(String)
    notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="occurrences")
```

**Migrations:**
```bash
# Criar migration
alembic revision --autogenerate -m "Add occurrences table"

# Aplicar
alembic upgrade head
```

---

## 🔧 STACK COMPLETA - RESUMO

### **Core Backend**
```yaml
Framework: FastAPI 0.109.0
Python: 3.11+
ASGI Server: Uvicorn + Gunicorn
```

### **Bancos de Dados**
```yaml
Primary DB: PostgreSQL 15+
  Extensions: pgvector, TimescaleDB, pg_partman
Cache/Queue: Redis 7+
Documents: MongoDB 7+ (opcional)
Search: Elasticsearch 8+ (opcional)
```

### **Processamento**
```yaml
PDFs:
  - pdfplumber
  - PyPDF2
  - pytesseract
  - opencv-python
  
AI/ML:
  - google-generativeai (Gemini)
  - openai (GPT)
  - spacy
  - transformers
```

### **Comunicação**
```yaml
Real-time: WebSocket (FastAPI) + Redis Pub/Sub
Email: fastapi-mail
SMS: twilio
WhatsApp: python-whatsapp-business
Push: firebase-admin
```

### **Tasks & Background Jobs**
```yaml
Queue: Celery 5.3+
Broker: Redis
Scheduler: Celery Beat
Monitoring: Flower
```

### **Autenticação**
```yaml
JWT: python-jose
Password Hashing: passlib + bcrypt
OAuth2: FastAPI OAuth2
Multi-tenancy: Row-level security (PostgreSQL)
```

### **Analytics**
```yaml
Data Processing: pandas, numpy
Visualization: plotly, matplotlib, seaborn
Reports: reportlab, weasyprint
Export: xlsxwriter, openpyxl
```

### **API & Docs**
```yaml
Schema: Pydantic
OpenAPI: FastAPI (automático)
API Docs: Swagger UI + ReDoc
Versioning: Header-based
```

### **Testing**
```yaml
Unit Tests: pytest
API Tests: httpx
Coverage: pytest-cov
Load Tests: locust
```

### **DevOps**
```yaml
Containerization: Docker + Docker Compose
Orchestration: Kubernetes
CI/CD: GitHub Actions
Monitoring: Prometheus + Grafana
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
APM: New Relic / DataDog
```

---

## 📦 ESTRUTURA DE PROJETO BACKEND

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app
│   ├── config.py                  # Configurações
│   ├── database.py                # DB connection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                # Dependências (auth, etc)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── students.py
│   │       ├── institutions.py
│   │       ├── chat.py
│   │       ├── notifications.py
│   │       └── reports.py
│   │
│   ├── models/                     # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── institution.py
│   │   ├── occurrence.py
│   │   └── message.py
│   │
│   ├── schemas/                    # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── student.py
│   │   └── institution.py
│   │
│   ├── services/                   # Business logic
│   │   ├── __init__.py
│   │   ├── pdf_processor.py
│   │   ├── notification.py
│   │   ├── analytics.py
│   │   └── chat.py
│   │
│   ├── core/                       # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── config.py
│   │   └── logging.py
│   │
│   ├── tasks/                      # Celery tasks
│   │   ├── __init__.py
│   │   ├── notifications.py
│   │   ├── reports.py
│   │   └── pdf_processing.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── email.py
│       ├── sms.py
│       └── validators.py
│
├── alembic/                        # Migrations
│   ├── versions/
│   └── env.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_students.py
│   └── test_notifications.py
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── .env.example
├── .gitignore
├── alembic.ini
├── pyproject.toml                  # Poetry dependencies
├── requirements.txt
└── README.md
```

---

## 📋 DEPENDÊNCIAS COMPLETAS (pyproject.toml)

```toml
[tool.poetry]
name = "colaboraedu-backend"
version = "1.0.0"
description = "Backend para plataforma colaboraEDU"
python = "^3.11"

[tool.poetry.dependencies]
# Core
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
gunicorn = "^21.2.0"
pydantic = {extras = ["email"], version = "^2.5.0"}
pydantic-settings = "^2.1.0"

# Database
sqlalchemy = "^2.0.25"
alembic = "^1.13.1"
asyncpg = "^0.29.0"
psycopg2-binary = "^2.9.9"
redis = "^5.0.1"
motor = "^3.3.2"  # MongoDB async driver

# Authentication
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"

# PDF Processing
pdfplumber = "^0.10.3"
PyPDF2 = "^3.0.1"
pdf2image = "^1.16.3"
pytesseract = "^0.3.10"
opencv-python = "^4.8.1"
pillow = "^10.1.0"

# AI/ML
google-generativeai = "^0.3.2"
openai = "^1.3.0"
spacy = "^3.7.2"
transformers = "^4.35.0"

# Communication
fastapi-mail = "^1.4.1"
twilio = "^8.10.0"
firebase-admin = "^6.3.0"

# Background Tasks
celery = {extras = ["redis"], version = "^5.3.4"}
flower = "^2.0.1"

# Analytics
pandas = "^2.1.4"
numpy = "^1.26.2"
plotly = "^5.18.0"
matplotlib = "^3.8.2"
seaborn = "^0.13.0"

# Reports
reportlab = "^4.0.7"
xlsxwriter = "^3.1.9"
openpyxl = "^3.1.2"
weasyprint = "^60.1"

# Utilities
python-decouple = "^3.8"
httpx = "^0.26.0"
websockets = "^12.0"
python-dateutil = "^2.8.2"

# Monitoring
prometheus-client = "^0.19.0"
sentry-sdk = {extras = ["fastapi"], version = "^1.39.2"}

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
pytest-cov = "^4.1.0"
httpx = "^0.26.0"
faker = "^21.0.0"
black = "^23.12.1"
isort = "^5.13.2"
flake8 = "^7.0.0"
mypy = "^1.7.1"
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### **Fase 1: MVP (2-3 meses)**
1. ✅ Setup inicial (FastAPI + PostgreSQL + Redis)
2. ✅ Autenticação JWT + Multi-tenancy
3. ✅ CRUD básico (Usuários, Instituições, Alunos)
4. ✅ API de Chat básica (WebSocket)
5. ✅ Processador PDF simples
6. ✅ Notificações por email

### **Fase 2: Features Core (3-4 meses)**
1. ✅ Sistema de ocorrências completo
2. ✅ Alertas automáticos configuráveis
3. ✅ Dashboard de analytics básico
4. ✅ Relatórios em PDF
5. ✅ API mobile otimizada
6. ✅ Push notifications

### **Fase 3: Avançado (4-6 meses)**
1. ✅ IA para análise de PDFs
2. ✅ Predição de desempenho (ML)
3. ✅ Sistema de recomendações
4. ✅ Integração WhatsApp Business
5. ✅ Dashboard BI avançado
6. ✅ Sistema de plugins

### **Fase 4: Escala (ongoing)**
1. ✅ Microserviços completos
2. ✅ Kubernetes deployment
3. ✅ CI/CD avançado
4. ✅ Multi-região
5. ✅ Disaster recovery

---

## 💰 ESTIMATIVA DE CUSTOS (Cloud)

### **Infraestrutura AWS (mensal)**
```
- EC2 t3.medium (API) x3:      $100
- RDS PostgreSQL (db.t3.large): $150
- ElastiCache Redis:            $50
- S3 (PDFs/Assets):             $30
- CloudFront CDN:               $20
- Load Balancer:                $25
- Total:                        ~$375/mês
```

### **Serviços Terceiros**
```
- Twilio (SMS): $0.01/msg
- SendGrid (Email): $15/mês (40k emails)
- Firebase (Push): Grátis até 10M/mês
- Gemini API: Variável por uso
```

---

## 🎯 VANTAGENS DESTA STACK

1. ✅ **Performance**: FastAPI é um dos frameworks mais rápidos
2. ✅ **Type Safety**: Pydantic + Type hints
3. ✅ **Async**: Suporte nativo a async/await
4. ✅ **Documentação**: OpenAPI automático
5. ✅ **Escalabilidade**: Microserviços + Kubernetes ready
6. ✅ **Comunidade**: Ecossistema Python robusto
7. ✅ **IA/ML**: Melhor suporte para bibliotecas de ML
8. ✅ **Produtividade**: Desenvolvimento rápido
9. ✅ **Custo**: Open source, sem licenças
10. ✅ **Flexibilidade**: Fácil adicionar novos recursos

---

## 📞 PRÓXIMOS PASSOS

1. **Aprovação da Stack**
2. **Setup do ambiente de desenvolvimento**
3. **Definição de schemas do banco**
4. **Implementação do MVP**
5. **Testes e validação**
6. **Deploy em staging**
7. **Migração de dados**
8. **Go live gradual**

---

**Documentação criada em**: 24 de outubro de 2025  
**Versão**: 1.0.0  
**Stack**: Python + FastAPI + PostgreSQL + Redis + MongoDB  
**Arquitetura**: Microserviços + API Gateway
