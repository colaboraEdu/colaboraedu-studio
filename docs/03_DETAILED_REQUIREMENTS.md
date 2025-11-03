# 📋 Documento de Requisitos - Especificações Detalhadas

**Data**: 24 de outubro de 2025  
**Versão**: 1.0.0

---

## 🎯 Requisitos Funcionais

### RF-001: Autenticação e Gestão de Usuários

#### RF-001.1 - Login com Email e Senha
- **Descrição**: Usuário deve fazer login com email e senha
- **Atores**: Todos os usuários
- **Precondições**: Usuário registrado, email verificado
- **Fluxo Principal**:
  1. Usuário acessa página de login
  2. Insere email e senha
  3. Sistema valida credenciais
  4. Se válido: redireciona para dashboard
  5. Se inválido: exibe mensagem de erro
- **Pós-condições**: Usuário autenticado, sessão criada
- **Requisitos Funcionais**:
  - [ ] Validar formato de email
  - [ ] Validar senha (mínimo 8 caracteres)
  - [ ] Hash de senha com bcrypt
  - [ ] Limpar tentativas de login falhas
  - [ ] Bloquear após 5 tentativas falhas
  - [ ] Gerar JWT token (válido por 30 minutos)
  - [ ] Gerar refresh token (válido por 7 dias)

#### RF-001.2 - Recuperação de Senha
- **Descrição**: Usuário pode recuperar senha esquecida
- **Fluxo Principal**:
  1. Clica em "Esqueceu a senha?"
  2. Insere email
  3. Sistema envia link de reset
  4. Usuário clica no link (válido por 1 hora)
  5. Define nova senha
  6. Sistema confirma
- **Pós-condições**: Senha resetada com sucesso

#### RF-001.3 - Gerenciamento de Perfil
- **Descrição**: Usuário pode atualizar seu perfil
- **Atributos editáveis**:
  - [ ] Nome
  - [ ] Foto de perfil
  - [ ] Telefone
  - [ ] Endereço
  - [ ] Preferências de notificação
- **Requisitos**:
  - [ ] Validar dados antes de salvar
  - [ ] Manter histórico de alterações
  - [ ] Auditar mudanças
  - [ ] Permitir desfazer por admin

---

### RF-002: Gestão de Instituições

#### RF-002.1 - CRUD de Instituições
- **Descrição**: Admin pode criar, ler, atualizar e deletar instituições
- **Campos obrigatórios**:
  - [ ] Nome da instituição
  - [ ] CNPJ
  - [ ] Endereço completo
  - [ ] Telefone
  - [ ] Email
  - [ ] Responsável (nome e contato)
- **Validações**:
  - [ ] CNPJ único no sistema
  - [ ] Formato de CNPJ válido
  - [ ] Email válido
  - [ ] Status: Ativa, Inativa, Pendente
- **Permissões**:
  - [ ] SuperAdmin: Criar, editar, deletar
  - [ ] Admin Instituição: Visualizar, editar dados próprios
  - [ ] Outros: Apenas visualizar informações públicas

#### RF-002.2 - Multi-tenancy
- **Descrição**: Dados completamente isolados por instituição
- **Requisitos**:
  - [ ] Cada instituição é um tenant separado
  - [ ] Row-level security (RLS)
  - [ ] Usuários acessam apenas sua instituição
  - [ ] Relatórios agregados por instituição
  - [ ] Logs separados por tenant
  - [ ] Backups independentes

---

### RF-003: Gestão de Usuários e Papéis

#### RF-003.1 - Criação de Usuários
- **Descrição**: Admin pode criar novos usuários
- **Campos**:
  - [ ] Email
  - [ ] Nome completo
  - [ ] Papel (role)
  - [ ] Status (ativo/inativo)
  - [ ] Departamento (opcional)
- **Fluxo**:
  1. Admin seleciona "Novo usuário"
  2. Preenche formulário
  3. Sistema valida dados
  4. Envia email de boas-vindas com link de ativação
  5. Usuário clica no link e define senha
  6. Conta ativada
- **Validações**:
  - [ ] Email único por instituição
  - [ ] Papel válido
  - [ ] Dados obrigatórios preenchidos

