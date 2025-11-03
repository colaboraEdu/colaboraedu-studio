# 🚀 colaboraEDU CLI - Guia de Uso

Interface de linha de comando para gerenciamento do colaboraEDU.

## 📋 Requisitos

- Python 3.12+
- Ambiente virtual ativado
- Dependências instaladas (`pip install -r requirements.txt`)

## 🎯 Comandos Disponíveis

### 1. Criar Super Usuário Administrador

Cria um usuário administrador com acesso total ao sistema.

#### Modo Interativo (Recomendado)

```bash
python manage.py create-superuser
```

O comando irá solicitar interativamente:
- ✉️ Email do administrador
- 🔐 Senha (com confirmação)
- 👤 Primeiro nome
- 👤 Sobrenome
- 🏫 Nome da instituição (opcional)

#### Exemplo de uso interativo:

```bash
$ python manage.py create-superuser

Email do administrador: admin@colaboraedu.com
Senha: ********
Repita a senha: ********
Primeiro nome: Admin
Sobrenome: Sistema
Nome da instituição (opcional): Escola Demo

🚀 Criando super usuário administrador...
============================================================
📚 Criando nova instituição: Escola Demo
✅ Instituição criada: Escola Demo
🔐 Gerando hash seguro da senha...
👤 Criando usuário administrador: Admin Sistema

============================================================
✅ SUPER USUÁRIO CRIADO COM SUCESSO!
============================================================

📋 Detalhes do administrador:
   • ID: 550e8400-e29b-41d4-a716-446655440000
   • Nome: Admin Sistema
   • Email: admin@colaboraedu.com
   • Role: admin
   • Instituição: Escola Demo
   • Status: active

🔑 Credenciais de acesso:
   • Email: admin@colaboraedu.com
   • Senha: ********

🌐 Próximos passos:
   1. Acesse o dashboard em: http://localhost:8004/docs
   2. Faça login com as credenciais criadas
   3. Comece a criar outros usuários do sistema

✨ Pronto para usar o colaboraEDU!
```

#### Modo Não-Interativo (com parâmetros)

```bash
python manage.py create-superuser \
  --email admin@escola.com \
  --password SenhaSegura123! \
  --first-name Admin \
  --last-name Escola \
  --institution-name "Escola Estadual Demo"
```

### 2. Listar Usuários

Lista todos os usuários cadastrados no sistema.

```bash
# Listar todos os usuários
python manage.py list-users

# Filtrar por role
python manage.py list-users --role admin
python manage.py list-users --role professor
python manage.py list-users --role aluno

# Filtrar por instituição
python manage.py list-users --institution 550e8400-e29b-41d4-a716-446655440000
```

#### Exemplo de output:

```
📋 Listando usuários...
================================================================================

Total: 3 usuário(s)

ID: 550e8400-e29b-41d4-a716-446655440000
   Nome: Admin Sistema
   Email: admin@colaboraedu.com
   Role: admin
   Status: active
   Instituição: 123e4567-e89b-12d3-a456-426614174000
   Criado em: 2025-10-24 10:30:00
--------------------------------------------------------------------------------
```

### 3. Listar Instituições

Exibe todas as instituições cadastradas.

```bash
python manage.py list-institutions
```

#### Exemplo de output:

```
🏫 Listando instituições...
================================================================================

Total: 2 instituição(ões)

ID: 123e4567-e89b-12d3-a456-426614174000
   Nome: Escola Demo
   Domínio: escolademo
   Status: Ativa
   Criado em: 2025-10-24 10:30:00
   Usuários: 15
--------------------------------------------------------------------------------
```

### 4. Alterar Senha de Usuário

Altera a senha de um usuário existente.

#### Modo Interativo:

```bash
python manage.py change-password
```

Você será solicitado a:
1. Informar o email do usuário
2. Digitar a nova senha (com confirmação)
3. Confirmar a alteração

#### Exemplo:

```bash
$ python manage.py change-password

Email do usuário: professor@escola.com
Nova senha: ********
Repita a nova senha: ********

🔐 Alterando senha do usuário...
============================================================

Deseja realmente alterar a senha de 'João Silva' (professor@escola.com)? [y/N]: y

🔐 Gerando novo hash da senha...

✅ Senha alterada com sucesso!
   • Usuário: João Silva
   • Email: professor@escola.com
```

