# Build stage for frontend
FROM node:22-alpine AS builder

# Install git for cloning
RUN apk add --no-cache git

WORKDIR /build

# Clone the main T2AutoTron repository
# ARG before RUN forces cache invalidation when version changes
ARG T2AUTOTRON_VERSION=stable
ARG BUILD_VERSION=2.1.242
RUN echo "Building version ${BUILD_VERSION} from ${T2AUTOTRON_VERSION}" && \
    git clone --depth 1 --branch ${T2AUTOTRON_VERSION} https://github.com/gregtee2/T2AutoTron.git .

# Build frontend
WORKDIR /build/v3_migration/frontend
RUN npm ci
RUN npm run build

# Install backend dependencies (skip postinstall which needs electron-builder)
WORKDIR /build/v3_migration/backend
RUN npm ci --omit=dev --ignore-scripts

# Production stage
FROM node:22-alpine

# Install runtime tools used by the add-on launcher and camera service.
RUN apk add --no-cache bash jq curl ffmpeg

WORKDIR /app

# Copy backend with dependencies
COPY --from=builder /build/v3_migration/backend ./backend/

# Shared calculation modules are required by backend nodes and the shared-logic API.
COPY --from=builder /build/v3_migration/shared ./shared/

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
    io.hass.version="2.1.242"

CMD ["/run.sh"]
