# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Dependencies (all, for the build)
# =============================================================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

# Optional deps stay in: they carry sharp's musl binary (@img/sharp-linuxmusl-*).
RUN npm ci --ignore-scripts

# =============================================================================
# Stage 2: Production dependencies (for the Payload CLI: migrate, seed, create-super-admin)
# =============================================================================
FROM node:22-alpine AS prod-deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# =============================================================================
# Stage 3: Builder
# =============================================================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No DATABASE_URL or PAYLOAD_SECRET here: the build must not need a database.
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =============================================================================
# Stage 4: Runner (Production)
# =============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# /app and /app/cli are writable so local-disk media (no GCS_BUCKET) can create ./media.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/cli && chown nextjs:nodejs /app /app/cli

# The server: Next's standalone output.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# The Payload CLI and one-off scripts, which run from TypeScript sources via payload's tsx loader.
# Standalone output does not include the CLI, so it gets its own production node_modules.
# Jobs run e.g. `npm run migrate` with workingDir /app/cli (see README in the report).
WORKDIR /app/cli
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/tsconfig.json ./
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/seed ./seed
WORKDIR /app

USER nextjs

EXPOSE 3000

# Cheap and DB-free: answers {"user":null} without a token. 127.0.0.1, as alpine resolves localhost to ::1.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/users/me || exit 1

CMD ["node", "server.js"]
