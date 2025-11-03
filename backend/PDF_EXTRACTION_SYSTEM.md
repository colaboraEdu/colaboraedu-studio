# 📄 Sistema de Extração de Dados de Boletins em PDF

## 🎯 Visão Geral

Sistema robusto para **extração automatizada de dados** de boletins escolares em PDF, usando **múltiplas técnicas de processamento** e **Inteligência Artificial** para garantir precisão máxima.

## 🏗️ Arquitetura

```
┌─────────────┐
│   Upload    │
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Endpoint   │
│  POST /pdf/     │
│  upload         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Background     │
│  Processing     │
│  (async)        │
└──────┬──────────┘
       │
       ▼
┌──────────────────────────────────┐
│      PDF Extractor Service       │
│                                  │
│  1. pdfplumber → Text Extraction │
│  2. pytesseract → OCR (fallback) │
│  3. Table Detection              │
│  4. Gemini AI → Structuring      │
│  5. Regex → Validation           │
└──────┬───────────────────────────┘
       │
       ▼
┌─────────────────┐
│  Validation UI  │
│  (Manual        │
│  Correction)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Database       │
│  (Students,     │
│  Grades, etc)   │
└─────────────────┘
```

## 🚀 Fluxo de Processamento

### 1. Upload do PDF
```python
POST /api/v1/pdf/upload
Content-Type: multipart/form-data

{
  "file": <arquivo.pdf>
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "boletim_joao_silva.pdf",
  "size": 245678,
  "status": "pending",
  "message": "Arquivo recebido e aguardando processamento"
}
```

### 2. Monitoramento do Status
```python
GET /api/v1/pdf/status/{job_id}
```

**Response (Processing):**
```json
{
  "id": "550e8400-...",
  "filename": "boletim_joao_silva.pdf",
  "status": "processing",
  "progress": 45,
  "extracted_data": null,
  "error_message": null,
  "created_at": "2025-11-03T10:30:00Z",
  "completed_at": null
}
```

**Response (Completed):**
```json
{
  "id": "550e8400-...",
  "status": "completed",
  "progress": 100,
  "extracted_data": {
    "student": {
      "full_name": "João Pedro Silva",
      "enrollment_number": "2024001234",
      "birth_date": "15/03/2010",
      "class_name": "9º Ano A",
      "academic_year": 2024,
      "semester": 1
    },
    "institution": {
      "name": "Escola Estadual Dom Pedro II",
      "cnpj": "12.345.678/0001-90",
      "address": "Rua das Flores, 123 - São Paulo/SP"
    },
    "grades": [
      {
        "subject_name": "Português",
        "grade_1": 8.5,
        "grade_2": 7.0,
        "grade_3": 9.0,
        "grade_4": 8.0,
        "average": 8.1,
        "status": "Aprovado"
      },
      {
        "subject_name": "Matemática",
        "grade_1": 6.5,
        "grade_2": 7.5,
        "grade_3": 8.0,
        "grade_4": 7.0,
        "average": 7.25,
        "status": "Aprovado"
      }
    ],
    "attendance": {
      "total_days": 200,
      "present_days": 190,
      "absent_days": 10,
      "percentage": 95.0
    },
    "observations": "Aluno demonstra excelente desempenho.",
    "confidence_score": 0.95
  },
  "completed_at": "2025-11-03T10:32:15Z"
}
```

### 3. Validação e Salvamento
```python
POST /api/v1/pdf/validate

{
  "extraction_id": "550e8400-...",
  "validated_data": { /* dados corrigidos se necessário */ },
  "corrections": {
    "student.full_name": "Correção manual aplicada"
  },
  "approve": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dados validados e salvos com sucesso!",
  "students_created": 1,
  "grades_created": 8,
  "attendance_created": 1,
  "errors": []
}
```

## 🔧 Técnicas de Extração

### 1. **pdfplumber** - Extração Primária
- Extrai texto diretamente do PDF
- Detecta e extrai tabelas estruturadas
- Melhor performance para PDFs nativos

### 2. **pytesseract (OCR)** - Fallback
- Ativado quando texto não está disponível
- Converte PDF para imagem (300 DPI)
- Aplica OCR em português
- Essencial para documentos digitalizados

### 3. **Gemini AI** - Estruturação Inteligente
- Analisa texto extraído
- Identifica padrões e estruturas
- Normaliza dados em JSON
- Confiança: ~95%

### 4. **Regex** - Validação e Fallback
- Padrões para nomes, matrículas, notas
- Backup quando IA não está disponível
- Valida dados extraídos
- Confiança: ~60%

## 📊 Schemas de Dados

### StudentInfo
```python
{
  "full_name": str,              # Obrigatório
  "enrollment_number": str,      # Opcional
  "birth_date": str,             # DD/MM/YYYY
  "class_name": str,             # Ex: "9º Ano A"
  "academic_year": int,          # Ex: 2024
  "semester": int                # 1 ou 2
}
```

### SubjectGrade
```python
{
  "subject_name": str,           # Ex: "Português"
  "grade_1": float,              # 0.0 - 10.0
  "grade_2": float,
  "grade_3": float,
  "grade_4": float,
  "average": float,              # Calculado automaticamente
  "status": str                  # Aprovado/Reprovado/Recuperação
}
```

