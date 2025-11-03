# 🔐 Configuração GitHub - Personal Access Token

## 📋 Passo a Passo para Configurar Autenticação

### 1. **Criar Personal Access Token no GitHub**

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configure o token:
   - **Note**: `ColaboraEDU Studio - Local Development`
   - **Expiration**: `90 days` (ou conforme sua preferência)
   - **Scopes**: Marque as seguintes permissões:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)

4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você só verá uma vez!)

### 2. **Configurar Credenciais Localmente**

Execute os seguintes comandos no terminal:

```bash
# Navegar para o diretório do projeto
cd /home/suporte/colaboraEduStudio

# Configurar o helper de credenciais
git config --global credential.helper store

# Fazer o push (será solicitado username e token)
git push -u origin master
```

### 3. **Quando Solicitado:**

- **Username**: `e-docBR`
- **Password**: `[cole o Personal Access Token aqui]`

### 4. **Verificar Configuração**

```bash
# Verificar repositórios remotos
git remote -v

# Verificar status
git status

# Verificar commits
git log --oneline
```

## 🚀 **Comandos Rápidos**

```bash
# Adicionar mudanças
git add .

# Fazer commit
git commit -m "sua mensagem de commit"

# Enviar para GitHub
git push origin master

# Puxar mudanças do GitHub
git pull origin master
```

## 🔧 **Troubleshooting**

### Se o push falhar:
1. Verifique se o token tem as permissões corretas
2. Verifique se o repositório existe no GitHub
3. Tente regenerar o token

### Se as credenciais não forem salvas:
```bash
# Limpar credenciais salvas
git config --global --unset credential.helper
git config --global credential.helper store
```

## 📝 **Notas Importantes**

- ✅ O token é salvo localmente após o primeiro uso
- ✅ Não compartilhe seu token com ninguém
- ✅ O token expira conforme configurado
- ✅ Você pode revogar o token a qualquer momento no GitHub

## 🎯 **Próximos Passos**

Após configurar o token:
1. Execute `git push -u origin master`
2. Crie o arquivo `.env.local` com sua `GEMINI_API_KEY`
3. Execute `npm run dev` para testar localmente
4. Acesse: https://github.com/e-docBR/colaboraEDUstudio

---

**Desenvolvido com ❤️ para colaboraEDU**
