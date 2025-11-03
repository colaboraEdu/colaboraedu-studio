#!/bin/bash
# colaboraEDU API Server - Start Script
# Starts the FastAPI server on network IP for local network access

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}    colaboraEDU API - Network Server${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Configuration
HOST="192.168.10.178"
PORT="8004"
PROJECT_DIR="/home/suporte/coloboraGoogleStudio/colaboraEDUstudio1/backend"
LOG_FILE="/tmp/colaboraedu_server.log"

# Check if already running
if pgrep -f "uvicorn.*${PORT}" > /dev/null; then
    echo -e "${YELLOW}⚠️  Server is already running on port ${PORT}${NC}"
    echo -e "${YELLOW}   Use ./stop_server.sh to stop it first${NC}"
    echo ""
    ps aux | grep uvicorn | grep ${PORT} | grep -v grep
    exit 1
fi

# Navigate to project directory
cd ${PROJECT_DIR} || {
    echo -e "${RED}❌ Error: Project directory not found${NC}"
    exit 1
}

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo -e "${RED}❌ Error: Virtual environment not found${NC}"
    exit 1
fi

# Start server
echo -e "${GREEN}🚀 Starting colaboraEDU API server...${NC}"
echo -e "   Host: ${HOST}"
echo -e "   Port: ${PORT}"
echo -e "   Log:  ${LOG_FILE}"
echo ""

nohup uvicorn app.main:app \
    --host ${HOST} \
    --port ${PORT} \
    --reload \
    > ${LOG_FILE} 2>&1 &

SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if pgrep -f "uvicorn.*${PORT}" > /dev/null; then
    echo -e "${GREEN}✅ Server started successfully!${NC}"
    echo -e "   PID: ${SERVER_PID}"
    echo ""
    echo -e "${GREEN}📍 Access URLs:${NC}"
    echo -e "   API:          http://${HOST}:${PORT}"
    echo -e "   Docs:         http://${HOST}:${PORT}/docs"
    echo -e "   Health:       http://${HOST}:${PORT}/health"
    echo -e "   WebSocket:    ws://${HOST}:${PORT}/ws/chat"
    echo ""
    echo -e "${GREEN}📊 Monitoring:${NC}"
    echo -e "   View logs:    tail -f ${LOG_FILE}"
    echo -e "   Check status: curl http://${HOST}:${PORT}/health"
    echo ""
    echo -e "${GREEN}🛑 To stop:${NC}"
    echo -e "   Run: ./stop_server.sh"
    echo -e "   Or:  pkill -f 'uvicorn.*${PORT}'"
    echo ""
else
    echo -e "${RED}❌ Error: Server failed to start${NC}"
    echo -e "${RED}   Check logs: tail -50 ${LOG_FILE}${NC}"
    exit 1
fi

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Server is running! 🎉${NC}"
echo -e "${GREEN}============================================${NC}"
