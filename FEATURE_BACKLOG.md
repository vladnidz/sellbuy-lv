# SellBuy.lv v2 — Feature Backlog

> Cross-references each feature to the owning agent context and the deliverable file on disk. Reflects actual state as of `56a0e27` (2026-08-25_03:21). No git commit/push performed.

## Completed items

Status = ✅ shipped on disk (verified via file inspection + git log through `56a0e27`).

| Feature | Cycle | Agent context | Deliverable file(s) |
|---|---|---|---|
| Category taxonomy API (`/api/categories`, `/api/categories/tree`) + ltree + JSONB attribute schema | 2026-08-25_02:02 (testing-reality-checker) | agency/backend | `app/api/categories/route.ts`, `app/api/categories/tree/route.ts`, `prisma/schema.prisma`, `prisma/migrations/*_migration.sql` |
| Unique constraint on `Category.path` (prevents duplicate import) | 2026-08-24 | agency/backend | `prisma/schema.prisma`, migration SQL |
| Listing model: `description` + `images` fields; API route types fixed; ltree query fixed | 2026-08-24 | agency/backend | `prisma/schema.prisma`, `app/api/listings*/route.ts` |
| `/new-listing` page (shadcn `Select`/`Input`/`Button`, wired to live category tree, TS2304 resolved) | 2026-08-25_02:25 (`69e3d17`) | agency/frontend | `app/new-listing/page.tsx`, `components/ui/*`, `components/filters.tsx` |
| `/about` page (shadcn/ui) | 2026-08-25_02:02 | agency/frontend | `app/about/page.tsx` |
| Listing detail page `/listings/[id]` (shadcn/ui) | 2026-08-24 | agency/frontend | `app/listings/[id]/page.tsx` |
| Search + filters wired end-to-end against category tree API (listings page fetches categories + listings in parallel) | 2026-08-24 → refined 02:25 | agency/frontend | `app/listings/page.tsx`, `components/filters.tsx`, `components/listings-filters.tsx` |
| Auth page TS/lint fixes (Radix UI deps added) | 2026-08-24 | agency/frontend | `app/auth.tsx`, `package.json`/`package-lock.json` |
| `force-dynamic` on categories + database routes (Vercel static-build compat) | 2026-08-24 | agency/backend | `app/categories/**`, `app/api/**` route segments |
| Build green: 7/7 pages prerender, `BUILD SUCCESS` in log | 2026-08-24 → 25 | agency/CI | `CONTINUOUS_BUILD.log`, `continuous_build.sh` |
| `prisma/seed.ts` parameterized (ON CONFLICT upsert + `$queryRaw` bindings; static `TRUNCATE` only) | 2026-08-25_02:02 → hardened | agency/backend | `prisma/seed.ts` |
| `.env.example` created (placeholder `DATABASE_URL`) | 2026-08-25 (post-ROADMAP) | agency/devops | `.env.example` |
| `jest.setup.ts` TS1005 (unclosed if-block) fixed | 2026-08-25 (`766f19e`) | agency/testing | `jest.setup.ts` |
| Design/UI skill packs added (emilkowalski/skills, impeccable, taste-skill, ui-pro-max) | 2026-08-24 | agency/frontend | `skills-lock.json`, Hermes config |
| `DESIGN_AUDIT.md` produced (token-layer gap analysis) | 2026-08-25_02:25 (`69e3d17`) | agency/frontend | `DESIGN_AUDIT.md` |
| Jest test suite added (taxonomy API x2, listing CRUD x2, CategoryCard) — Prisma mocked | 2026-08-25_02:02 (testing-reality-checker) | agency/testing | `__tests__/api-categories-tree.test.ts`, `__tests__/api-categories-id.test.ts`, `__tests__/api-listings.test.ts`, `__tests__/api-listings-id.test.ts`, `__tests__/category-card.test.tsx`, `__tests__/mocks/prisma.ts` |
| `continuous_build.sh` hardened; `.gitignore` for local dev scripts | 2026-08-24 | agency/CI | `continuous_build.sh`, `.gitignore` |

## Remaining items — prioritized (P0–P2)

Legend: ✅ done · ⏳ in progress · ◻️ not started — all against actual on-disk state.

### P0 — Deployment readiness (see DEPLOYMENT_READINESS.md, status: NOT ready)

