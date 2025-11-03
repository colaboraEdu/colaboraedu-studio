#!/bin/bash

# 🎯 Script de Teste da Integração Frontend-Backend
# Testa login, navegação e chamadas de API

echo "═══════════════════════════════════════════════════════════════"
echo "  🧪 TESTE DE INTEGRAÇÃO - colaboraEDU"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se backend está rodando
echo -e "${BLUE}[1/5]${NC} Verificando backend..."
if curl -s http://192.168.10.178:8004/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está rodando!${NC}"
else
    echo -e "${RED}❌ Backend NÃO está rodando!${NC}"
    echo "   Execute: cd backend && ./start_server.sh"
    exit 1
fi

echo ""

# Verificar se frontend está rodando
echo -e "${BLUE}[2/5]${NC} Verificando frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está rodando!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend não está rodando${NC}"
    echo "   Execute: npm run dev"
fi

echo ""

# Testar endpoint de login
echo -e "${BLUE}[3/5]${NC} Testando endpoint de login..."
LOGIN_RESPONSE=$(curl -s -X POST "http://192.168.10.178:8004/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@colaboraedu.com&password=admin123")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Login funcionando!${NC}"
    
    # Extrair token (usando jq se disponível)
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
        echo "   Token: ${TOKEN:0:50}..."
    fi
else
    echo -e "${RED}❌ Erro no login${NC}"
    echo "$LOGIN_RESPONSE"
fi

echo ""

# Testar endpoint de usuários
echo -e "${BLUE}[4/5]${NC} Testando endpoint de usuários..."
if [ -n "$TOKEN" ]; then
    USERS_RESPONSE=$(curl -s -X GET "http://192.168.10.178:8004/api/v1/users" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$USERS_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✅ Endpoint de usuários funcionando!${NC}"
        
        if command -v jq &> /dev/null; then
            USER_COUNT=$(echo "$USERS_RESPONSE" | jq '. | length')
            echo "   Total de usuários: $USER_COUNT"
        fi
    else
        echo -e "${RED}❌ Erro ao buscar usuários${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Sem token para testar${NC}"
fi

echo ""

# Testar WebSocket (apenas conectividade)
echo -e "${BLUE}[5/5]${NC} Verificando WebSocket..."
if curl -s -I http://192.168.10.178:8004/ws/chat 2>&1 | grep -q "426\|101"; then
    echo -e "${GREEN}✅ WebSocket endpoint disponível!${NC}"
else
    echo -e "${YELLOW}⚠️  WebSocket pode não estar disponível${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Instruções finais
echo -e "${GREEN}📋 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Acesse o frontend:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo -e "   ou"
echo -e "   ${BLUE}http://192.168.10.178:3000${NC}"
echo ""
echo "2. Teste o login com:"
echo "   Email: admin@colaboraedu.com"
echo "   Senha: admin123"
echo ""
echo "3. Abra o console do navegador (F12) para ver os logs:"
echo "   - ✅ Login bem-sucedido"
echo "   - 🔌 WebSocket conectado"
echo "   - 👥 Usuários online"
echo ""
echo "4. Navegue pelos dashboards:"
echo "   - Admin Dashboard (16 funcionalidades)"
echo "   - Professor Dashboard (11 funcionalidades)"
echo "   - E outros 6 dashboards..."
echo ""
echo "═══════════════════════════════════════════════════════════════"

exit 0
