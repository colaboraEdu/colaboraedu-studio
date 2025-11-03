#!/bin/bash
# colaboraEDU API Server - Status Check Script
# Checks the current status of the server

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    colaboraEDU API - Status Check${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

HOST="192.168.10.178"
PORT="8004"
LOG_FILE="/tmp/colaboraedu_server.log"

# Check if server process is running
if pgrep -f "uvicorn.*${PORT}" > /dev/null; then
    echo -e "${GREEN}✅ Server Status: RUNNING${NC}"
    echo ""
    
    # Show process details
    echo -e "${GREEN}📊 Process Information:${NC}"
    ps aux | grep uvicorn | grep ${PORT} | grep -v grep
    echo ""
    
    # Test health endpoint
    echo -e "${GREEN}🏥 Health Check:${NC}"
    HEALTH_RESPONSE=$(curl -s http://${HOST}:${PORT}/health 2>&1)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ API is responding${NC}"
        echo "   Response: ${HEALTH_RESPONSE}"
    else
        echo -e "${RED}   ❌ API is not responding${NC}"
        echo "   Error: ${HEALTH_RESPONSE}"
    fi
    echo ""
    
    # Show access URLs
    echo -e "${GREEN}📍 Access URLs:${NC}"
    echo -e "   API:          http://${HOST}:${PORT}"
    echo -e "   Docs:         http://${HOST}:${PORT}/docs"
    echo -e "   Health:       http://${HOST}:${PORT}/health"
    echo -e "   WebSocket:    ws://${HOST}:${PORT}/ws/chat"
    echo ""
    
    # Show recent logs
    if [ -f "${LOG_FILE}" ]; then
        echo -e "${GREEN}📋 Recent Logs (last 10 lines):${NC}"
        tail -10 ${LOG_FILE}
        echo ""
        echo -e "   Full logs: tail -f ${LOG_FILE}"
    fi
    echo ""
    
    # Network connections
    echo -e "${GREEN}🌐 Active Connections:${NC}"
    CONNECTIONS=$(netstat -an 2>/dev/null | grep ${PORT} | grep ESTABLISHED | wc -l)
    echo -e "   ${CONNECTIONS} active connection(s)"
    echo ""
    
else
    echo -e "${RED}❌ Server Status: NOT RUNNING${NC}"
    echo ""
    echo -e "${YELLOW}💡 To start the server:${NC}"
    echo -e "   ./start_server.sh"
    echo ""
    
    # Check if log file exists
    if [ -f "${LOG_FILE}" ]; then
        echo -e "${YELLOW}📋 Last Log Entries:${NC}"
        tail -20 ${LOG_FILE}
    fi
fi

echo -e "${BLUE}============================================${NC}"