#### RF-003.2 - RBAC (Role-Based Access Control)
- **Papéis**: Admin, Professor, Aluno, Coordenador, Secretário, Orientador, Bibliotecário, Responsável
- **Permissões por Papel**:

| Ação | Admin | Prof | Aluno | Coord | Sec | Orient | Biblio | Resp |
|------|-------|------|-------|-------|-----|--------|--------|------|
| Criar usuários | ✓ | - | - | ✓ | - | - | - | - |
| Editar notas | - | ✓ | - | ✓ | - | - | - | - |
| Ver notas próprias | ✓ | ✓ | ✓ | ✓ | - | ✓ | - | ✓ |
| Enviar mensagens | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Criar relatórios | ✓ | ✓ | - | ✓ | ✓ | ✓ | - | - |

#### RF-003.3 - Importação em Lote
- **Descrição**: Admin pode importar usuários via CSV
- **Formato de arquivo**:
  ```csv
  email,nome,sobrenome,papel,departamento
  joao@example.com,João,Silva,professor,9º Ano
  ```
- **Validações**:
  - [ ] Validar formato CSV
  - [ ] Verificar email duplicado
  - [ ] Validar papéis
  - [ ] Limitar a 10.000 usuários por importação
  - [ ] Gerar relatório de erros
  - [ ] Permitir rollback
- **Resultado**:
  - [ ] Email de boas-vindas automático
  - [ ] Usuários em status "pendente ativação"

---

### RF-004: Sistema de Ocorrências

#### RF-004.1 - Registrar Ocorrência
- **Descrição**: Professor ou orientador registra ocorrência de aluno
- **Tipos de ocorrência**:
  - [ ] Disciplinar (advertência, suspensão, expulsão)
  - [ ] Acadêmica (falta, atraso, falta de tarefa)
  - [ ] Saúde (medicação, acidente, doença)
- **Severidade**:
  - [ ] Baixa (aviso)
  - [ ] Média (advertência)
  - [ ] Alta (suspensão/expulsão)
- **Formulário**:
  - [ ] Aluno (seletor)
  - [ ] Tipo de ocorrência (dropdown)
  - [ ] Severidade (radio buttons)
  - [ ] Descrição detalhada (textarea)
  - [ ] Anexos (opcional)
- **Fluxo**:
  1. Professor acessa "Registrar Ocorrência"
  2. Preenche formulário
  3. Sistema valida
  4. Salva ocorrência
  5. Notifica responsáveis automaticamente
  6. Adiciona ao histórico do aluno
- **Notificações**:
  - [ ] Email para responsáveis
  - [ ] SMS (se configurado)
  - [ ] Push notification
  - [ ] Aviso na tela ao fazer login

#### RF-004.2 - Visualizar Histórico
- **Descrição**: Stakeholders visualizam ocorrências do aluno
- **Quem pode ver**:
  - [ ] Admin: Todas as ocorrências
  - [ ] Professor: Ocorrências de seus alunos
  - [ ] Orientador: Alunos sob sua orientação
  - [ ] Responsável: Ocorrências de seus filhos
  - [ ] Aluno: Suas próprias ocorrências
- **Filtros**:
  - [ ] Por tipo
  - [ ] Por severidade
  - [ ] Por período
  - [ ] Por professor
- **Ações**:
  - [ ] Editar (até 24h após criação)
  - [ ] Deletar (só admin, com auditoria)
  - [ ] Imprimir relatório
  - [ ] Exportar PDF/Excel

---

### RF-005: Notificações Automáticas

#### RF-005.1 - Disparar Notificação
- **Descrição**: Sistema envia notificações automáticas baseadas em eventos
- **Eventos disparadores**:
  - [ ] Ocorrência registrada → Responsáveis
  - [ ] Nota lançada → Aluno, Responsáveis
  - [ ] Frequência baixa → Aluno, Responsáveis
  - [ ] Tarefa atrasada → Aluno, Professor
  - [ ] Mensagem recebida → Destinatário
  - [ ] Relatório gerado → Solicitante
- **Canais**:
  - [ ] Email (FastAPI Mail)
  - [ ] SMS (Twilio)
  - [ ] WhatsApp (Business API)
  - [ ] Push Notification (Firebase)
  - [ ] In-app (websocket)
