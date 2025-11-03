#!/bin/bash

# Script para parar todos os serviços do colaboraEDU
# Autor: colaboraEDU Team
# Data: 2025-10-29

echo "============================================"
echo "    colaboraEDU - Parando Sistema"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_DIR="/home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend"

# 1. Parar Frontend
echo -e "${BLUE}🛑 Parando Frontend...${NC}"
pkill -f "vite.*192.168.10.178" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend parado${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum processo Frontend encontrado${NC}"
fi

# 2. Parar Backend
echo -e "${BLUE}🛑 Parando Backend...${NC}"
cd "$BACKEND_DIR"
./stop_server.sh

echo ""
echo "============================================"
echo -e "${GREEN}    Sistema Parado! ✅${NC}"
echo "============================================"
echo ""
