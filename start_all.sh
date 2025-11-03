#!/bin/bash

# Script para iniciar todos os serviços do colaboraEDU
# Autor: colaboraEDU Team
# Data: 2025-10-29

echo "============================================"
echo "    colaboraEDU - Iniciando Sistema"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
BACKEND_DIR="/home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend"
FRONTEND_DIR="/home/suporte/coloboraGoogleStudio/colaboraEDUstudio1"
BACKEND_HOST="192.168.10.178"
BACKEND_PORT="8004"
FRONTEND_HOST="192.168.10.178"
FRONTEND_PORT="3000"

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0 # Porta em uso
    else
        return 1 # Porta livre
    fi
}

# 1. Iniciar Backend
echo -e "${BLUE}🔧 Verificando Backend...${NC}"
if check_port $BACKEND_PORT; then
    echo -e "${YELLOW}⚠️  Backend já está rodando na porta $BACKEND_PORT${NC}"
else
    echo -e "${GREEN}🚀 Iniciando Backend...${NC}"
    cd "$BACKEND_DIR"
    ./start_server.sh
    sleep 3
fi

# Verificar se backend está saudável
echo -e "${BLUE}🏥 Verificando saúde do Backend...${NC}"
HEALTH_CHECK=$(curl -s http://$BACKEND_HOST:$BACKEND_PORT/health 2>&1)
if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend está funcionando!${NC}"
else
    echo -e "${RED}❌ Backend não está respondendo corretamente${NC}"
    exit 1
fi

# 2. Iniciar Frontend
echo ""
echo -e "${BLUE}🔧 Verificando Frontend...${NC}"
if check_port $FRONTEND_PORT; then
    echo -e "${YELLOW}⚠️  Frontend já está rodando na porta $FRONTEND_PORT${NC}"
else
    echo -e "${GREEN}🚀 Iniciando Frontend...${NC}"
    cd "$FRONTEND_DIR"
    
    # Parar processos antigos do Vite
    pkill -f "vite.*$FRONTEND_PORT" 2>/dev/null
    sleep 2
    
    # Iniciar Vite em background
    nohup npm run dev -- --host $FRONTEND_HOST --port $FRONTEND_PORT > /tmp/vite.log 2>&1 &
    VITE_PID=$!
    
    echo -e "${BLUE}⏳ Aguardando Vite inicializar...${NC}"
    sleep 8
fi

# Verificar se frontend está acessível
echo -e "${BLUE}🌐 Verificando Frontend...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$FRONTEND_HOST:$FRONTEND_PORT 2>&1)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend está funcionando!${NC}"
else
    echo -e "${RED}❌ Frontend não está respondendo (Status: $FRONTEND_STATUS)${NC}"
    echo -e "${YELLOW}📋 Verificando logs em /tmp/vite.log${NC}"
    tail -20 /tmp/vite.log
fi

# Resumo
echo ""
echo "============================================"
echo -e "${GREEN}    Sistema Iniciado! 🎉${NC}"
echo "============================================"
echo ""
echo -e "${BLUE}📍 URLs de Acesso:${NC}"
echo -e "   Frontend:  http://$FRONTEND_HOST:$FRONTEND_PORT"
echo -e "   Backend:   http://$BACKEND_HOST:$BACKEND_PORT"
echo -e "   API Docs:  http://$BACKEND_HOST:$BACKEND_PORT/docs"
echo -e "   Health:    http://$BACKEND_HOST:$BACKEND_PORT/health"
echo ""
echo -e "${BLUE}📊 Logs:${NC}"
echo -e "   Frontend:  tail -f /tmp/vite.log"
echo -e "   Backend:   tail -f /tmp/colaboraedu_server.log"
echo ""
echo -e "${BLUE}🛑 Para parar:${NC}"
echo -e "   ./stop_all.sh"
echo ""
echo "============================================"
