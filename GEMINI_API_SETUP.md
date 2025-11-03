# 🔑 Como Configurar a Chave da API Gemini

## Passo a Passo Rápido

### 1. Obter a Chave da API

1. **Acesse:** https://makersuite.google.com/app/apikey
2. **Faça login** com sua conta Google
3. **Clique em** "Create API Key"
4. **Selecione** um projeto do Google Cloud (ou crie um novo)
5. **Copie** a chave gerada (formato: `AIza...`)

### 2. Configurar no Backend

```bash
cd backend
nano .env  # ou use qualquer editor de texto
```

**Adicione ou edite a linha:**
```bash
GEMINI_API_KEY="sua-chave-aqui-AIza..."
```

**Salve e feche** o arquivo.

### 3. Reiniciar o Backend

```bash
# Parar servidor se estiver rodando
./stop_server.sh

# Iniciar novamente
./start_server.sh
```

### 4. Verificar Configuração

```bash
# Verificar se a chave foi carregada
cd backend
source venv/bin/activate
python -c "from app.config import settings; print('✅ Gemini configurado' if settings.gemini_api_key else '❌ Chave não encontrada')"
```

## 🧪 Testar o Sistema

### Teste 1: Upload de PDF

```bash
# Fazer login e obter token
TOKEN="seu-token-jwt-aqui"

# Upload de um PDF de teste
curl -X POST http://localhost:8004/api/v1/pdf/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@boletim_teste.pdf"

# Response esperado:
# {
#   "id": "uuid-do-job",
#   "filename": "boletim_teste.pdf",
#   "size": 123456,
#   "status": "pending",
#   "message": "Arquivo recebido e aguardando processamento"
# }
```

### Teste 2: Consultar Status

```bash
JOB_ID="uuid-do-job-retornado"

curl http://localhost:8004/api/v1/pdf/status/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"

# Repetir até status = "completed"
```

### Teste 3: Frontend

1. Acesse o dashboard: http://localhost:5173
2. Faça login
3. Navegue até "Processador de PDF"
4. Arraste um boletim PDF ou clique para selecionar
5. Aguarde o processamento
6. Clique em "Ver Dados" quando concluído
7. Revise os dados extraídos
8. Clique em "Salvar no Banco de Dados"

## 📊 Monitorar Logs

```bash
# Backend logs
tail -f backend/nohup.out

# Filtrar apenas logs de PDF
tail -f backend/nohup.out | grep -i "pdf\|extraction"
```

## ⚠️ Troubleshooting

### Erro: "Gemini API key invalid"

**Solução:**
```bash
# 1. Verificar se a chave está no .env
cat backend/.env | grep GEMINI_API_KEY

# 2. Testar chave diretamente
python -c "
import google.generativeai as genai
genai.configure(api_key='SUA_CHAVE_AQUI')
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content('Hello')
print('✅ Chave válida!' if response.text else '❌ Erro')
"
```

### Erro: "ModuleNotFoundError: google.generativeai"

**Solução:**
```bash
cd backend
source venv/bin/activate
pip install google-generativeai==0.3.2
```

### Erro: "Tesseract not found"

**Solução:**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-por

# Verificar instalação
tesseract --version
```

### PDF processa mas confiança muito baixa (<50%)

**Possíveis causas:**
- PDF de baixa qualidade/escaneado
- Formato de boletim não reconhecido
- Texto ilegível

**Soluções:**
1. Use PDF de melhor qualidade
2. Revise e corrija dados manualmente antes de salvar
3. Ajuste o prompt do Gemini em `pdf_extractor.py` para seu formato específico

## 🚀 Limites e Quota da API Gemini

### Plano Gratuito (Gemini API):
- **60 requisições por minuto**
- **1,500 requisições por dia**
- Adequado para desenvolvimento e testes

### Se exceder o limite:
```
Error: 429 Resource has been exhausted (e.g. check quota)
```

**Soluções:**
1. Aguardar reset do limite (1 minuto ou 24 horas)
2. Implementar queue system com Celery
3. Fazer upgrade para plano pago

## 📚 Documentação Oficial

- **Gemini API:** https://ai.google.dev/tutorials/python_quickstart
- **API Keys:** https://makersuite.google.com/app/apikey
- **Pricing:** https://ai.google.dev/pricing

## ✅ Checklist de Configuração

- [ ] Conta Google criada
- [ ] API Key do Gemini obtida
- [ ] Chave adicionada ao `.env`
- [ ] Backend reiniciado
- [ ] Teste de upload executado
- [ ] Dados extraídos corretamente
- [ ] Salvamento no banco funcionando

---

**🎉 Configuração completa! Seu sistema está pronto para extrair dados de boletins automaticamente.**
