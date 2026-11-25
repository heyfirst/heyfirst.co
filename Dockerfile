# syntax=docker/dockerfile:1
# Bun is pinned here; locally it comes from mise.
ARG BUN_VERSION=1.4.2

FROM oven/bun:${BUN_VERSION}-slim AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# EmDash bakes its configuration into the build (UPLOADS_DIR too). SITE_URL is the FINAL public origin.
# No database setting belongs here: the connection comes from PG* variables at runtime.
ARG SITE_URL
ARG STAGING_ORIGIN=""
ENV SITE_URL=${SITE_URL} STAGING_ORIGIN=${STAGING_ORIGIN} UPLOADS_DIR=/data/uploads SESSION_DIR=/data/sessions
RUN test -n "$SITE_URL" && bun --bun run build

FROM oven/bun:${BUN_VERSION}-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:${BUN_VERSION}-slim
ARG GIT_SHA=unknown
ENV GIT_SHA=${GIT_SHA} NODE_ENV=production HOST=0.0.0.0 PORT=3000 UPLOADS_DIR=/data/uploads
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/.emdash ./.emdash
COPY package.json ./
COPY docker-entrypoint.sh docker-preload.ts ./
COPY scripts/migrate.ts ./scripts/migrate.ts
COPY src/search ./src/search
COPY src/observability ./src/observability
RUN mkdir -p /data/uploads /data/sessions && chown bun:bun /data/uploads /data/sessions && chmod +x docker-entrypoint.sh
USER bun
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
