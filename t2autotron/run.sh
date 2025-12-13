#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  T2AutoTron Home Assistant Add-on"
echo "=========================================="

# Read options from Home Assistant
CONFIG_PATH=/data/options.json
LOG_LEVEL=$(jq -r '.log_level // "info"' $CONFIG_PATH)

echo "Log level: $LOG_LEVEL"

# Get Home Assistant details from Supervisor API
if [ -n "$SUPERVISOR_TOKEN" ]; then
    echo "Fetching Home Assistant configuration from Supervisor..."
    
    # Get HA URL (internal)
    HA_HOST="http://supervisor/core"
    HA_TOKEN="$SUPERVISOR_TOKEN"
    
    echo "Home Assistant API available via Supervisor"
else
    echo "Warning: Running outside Home Assistant Supervisor"
    HA_HOST="${HA_HOST:-http://homeassistant.local:8123}"
    HA_TOKEN="${HA_TOKEN:-}"
fi

# Export environment variables for the app
export HA_HOST
export HA_TOKEN
export NODE_ENV=production
export VERBOSE_LOGGING=$([ "$LOG_LEVEL" = "debug" ] && echo "true" || echo "false")

# Create data directory for persistent storage
mkdir -p /data/graphs
export GRAPH_SAVE_PATH=/data/graphs

# Start the server
echo "Starting T2AutoTron server..."
cd /app/backend
exec node src/server.js