- **Template de Email**:
  ```html
  Assunto: [Tipo] - ${titulo}
  
  Olá ${nome},
  
  ${corpo_mensagem}
  
  ${data_hora}
  ```
- **Configurações**:
  - [ ] Usuário pode desabilitar notificações por tipo
  - [ ] Horário preferido para receber (ex: não perturbar entre 20-8h)
  - [ ] Tipo de canal preferido
  - [ ] Frequência de digest (imediato, diário, semanal)

#### RF-005.2 - Rastreamento de Notificações
- **Dados**:
  - [ ] ID da notificação
  - [ ] Destinatário
  - [ ] Tipo
  - [ ] Conteúdo
  - [ ] Canais tentados
  - [ ] Status (enviado, falha, read)
  - [ ] Data/hora de envio
  - [ ] Retry count
- **Retry automático**:
  - [ ] Tentar 3x em caso de falha
  - [ ] Backoff exponencial (1min, 5min, 15min)
  - [ ] Notificar admin se falhar após 3 tentativas

---

### RF-006: Processamento de PDFs

#### RF-006.1 - Upload de Documentos
- **Descrição**: Sistema processa PDFs automaticamente
- **Tipos aceitos**:
  - [ ] Histórico escolar
  - [ ] Boletim
  - [ ] Certificado
  - [ ] Documento administrativo
- **Validações**:
  - [ ] Máximo 50MB por arquivo
  - [ ] Apenas PDF
  - [ ] Verificar vírus (VirusTotal API)
  - [ ] Validar OCR
- **Processamento**:
  1. Upload do arquivo
  2. Armazenar em S3
  3. Extrair texto com `pdfplumber`
  4. OCR se necessário (pytesseract)
  5. Enviar para Gemini AI
  6. Estruturar dados em JSON
  7. Salvar no banco
  8. Fazer indexável

#### RF-006.2 - Extração de Dados
- **IA/Gemini**:
  ```
  Prompts:
  - Extrair nome do aluno, matrícula, série
  - Extrair disciplinas e notas
  - Extrair frequência
  - Extrair informações de responsável
  ```
- **Validação**:
  - [ ] Conferir dados extraídos
  - [ ] Permitir edição manual
  - [ ] Armazenar versão original
  - [ ] Manter histórico de extrações
- **Resultado**:
  ```json
  {
    "student_name": "João Silva",
    "enrollment": "2025001",
    "grade": "9º Ano",
    "subjects": [
      {"name": "Português", "grade": 8.5},
      {"name": "Matemática", "grade": 7.0}
    ],
    "attendance": {"total": 100, "present": 95},
    "extracted_at": "2025-10-24T10:30:00Z",
    "confidence": 0.95
  }
  ```

---

### RF-007: Chat e Mensagens

#### RF-007.1 - Chat em Tempo Real
- **Descrição**: Comunicação síncrona entre usuários
- **WebSocket**:
  - [ ] Conexão persistente
  - [ ] Reconexão automática
  - [ ] Mensagens não entregues na fila
- **Funcionalidades**:
  - [ ] Mensagens diretas
  - [ ] Grupos
  - [ ] Compartilhamento de arquivos
  - [ ] Typing indicator (digitando...)
  - [ ] Status de leitura
  - [ ] Reações/Emoji
- **Persistência**:
  - [ ] Histórico completo
  - [ ] Armazenar em MongoDB
  - [ ] Indexar para busca rápida
  - [ ] Manter por 2 anos
- **Notificações**:
  - [ ] Push quando offline
  - [ ] Email se inativo 24h

#### RF-007.2 - Controle de Acesso
- **Regras**:
  - [ ] Aluno pode enviar para: Professor, Orientador, Responsável
  - [ ] Professor pode enviar para: Alunos, Colegas
  - [ ] Responsável pode enviar para: Professores, Orientadores
  - [ ] Admin pode enviar para: Todos
  - [ ] Não há conversa privada entre alunos (segurança)
- **Moderação**:
  - [ ] Admin pode ver todas as conversas
  - [ ] Bloqueio de usuário
  - [ ] Denúncia de mensagem
  - [ ] Remoção de conteúdo impróprio

---

### RF-008: Dashboard de Aluno

