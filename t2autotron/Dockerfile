# Build stage for frontend
FROM node:20-alpine AS builder

# Install git for cloning
RUN apk add --no-cache git

WORKDIR /build

# Clone the main T2AutoTron repository (cache bust with date)
ARG T2AUTOTRON_VERSION=stable
ARG CACHE_DATE=2025-12-14d
RUN git clone --depth 1 --branch ${T2AUTOTRON_VERSION} https://github.com/gregtee2/T2AutoTron.git .

# Build frontend
WORKDIR /build/v3_migration/frontend
RUN npm install
RUN npm run build

# Install backend dependencies (skip postinstall which needs electron-builder)
WORKDIR /build/v3_migration/backend
RUN npm install --production --ignore-scripts

# Production stage
FROM node:20-alpine

# Install bash and jq for run.sh
RUN apk add --no-cache bash jq curl

WORKDIR /app

# Copy backend with dependencies
COPY --from=builder /build/v3_migration/backend ./backend/

# Copy built frontend to backend's static folder
COPY --from=builder /build/v3_migration/frontend/dist ./backend/frontend/

# Copy run script from add-on repo
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# Expose the web interface port
EXPOSE 3000

# Labels for Home Assistant
LABEL \
    io.hass.name="T2AutoTron" \
    io.hass.description="Visual node-based smart home automation editor" \
    io.hass.type="addon" \
    io.hass.version="2.1.24"

CMD ["/run.sh"]
