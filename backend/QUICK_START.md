# ⚡ Guia Rápido - Criar Super Usuário

## 📝 Passo a Passo

### 1. Ativar ambiente virtual e acessar o backend

```bash
cd /home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend
source venv/bin/activate
```

### 2. Criar super usuário

```bash
python manage.py create-superuser
```

### 3. Preencher os dados solicitados

O comando irá solicitar:
- ✉️ **Email do administrador**
- 🔐 **Senha** (digitada 2x para confirmação)
- 👤 **Primeiro nome**
- 👤 **Sobrenome**
- 🏫 **Nome da instituição** (opcional)

### Exemplo de uso:

```bash
$ python manage.py create-superuser

Email do administrador: admin@minhaescola.com
Senha: ********
Repita a senha: ********
Primeiro nome: João
Sobrenome: Silva
Nome da instituição (opcional): Escola Municipal

🚀 Criando super usuário administrador...
============================================================
📚 Criando nova instituição: Escola Municipal
✅ Instituição criada: Escola Municipal
🔐 Gerando hash seguro da senha...
👤 Criando usuário administrador: João Silva

============================================================
✅ SUPER USUÁRIO CRIADO COM SUCESSO!
============================================================

📋 Detalhes do administrador:
   • ID: d271b4ee-395a-4f16-aab1-8117a26a609d
   • Nome: João Silva
   • Email: admin@minhaescola.com
   • Role: admin
   • Instituição: Escola Municipal
   • Status: active

🔑 Credenciais de acesso:
   • Email: admin@minhaescola.com
   • Senha: ********

🌐 Próximos passos:
   1. Acesse o dashboard em: http://localhost:8004/docs
   2. Faça login com as credenciais criadas
   3. Comece a criar outros usuários do sistema

✨ Pronto para usar o colaboraEDU!
```

## 🎯 Modo não-interativo (com parâmetros)

Se preferir, pode passar todos os parâmetros diretamente:

```bash
python manage.py create-superuser \
  --email admin@escola.com \
  --password MinhaSenha123 \
  --first-name Admin \
  --last-name Escola \
  --institution-name "Minha Escola"
```

## 📊 Outros comandos úteis

### Listar todos os usuários
```bash
python manage.py list-users
```

### Listar apenas administradores
```bash
python manage.py list-users --role admin
```

### Listar instituições
```bash
python manage.py list-institutions
```

### Alterar senha de um usuário
```bash
python manage.py change-password
```

### Ver versão do sistema
```bash
python manage.py version
```

### Ver ajuda de todos os comandos
```bash
python manage.py --help
```

### Ver ajuda de um comando específico
```bash
python manage.py create-superuser --help
```

## 🔐 Credenciais do Super Usuário de Exemplo

Para testes, já existe um usuário administrador criado:

- **Email**: `admin@colaboraedu.com`
- **Senha**: `admin123` (ou consulte a configuração do sistema)
- **Role**: `admin`

## 🚀 Próximos Passos

1. **Faça login via API**:
   ```bash
   curl -X POST "http://localhost:8004/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@minhaescola.com",
       "password": "MinhaSenha123"
     }'
   ```

2. **Acesse a documentação interativa**:
   - Swagger UI: http://localhost:8004/docs
   - ReDoc: http://localhost:8004/redoc

3. **Comece a criar outros usuários** através da API ou dashboard web

## ⚠️ Importante

- ✅ Use senhas fortes (mínimo 8 caracteres)
- ✅ Guarde as credenciais em local seguro
- ✅ Não compartilhe a senha do administrador
- ✅ Crie usuários específicos para cada função (professor, aluno, etc.)

## 📚 Documentação Completa

Para mais detalhes, consulte o arquivo [README_CLI.md](README_CLI.md)
