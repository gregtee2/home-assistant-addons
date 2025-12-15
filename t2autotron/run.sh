#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  T2AutoTron Home Assistant Add-on"
echo "=========================================="

# Read options from Home Assistant (with fallback for local testing)
CONFIG_PATH=/data/options.json
if [ -f "$CONFIG_PATH" ]; then
    LOG_LEVEL=$(jq -r '.log_level // "info"' $CONFIG_PATH)
    
    # Read API keys from add-on configuration
    OPENWEATHERMAP_API_KEY=$(jq -r '.openweathermap_api_key // ""' $CONFIG_PATH)
    AMBIENTWEATHER_API_KEY=$(jq -r '.ambientweather_api_key // ""' $CONFIG_PATH)
    AMBIENTWEATHER_APP_KEY=$(jq -r '.ambientweather_app_key // ""' $CONFIG_PATH)
    TELEGRAM_BOT_TOKEN=$(jq -r '.telegram_bot_token // ""' $CONFIG_PATH)
    TELEGRAM_CHAT_ID=$(jq -r '.telegram_chat_id // ""' $CONFIG_PATH)
    HUE_BRIDGE_IP=$(jq -r '.hue_bridge_ip // ""' $CONFIG_PATH)
    HUE_USERNAME=$(jq -r '.hue_username // ""' $CONFIG_PATH)
else
    echo "Note: Running without Home Assistant options file (local testing mode)"
    LOG_LEVEL="${LOG_LEVEL:-info}"
fi

echo "Log level: $LOG_LEVEL"

# Get Home Assistant details from Supervisor API
if [ -n "$SUPERVISOR_TOKEN" ]; then
    echo "Fetching Home Assistant configuration from Supervisor..."
    echo "[Add-on] SUPERVISOR_TOKEN detected - update notifications disabled"
    
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

# Export API keys (only if not empty)
[ -n "$OPENWEATHERMAP_API_KEY" ] && export OPENWEATHERMAP_API_KEY
[ -n "$AMBIENTWEATHER_API_KEY" ] && export AMBIENTWEATHER_API_KEY
[ -n "$AMBIENTWEATHER_APP_KEY" ] && export AMBIENTWEATHER_APP_KEY
[ -n "$TELEGRAM_BOT_TOKEN" ] && export TELEGRAM_BOT_TOKEN
[ -n "$TELEGRAM_CHAT_ID" ] && export TELEGRAM_CHAT_ID
[ -n "$HUE_BRIDGE_IP" ] && export HUE_BRIDGE_IP
[ -n "$HUE_USERNAME" ] && export HUE_USERNAME

# Create data directory for persistent storage
mkdir -p /data/graphs
mkdir -p /data/crashes
export GRAPH_SAVE_PATH=/data/graphs

# Enable auto-start of backend engine
export ENGINE_AUTOSTART=true

# Load settings from T2AutoTron Settings UI (persisted to /data/.env)
# These override the add-on config options if set
if [ -f /data/.env ]; then
    echo "Loading settings from /data/.env (T2AutoTron Settings UI)"
    set -a
    source /data/.env
    set +a
fi

# Start the server
echo "Starting T2AutoTron server..."
cd /app/backend
exec node src/server.js
