# SellBuy.lv v2 — Deployment Readiness Checklist

Review date: 2026-08-25 (P0 remediation pass). Scope: Docker/compose, Dockerfile,
entrypoint/migrations, env config vs `prisma/schema.prisma`, ltree enablement.
Nothing was deployed.

## Status: READY for containerized deploy (one caveat)

All P0 blockers below have been remediated and verified on disk:

- `docker compose config` validates (with required env vars supplied).
- `npm run build` compiles successfully but **fails TypeScript type-check** in
  `app/api/categories/route.ts` (`path` not on the generated Prisma
  `Category` type / no `create` delegate) — see Caveat. This is an application/
  schema issue outside the Docker config scope.

### Blockers — all resolved ✅

- [x] **No `.env.example`** → `.env.example` created documenting ALL required
      vars used by the codebase (`DATABASE_URL`, plus `POSTGRES_USER`,
      `POSTGRES_PASSWORD`, `POSTGRES_DB`, `RUN_MIGRATIONS`, `RUN_SEED`).
      Code audit confirms only `DATABASE_URL` / `NODE_ENV` / `SEED_RESET` are
      read at runtime; no undocumented secrets required.
- [x] **Postgres service in compose** → `db:` service present:
      `postgres:16-alpine`, healthcheck (`pg_isready`, 5s interval ×10),
      named volume `pgdata`, shared `sellbuy` network, `depends_on:
      service_healthy` on the app. App publishes `3000:3000`; no
      `network_mode: host`.
- [x] **Hardcoded credentials** → compose uses `${POSTGRES_PASSWORD:?...}` and
      `${DATABASE_URL:?...}` from `.env` (fails fast when unset).
      `.gitignore` contains `.env*`; `git ls-files` confirms no `.env` is
      tracked. `.dockerignore` excludes `.env*` so secrets never enter the image.
- [x] **Migrations never run in Docker** → `docker-entrypoint.js` runs
      `npx prisma migrate deploy` (unless `RUN_MIGRATIONS=false`) and a guarded
      optional seed (`RUN_SEED=true`), then execs `node server.js`. Wired as the
      image ENTRYPOINT.
- [x] **Seed string interpolation** → `prisma/seed.ts` uses the tagged
      `$executeRaw` form (parameterized), never `$executeRawUnsafe`.

### Non-blockers — resolved ✅

- [x] **Dockerfile multi-stage**: builder stage (`npm ci`, full deps,
      `prisma generate`, Next standalone build via `output: "standalone"` in
      `next.config.ts`) → slim runner stage, non-root `node` user (uid/gid
      1001), copies only standalone bundle + static + node_modules +
      migrations + entrypoint. `.dockerignore` exists and excludes
      node_modules/.next/secrets while keeping `docker-entrypoint.js`.
- [x] **ltree extension** → double coverage: (a)
      `prisma/migrations/20260817184448_init/migration.sql` creates it
      idempotently during `migrate deploy`; (b) new
      `docker/initdb/01-ltree.sql` is mounted into
      `/docker-entrypoint-initdb.d` so fresh volumes get it at init time too.

### Verification performed

| Check | Result |
|---|---|
| `docker compose config` (with dummy env) | valid |
| `.env` tracked by git | not tracked ✅ |
| Seed raw-query safety | parameterized ✅ |
| `npm run build` | compiled OK; TS type-check FAILS (pre-existing, see below) |

---

## Review pass 2 — 2026-08-25 (DevOps Automator: deployment readiness)

Scope re-checked on disk: `Dockerfile`, `docker-compose.yml`,
`docker-entrypoint.js`, `.env.example` vs `.env` (values not printed),
migration strategy, and `npx tsc --noEmit`. Nothing deployed, nothing pushed.

### Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ passes, exit 0 |
| Env var audit (runtime reads) | only `DATABASE_URL`, `NODE_ENV` (app), `RUN_MIGRATIONS`, `RUN_SEED` (entrypoint), `SEED_RESET` (seed) — all now documented in `.env.example` ✅ |
| Secrets in `.env` vs `.env.example` | no secret values echoed; `.env` gitignored & dockerignored ✅ |
| Compose wiring | db healthcheck + `depends_on: service_healthy`; required vars use `${VAR:?...}` fail-fast ✅ |

### Findings & resolutions this pass

1. **[Fixed] `SEED_RESET` undocumented** → added to `.env.example`
   (commented out by default; destructive TRUNCATE is opt-in via
   `prisma/seed.ts`).
2. **[Resolved] Stale TS caveat below** → `app/api/categories/route.ts` has
   been rewritten to raw SQL (`Prisma.sql`) with an explicit local `path`
   type; the previous TS2353/TS2339 errors are gone and `npx tsc --noEmit`
   is green.
3. **[OK] Migration strategy sane** → entrypoint runs
   `npx prisma migrate deploy` (idempotent, applied-only) before server start,
   guarded by `RUN_MIGRATIONS=false`; seed separate (`RUN_SEED=true`);
   ltree covered both by init migration and `docker/initdb/01-ltree.sql`.
   Non-root runtime user, standalone Next build, secrets excluded from image.

### Remaining gaps (non-blocking, pre-deploy)

- No container smoke test performed here (`docker compose up` + health probe)
  — recommend one dry-run before first real deploy.
- No app-level healthcheck defined for the `sellbuy` service in compose;
  consider adding one once a `/api/health` endpoint exists.

### ⚠️ Caveat / remaining work (application-side, not infra) — RESOLVED

The TS2353/TS2339 errors previously reported here no longer reproduce;
`app/api/categories/route.ts` now uses raw SQL and `npx tsc --noEmit`
passes (exit 0). Kept for history:

`npm run build` fails type-checking:

```
app/api/categories/route.ts(205,29): TS2353 'path' does not exist in CategorySelect
app/api/categories/route.ts(215,24): TS2339 Property 'path' does not exist ...
app/api/categories/route.ts(228,46): TS2339 Property 'create' does not exist on CategoryDelegate
```

The Prisma client appears out of sync with the expected `Category.path`
field (schema/migration mismatch or stale generation). Fix belongs to the
backend/schema owner: add `path ltree` mapping to `prisma/schema.prisma`
(or regenerate the client) and re-run `npx prisma generate && npm run build`.
Until that lands, treat the repo as **not shippable end-to-end** despite the
Docker config being correct.