### AttendanceInfo
```python
{
  "total_days": int,             # Dias letivos
  "present_days": int,           # Dias presentes
  "absent_days": int,            # Calculado automaticamente
  "percentage": float            # Calculado automaticamente
}
```

## 🔐 Segurança

### Validações de Upload
- ✅ Apenas arquivos PDF
- ✅ Máximo 50MB
- ✅ Verificação de tipo MIME
- ✅ Scan antivírus (recomendado)

### Permissões
- Usuário só acessa seus próprios jobs
- Administradores podem ver todos
- Logs de auditoria completos

### Dados Sensíveis
- Gemini API Key em variável de ambiente
- Arquivos temporários deletados após processamento
- Dados armazenados com criptografia (recomendado)

## 🎨 Boas Práticas Implementadas

### 1. **Processamento Assíncrono**
```python
# Background task não bloqueia API
background_tasks.add_task(process_pdf_background, ...)
```

### 2. **Logging Detalhado**
```python
logger.info(f"Iniciando extração de {filename}")
logger.debug(f"Texto extraído: {text[:500]}")
logger.error(f"Erro na extração: {e}", exc_info=True)
```

### 3. **Validação Pydantic**
```python
class SubjectGrade(BaseModel):
    grade_1: Optional[float] = Field(None, ge=0, le=10)
    
    @validator('grade_1')
    def round_grades(cls, v):
        return round(float(v), 2) if v else v
```

### 4. **Fallback em Camadas**
```
Gemini AI (95%) → Regex (60%) → Manual (100%)
```

### 5. **Enriquecimento Automático**
```python
# Calcula médias faltantes
grade.average = grade.calculate_average()

# Determina status automaticamente
if grade.average >= 7.0:
    grade.status = "Aprovado"
```

## 📦 Instalação

### Dependências do Sistema
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-por poppler-utils

# macOS
brew install tesseract tesseract-lang poppler

# Windows
# Baixar Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
# Baixar Poppler: https://github.com/oschwartz10612/poppler-windows
```

### Dependências Python
```bash
cd backend
pip install -r requirements.txt
```

### Configuração
```bash
# Copiar .env.example
cp .env.example .env

# Editar .env e adicionar:
GEMINI_API_KEY="sua-chave-aqui"
```

## 🧪 Testes

### Teste Unitário
```python
async def test_extract_bulletin():
    extractor = PDFExtractor(gemini_api_key="test-key")
    
    with open("test_boletim.pdf", "rb") as f:
        pdf_bytes = f.read()
    
    result = await extractor.extract_from_pdf(pdf_bytes, "test.pdf")
    
    assert result.student.full_name != "Nome não encontrado"
    assert len(result.grades) > 0
    assert result.confidence_score > 0.5
```

### Teste de Integração
```bash
# Upload
curl -X POST http://localhost:8004/api/v1/pdf/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@boletim.pdf"

# Status
curl http://localhost:8004/api/v1/pdf/status/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"

# Validar
curl -X POST http://localhost:8004/api/v1/pdf/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extraction_id": "'$JOB_ID'",
    "validated_data": {...},
    "approve": true
  }'
```

## 📈 Performance

### Métricas Esperadas
- **Upload**: < 1s
- **Processamento**: 5-30s (depende do tamanho)
- **Validação**: < 1s
- **Salvamento**: < 2s

### Otimizações
- Processamento assíncrono (não bloqueia API)
- Caching de resultados intermediários
- Limite de arquivos simultâneos
- Queue com Redis/Celery para escala

## 🔄 Roadmap Futuro

### Fase 1 (Atual)
- ✅ Upload e processamento básico
- ✅ Extração com múltiplas técnicas
- ✅ Validação manual
- ✅ Salvamento no banco

### Fase 2 (Próxima)
- [ ] Worker Celery dedicado
- [ ] Batch processing (múltiplos PDFs)
- [ ] Templates de boletins customizáveis
- [ ] Machine Learning para melhorar precisão

### Fase 3 (Futuro)
- [ ] Reconhecimento de assinaturas
- [ ] Detecção de fraudes
- [ ] Comparação histórica automática
- [ ] API pública para integrações

## 🐛 Troubleshooting

### Erro: "Tesseract not found"
```bash
# Linux
sudo apt-get install tesseract-ocr tesseract-ocr-por

# macOS
brew install tesseract

# Windows: adicionar ao PATH
```

### Erro: "Gemini API key invalid"
```bash
# Verificar .env
cat backend/.env | grep GEMINI_API_KEY

# Testar chave
python -c "import google.generativeai as genai; genai.configure(api_key='SUA_CHAVE')"
```

### Erro: "PDF processing timeout"
```python
# Aumentar timeout em pdf_extractor.py
TIMEOUT_SECONDS = 60  # Padrão: 30
```

## 📚 Referências

- [pdfplumber Documentation](https://github.com/jsvine/pdfplumber)
- [pytesseract Documentation](https://github.com/madmaze/pytesseract)
- [Gemini API Guide](https://ai.google.dev/tutorials/python_quickstart)
- [FastAPI BackgroundTasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `tail -f backend/logs/pdf_processing.log`
2. Testar manualmente com arquivo de exemplo
3. Reportar issue com arquivo de exemplo (sem dados sensíveis)

---

**Desenvolvido com ❤️ para colaboraEDU**