### 5. Versão do Sistema

Exibe informações sobre a versão do colaboraEDU.

```bash
python manage.py version
```

#### Output:

```
colaboraEDU API - v1.0.0
Database: sqlite:///./colaboraedu.db
Debug: False
```

## 🎨 Recursos do CLI

### ✨ Recursos Implementados

- **🎨 Interface colorida**: Usa Rich para output formatado e colorido
- **🔐 Segurança**: Senhas são ocultadas durante digitação
- **✅ Validação**: Confirmação de senha e validação de dados
- **🎯 Interativo**: Prompts amigáveis para facilitar o uso
- **📝 Documentação**: Help detalhado em cada comando
- **🛡️ Tratamento de erros**: Mensagens claras de erro
- **🔄 Transações**: Rollback automático em caso de erro

### 🔒 Segurança

- Senhas são hasheadas usando **bcrypt** (via passlib)
- Confirmação obrigatória de senha
- Verificação de unicidade de email
- Transações de banco de dados com rollback

## 📚 Casos de Uso Comuns

### Setup Inicial do Sistema

```bash
# 1. Criar o primeiro administrador
python manage.py create-superuser

# 2. Verificar se foi criado corretamente
python manage.py list-users --role admin

# 3. Listar instituições
python manage.py list-institutions
```

### Gerenciamento de Usuários

```bash
# Listar todos os professores
python manage.py list-users --role professor

# Alterar senha de um professor
python manage.py change-password

# Listar todos os alunos de uma instituição
python manage.py list-users --role aluno --institution <ID_INSTITUICAO>
```

### Recuperação de Acesso

```bash
# Resetar senha de um administrador
python manage.py change-password --email admin@escola.com
```

## 🔧 Troubleshooting

### Erro: "Email já existe"

**Problema**: Tentando criar usuário com email duplicado

**Solução**: Use um email diferente ou altere a senha do usuário existente:
```bash
python manage.py change-password
```

### Erro: "Tabela não encontrada"

**Problema**: Banco de dados não inicializado

**Solução**: Execute as migrações primeiro:
```bash
# Inicie o servidor uma vez para criar as tabelas
uvicorn app.main:app --reload
```

### Erro: "ModuleNotFoundError"

**Problema**: Ambiente virtual não ativado ou dependências não instaladas

**Solução**:
```bash
# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## 🌟 Boas Práticas

1. **Sempre use o modo interativo** para criar super usuários (mais seguro)
2. **Use senhas fortes** (mínimo 8 caracteres, com letras, números e símbolos)
3. **Mantenha backup** dos IDs de instituição para referência
4. **Liste usuários regularmente** para auditoria
5. **Documente** os administradores criados em local seguro

## 🚀 Próximos Passos Após Criar Super Usuário

1. **Acesse o dashboard**:
   - URL: `http://localhost:8004/docs` (Swagger UI)
   - URL: `http://localhost:8004/redoc` (ReDoc)

2. **Faça login via API**:
   ```bash
   curl -X POST "http://localhost:8004/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@escola.com",
       "password": "SuaSenha123!"
     }'
   ```

3. **Obtenha o token JWT** e use nas próximas requisições

4. **Comece a criar outros usuários**:
   - Professores
   - Alunos
   - Coordenadores
   - Bibliotecários
   - Secretários
   - Responsáveis

## 📖 Comandos de Ajuda

```bash
# Ajuda geral
python manage.py --help

# Ajuda de um comando específico
python manage.py create-superuser --help
python manage.py list-users --help
python manage.py change-password --help
```

## 🎯 Auto-Completion

Instale o auto-completion do shell:

```bash
# Bash
python manage.py --install-completion bash

# Zsh
python manage.py --install-completion zsh

# Fish
python manage.py --install-completion fish
```

## 📞 Suporte

Para mais informações, consulte:
- Documentação da API: `http://localhost:8004/docs`
- README principal do projeto
- Especificações técnicas em `02_TECHNICAL_SPECS.md`

---

**Made with ❤️ using FastAPI, Typer, and SQLAlchemy**
