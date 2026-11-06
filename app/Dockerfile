# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# build — Vite compiles the SPA to static files; this stage never ships
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# dependencies first, so a source-only change reuses this layer
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Vite inlines VITE_* into the bundle at build time, so these are build args,
# not runtime env. The API itself is reached same-origin through nginx.
ARG VITE_API_BASE=""
ARG VITE_API_SALT="KXXADFDFDF"
ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_API_SALT=$VITE_API_SALT
RUN npm run build

# ---------------------------------------------------------------------------
# runtime — nginx serves the bundle and re-creates the dev proxy rules
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# the base image's CA store can lag behind; the API proxy verifies the
# upstream certificate, so the bundle must be current
RUN apk add --no-cache -u ca-certificates-bundle

# the official entrypoint renders every /etc/nginx/templates/*.template
# through envsubst into /etc/nginx/conf.d at container start, which is how
# API_UPSTREAM stays configurable without rebuilding the image
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY nginx/api-proxy.conf /etc/nginx/snippets/api-proxy.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
# keeps the previous builds' hashed chunks reachable from the asset volume, so
# a tab left open across a deploy never asks for a file that is already gone
COPY nginx/40-assets-retention.sh /docker-entrypoint.d/40-assets-retention.sh
RUN chmod +x /docker-entrypoint.d/40-assets-retention.sh
# route allowlist generated from src/screen-map.js during `npm run build`
COPY --from=build /app/nginx/app-routes.conf /etc/nginx/snippets/app-routes.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Django/DRF lives outside this image; override with -e API_UPSTREAM=...
# (compose sets it from .env). No trailing slash.
ENV API_UPSTREAM=http://host.docker.internal:8000

# optional CoinGecko demo key (free tier); empty keeps the keyless quota, the
# variable still has to exist so envsubst renders the template cleanly
ENV COINGECKO_API_KEY=""

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