#### RF-008.1 - Visão Geral
- **Widgets**:
  - [ ] Métricas rápidas:
    - Média geral
    - Frequência %
    - Ocorrências pendentes
    - Tarefas não entregues
  - [ ] Gráficos:
    - Notas por disciplina
    - Tendência de desempenho
    - Frequência ao longo do tempo
  - [ ] Ações rápidas:
    - Enviar mensagem
    - Ver tarefas
    - Acessar materiais
- **Responsividade**: Mobile-first

#### RF-008.2 - Minhas Notas
- **Visualizar**:
  - [ ] Notas por disciplina
  - [ ] Notas por período
  - [ ] Média geral
  - [ ] Comparação com turma (anônima)
  - [ ] Histórico (últimos 3 anos)
- **Funcionalidades**:
  - [ ] Filtrar por período
  - [ ] Exportar para PDF
  - [ ] Notificação de nota baixa
  - [ ] Ver feedback do professor

#### RF-008.3 - Minha Frequência
- **Exibir**:
  - [ ] Porcentagem geral
  - [ ] Faltas por disciplina
  - [ ] Atrasos
  - [ ] Tendência
  - [ ] Meta (ex: 80%)
- **Alertas**:
  - [ ] Se cair abaixo de 80%
  - [ ] Se 3 faltas injustificadas
  - [ ] Antes de atingir limite legal

---

### RF-009: Dashboard de Professor

#### RF-009.1 - Gerenciar Turmas
- **Visualizar**:
  - [ ] Lista de turmas
  - [ ] Quantidade de alunos
  - [ ] Média da turma
  - [ ] Frequência média
  - [ ] Status (ativa, encerrada)
- **Ações**:
  - [ ] Editar turma
  - [ ] Visualizar alunos
  - [ ] Adicionar/remover alunos
  - [ ] Arquivar turma

#### RF-009.2 - Lançar Notas
- **Interface**:
  - [ ] Tabela editável
  - [ ] Seletor de turma/período
  - [ ] Campos: aluno, disciplina, nota, data
  - [ ] Validação em tempo real
  - [ ] Salvar automático (auto-save)
- **Funcionalidades**:
  - [ ] Importar de planilha Excel
  - [ ] Exportar resultado
  - [ ] Histórico de alterações
  - [ ] Comentário por nota
  - [ ] Visualizar antes de confirmar
- **Auditoria**:
  - [ ] Quem alterou
  - [ ] Quando alterou
  - [ ] Permitir reverter (24h)

#### RF-009.3 - Controle de Frequência
- **Marcar Presença**:
  - [ ] Seletor rápido (Presente/Falta/Atraso)
  - [ ] Salvar por turma
  - [ ] Justificar faltas
  - [ ] Sincronizar offline
- **Visualizar**:
  - [ ] Histórico de frequência
  - [ ] Alertar alunos com baixa frequência
  - [ ] Relatório por período

---

### RF-010: Dashboard de Responsável

#### RF-010.1 - Monitorar Filhos
- **Visualizar por Filho**:
  - [ ] Notas recentes
  - [ ] Frequência
  - [ ] Ocorrências
  - [ ] Próximas provas
  - [ ] Avisos da escola
- **Alertas Críticos**:
  - [ ] Nota vermelha (< 6)
  - [ ] Ocorrência disciplinar
  - [ ] Frequência baixa
  - [ ] Tarefa atrasada
- **Ações**:
  - [ ] Mensagem para professor
  - [ ] Fazer upload de atestado
  - [ ] Justificar falta

#### RF-010.2 - Comunicação
- **Canais**:
  - [ ] Chat direto com professores
  - [ ] Avisos da escola
  - [ ] Documentos (boletim, histórico)
  - [ ] Agendamento de reunião
- **Notificações**:
  - [ ] Imediato para ocorrência
  - [ ] Diário para resumo
  - [ ] Configurável por tipo

---

### RF-011: Relatórios e Analytics

#### RF-011.1 - Relatórios Disponíveis
- **Por Aluno**:
  - [ ] Desempenho acadêmico
  - [ ] Histórico de frequência
  - [ ] Ocorrências
  - [ ] Progresso
