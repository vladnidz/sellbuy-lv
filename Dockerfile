#syntax=docker/dockerfile:1.9
# ---- Builder stage: full deps, Prisma generate, Next standalone build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install production + dev deps
COPY package*.json ./
RUN npm ci

# Prisma source for client generation + runtime migrations
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate the Prisma client
RUN npx prisma generate

# Copy remaining source and build
COPY . .
RUN npm run build

# ---- Runtime: slim, non-root, standalone bundle ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S node && adduser -u 1001 -S -G node -s /bin/sh -D node
USER node

# The standalone build output
COPY --from=builder --chown=node:node /app/.next/standalone/  .
COPY --from=builder --chown=node:node /app/.next/static       ./.next/static

# node_modules required by the standalone server (includes prisma client + engine)
COPY --from=builder --chown=node:node /app/node_modules/      /app/node_modules/

# Runtime Prisma resources: migrations + generated client metadata (engine lives in node_modules above)
COPY --from=builder --chown=node:node /app/prisma/migrations ./prisma/migrations
COPY --from=builder --chown=node:node /app/prisma.config.ts  ./

# Custom entrypoint (optional DB migrations + seed)
COPY --from=builder --chown=node:node /app/docker-entrypoint.js ./docker-entrypoint.js

EXPOSE 3000

# Entrypoint runs migrations/seed when the relevant flags are set, then execs the server.
ENTRYPOINT ["node", "docker-entrypoint.js"]
CMD ["node", "server.js"]
