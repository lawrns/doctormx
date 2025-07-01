#!/bin/bash
# Start Zen MCP Server for DoctorMX

echo "Starting Zen MCP Server for DoctorMX..."

# Navigate to zen-mcp-server directory
cd zen-mcp-server

# Activate virtual environment
source venv/bin/activate

# Load environment variables
if [ -f "../.env.mcp" ]; then
    export $(cat ../.env.mcp | grep -v '^#' | xargs)
fi

# Start the MCP server
python server.py

echo "Zen MCP Server started successfully!"