- **Por Turma**:
  - [ ] Desempenho geral
  - [ ] Comparação entre períodos
  - [ ] Distribuição de notas
  - [ ] Análise de frequência
- **Por Instituição**:
  - [ ] KPIs principais
  - [ ] Análise de desempenho
  - [ ] Trends
  - [ ] Comparação entre turmas
- **Formatos**:
  - [ ] PDF (ReportLab)
  - [ ] Excel (xlsxwriter)
  - [ ] CSV (pandas)
  - [ ] JSON (API)

#### RF-011.2 - Gráficos Interativos
- **Ferramentas**: Plotly, Chart.js
- **Tipos**:
  - [ ] Linha (trends)
  - [ ] Barra (comparação)
  - [ ] Pizza (distribuição)
  - [ ] Scatter (correlação)
  - [ ] Heatmap (padrões)
- **Funcionalidades**:
  - [ ] Drill-down
  - [ ] Filtros
  - [ ] Exportar como imagem
  - [ ] Compartilhar

#### RF-011.3 - Dashboard Analytics
- **Para Admin**:
  - [ ] Users ativos
  - [ ] Taxa de adoção
  - [ ] Performance do sistema
  - [ ] Custos
- **Para Coordenador**:
  - [ ] Performance por departamento
  - [ ] Distribuição de notas
  - [ ] Trends de frequência
  - [ ] Ocorrências por tipo

---

## 🔒 Requisitos Não-Funcionais

### RNF-001: Segurança

- **Autenticação**: JWT com expiração de 30 minutos
- **Encriptação**: TLS 1.3 em trânsito, AES-256 em repouso
- **Senhas**: Bcrypt com salt (cost factor 12)
- **Validação**: Entrada validada em frontend e backend
- **SQL Injection**: Prepared statements
- **XSS Protection**: HTML sanitization + CSP headers
- **CSRF**: CSRF tokens em forms
- **Rate Limiting**: 100 req/min por IP
- **Audit Trail**: Todas as ações registradas

### RNF-002: Performance

- **Response Time**: p95 < 200ms (relatórios < 5s)
- **Throughput**: 10.000+ req/s
- **Database**: Índices otimizados, particionamento
- **Cache**: Redis para sessions e queries
- **CDN**: Assets estáticos servidos via CloudFront
- **Lazy Loading**: Imagens e componentes

### RNF-003: Escalabilidade

- **Horizontal**: Múltiplas instâncias de API
- **Database**: Read replicas
- **Queue**: Celery para background jobs
- **Caching**: Redis Cluster
- **Message Broker**: Kafka para scale (future)

### RNF-004: Disponibilidade

- **Uptime**: 99.9% SLA
- **Redundância**: Multi-region setup
- **Backup**: Diário com retenção de 30 dias
- **Disaster Recovery**: RTO 15 minutos, RPO 1 hora
- **Health Checks**: Contínuos

### RNF-005: Manutenibilidade

- **Código**: PEP-8, Clean Code principles
- **Testes**: 80%+ coverage (unit + integration)
- **Documentação**: API docs automáticos, comentários
- **Logging**: Estruturado (JSON logs)
- **Monitoring**: Prometheus + Grafana

### RNF-006: Usabilidade

- **UI/UX**: Design System consistente
- **Acessibilidade**: WCAG 2.1 AA
- **Mobile**: Responsive design
- **Performance**: Score Lighthouse > 90
- **Onboarding**: Fluxo intuitivo

### RNF-007: Conformidade

- **LGPD**: Consentimento, direito ao esquecimento, portabilidade
- **GDPR**: DPA, Data Protection Impact Assessment
- **Educacional**: Regulações do MEC
- **Privacidade**: Privacy Policy clara
- **Transparência**: Termos de Serviço

---

## ✅ Critérios de Aceitação

Para cada funcionalidade, os critérios de aceitação incluem:

1. **Funcionalidade**: Feature funciona conforme especificado
2. **Testes**: 100% de cobertura unitária
3. **Performance**: Atende requisitos não-funcionais
4. **Segurança**: Passou security review
5. **Documentação**: API e UX documentadas
6. **Aprovação**: Product owner aprovado

---

**Documento criado em**: 24 de outubro de 2025  
**Versão**: 1.0.0
