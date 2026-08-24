# SellBuy.lv v2 — Deployment Readiness Checklist

Review date: 2026-08-25. Scope: Docker/compose, env config vs `prisma/schema.prisma`, ltree enablement. Nothing was deployed.

## Status: NOT deployment-ready

### Blockers
- [ ] **No `.env.example`** — only a local `.env` exists. Create `.env.example` with at least:
  ```dotenv
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
  ```
  Schema requires only `DATABASE_URL` today; add placeholders for any future auth/upload keys.
- [ ] **No Postgres service in `docker-compose.yml`** — the app points at `localhost:5432` with `network_mode: host`. Fine on a single Pi host, but not portable; add a `db:` service (with `image: postgres:16-alpine`, healthcheck, volume, and shared network) or document the external DB requirement.
- [ ] **Hardcoded credentials in compose + committed `.env` risk**: compose embeds `postgresql://postgres:***@localhost...` directly. Move to `${DATABASE_URL}` from an env file / secrets, and confirm `.env` is in `.gitignore`.
- [ ] **Migrations are never run in Docker** — Dockerfile builds but nothing runs `prisma migrate deploy`; the app will start against an empty/unmigrated database. Add an entrypoint (`npx prisma migrate deploy && npm run seed` guarded by a flag) or a deploy step.
- [ ] **Seed is not idempotent-safe in structure & uses string interpolation** — `prisma/seed.ts` uses `$executeRawUnsafe` with interpolated Latvian names (works now, but injection-prone). Prefer parameterized queries or Prisma model API with `path` cast via raw where needed.

### Non-blockers / recommended
- [ ] **Dockerfile is single-stage and dev-flavored**: `npm install` instead of `npm ci`, no multi-stage build, no standalone Next output, runs as root. Recommend multi-stage with `npm ci --omit=dev`, `next.config.ts` → `output: 'standalone'`, non-root user, `.dockerignore` (currently missing).
- [ ] **ltree extension** — ✅ covered: migration `prisma/migrations/20260817184448_init/migration.sql` starts with `CREATE EXTENSION IF NOT EXISTS "ltree";`, schema declares `extensions = [ltree()]` under `previewFeatures = ["postgresqlExtensions"]`, GIST index present. Verify the deploy DB role has `CREATE EXTENSION` privilege (superuser/rds extension grant), otherwise migrate fails.
- [ ] **Prisma client generation duplicated**: both Dockerfile (`RUN npx prisma generate`) and build script (`prisma generate && next build`) do it — harmless, but pick one.
- [ ] **No Vercel config** (`vercel.json`) and no CI pipeline; if Vercel is the target, set `DATABASE_URL` in project env vars and ensure the Postgres provider allows extensions (Neon/Supabase do).
- [ ] **Healthcheck/readiness probe** absent for the container.

## Verified OK
- `prisma/schema.prisma`: ltree via `Unsupported("ltree")` + GIST index, correct datasource config.
- Migration enables ltree before creating tables; seed inserts 11 Latvian root categories as `::ltree` with `ON CONFLICT DO NOTHING`.
- `package.json` has `seed` script + prisma seed config; `tsx` in devDependencies.
