#!/bin/bash

# Start Serena MCP Server for DoctorMX project
export PATH="/Users/izvc/.local/bin:$PATH"

echo "Starting Serena MCP Server for DoctorMX..."
echo "Server will be available at: http://localhost:8001"
echo "Project: /Users/izvc/Documents/GitHub/doctormx"
echo ""

cd serena
uv run serena-mcp-server \
  --context ide-assistant \
  --project /Users/izvc/Documents/GitHub/doctormx \
  --transport sse \
  --port 8001 \
  --enable-web-dashboard true \
  --log-level INFO