| # | Item | Status | Agent | Deliverable file(s) | Notes / gap |
|---|---|---|---|---|---|
| 1 | Add Postgres `db:` service to `docker-compose.yml` (image: postgres:16-alpine, healthcheck, volume, shared network) or document external DB | ◻️ | devops-automator | `docker-compose.yml` | compose still `network_mode: host` + hardcoded `DATABASE_URL`; no `db:` service |
| 2 | Externalize DB credentials → `${DATABASE_URL}` from secrets/env file; confirm `.env` in `.gitignore` | ◻️ | devops-automator | `docker-compose.yml`, `.gitignore` | credentials still embedded in compose |
| 3 | Run `prisma migrate deploy` (+ guarded seed) in Docker entrypoint | ◻️ | devops-automator | `Dockerfile`, entrypoint script | Dockerfile only runs `prisma generate` + `npm start`; empty/unmigrated DB on first start |
| 4 | Multi-stage Dockerfile (`npm ci --omit=dev`, Next `output: 'standalone'`, non-root user, `.dockerignore`) | ◻️ | devops-automator | `Dockerfile` | currently single-stage, dev-flavored (`npm install`), runs as root; `.dockerignore` exists but unverified |
| 5 | ltree extension enablement in DB image / init script | ⏳ | devops-automator | `docker-compose.yml`, migration SQL | schema uses `ltree`; runtime extension creation not yet wired for fresh DB boot |

### P1 — Core marketplace functionality

| # | Item | Status | Agent | Deliverable file(s) | Notes / gap |
|---|---|---|---|---|---|
| 6 | Auth flows beyond page-level fixes: provider config, session persistence, register/login | ◻️ | frontend-fullstack | `app/auth.tsx`, `lib/`, `prisma/schema.prisma` | no session provider / persistence present on disk |
| 7 | Listing creation flow completed: image upload handling beyond `handleImageUpload` stub, schema validation, draft→publish state machine | ⏳ | frontend-fullstack | `app/new-listing/page.tsx`, API routes | upload handler exists as stub; validation/draft state not implemented |
| 8 | Full end-to-end text search (query param parsing, debounce, result scoring) | ⏳ | frontend-fullstack | `app/listings/page.tsx`, `components/filters.tsx` | category-filter wiring done; text-search param handling partial |
| 9 | Expand Jest coverage to listing creation mutations, image-upload path, auth session persistence | ◻️ | testing-reality-checker | `__tests__/*` | base suite added; mutation + upload + auth coverage still missing |

### P2 — Polish & ops

| # | Item | Status | Agent | Deliverable file(s) | Notes / gap |
|---|---|---|---|---|---|
| 10 | UI pass using installed design skills (categories / listings / new-listing pages) | ◻️ | frontend-fullstack / soft-design | `app/**/*`, `app/globals.css` | DESIGN_AUDIT found `globals.css` lacks shadcn token layer → card/muted vars undefined |
| 11 | CI pipeline: typecheck + lint + build + tests on PRs | ◻️ | devops-automator / agency/CI | `.github/workflows/*` | no `.github/workflows` present |
| 12 | ltree migration hygiene review per DEPLOYMENT_READINESS.md recommendations | ⏳ | agency/backend | `prisma/migrations/*`, `prisma/seed.ts` | seeded via upserts; migration init/cleanup script not yet added |

## Next cycle focus

- **Primary:** Ship P0 deployment block — add `db:` Postgres service with healthcheck/volume + `initdb` ltree enablement, switch compose to `${DATABASE_URL}`, and add an entrypoint that runs `prisma migrate deploy` (guarded seed) before `npm start`. Goal: turn `DEPLOYMENT_READINESS.md` status from `NOT ready` to `ready`.
- **Secondary:** Implement auth provider + session persistence (P1.6) so listing creation can attach an `author`, and finish the listing creation flow: real image upload + draft→publish (P1.7).
- **Sustaining:** Expand Jest suite toward P1.9 (mutations/uploads/auth) and stand up a CI workflow (P2.11) running the existing build+test loop on PRs. The `continuous_build.sh` + `CONTINUOUS_BUILD.log` loop can be wired into CI as the canonical "green build" gate.
- **Nice-to-have:** Apply the DESIGN_AUDIT token-layer fix to `globals.css` (P2.10) so shadcn primitives render with the intended slate-900 glass aesthetic before a public-facing UI review.
