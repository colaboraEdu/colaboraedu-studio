#!/bin/bash
# colaboraEDU API Server - Stop Script
# Stops the FastAPI server gracefully

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}    colaboraEDU API - Stop Server${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

PORT="8004"

# Check if server is running
if ! pgrep -f "uvicorn.*${PORT}" > /dev/null; then
    echo -e "${YELLOW}⚠️  No server running on port ${PORT}${NC}"
    exit 0
fi

# Show running process
echo -e "${GREEN}📍 Found running server:${NC}"
ps aux | grep uvicorn | grep ${PORT} | grep -v grep
echo ""

# Stop server
echo -e "${YELLOW}🛑 Stopping server...${NC}"
pkill -f "uvicorn.*${PORT}"

# Wait for graceful shutdown
sleep 2

# Check if stopped
if ! pgrep -f "uvicorn.*${PORT}" > /dev/null; then
    echo -e "${GREEN}✅ Server stopped successfully!${NC}"
else
    echo -e "${RED}⚠️  Server still running, forcing stop...${NC}"
    pkill -9 -f "uvicorn.*${PORT}"
    sleep 1
    
    if ! pgrep -f "uvicorn.*${PORT}" > /dev/null; then
        echo -e "${GREEN}✅ Server force-stopped successfully!${NC}"
    else
        echo -e "${RED}❌ Error: Could not stop server${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Server stopped! 👋${NC}"
echo -e "${GREEN}============================================${NC}"
