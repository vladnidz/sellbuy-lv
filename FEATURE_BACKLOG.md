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

## Remaining items — re-ranked by user impact vs effort

Re-ranked 2026-08-25 against Latvian-market fit and SS.lv gap analysis: SS.lv's moat is instant full-text search, fast ad posting, and trustworthy presentation — so user-facing marketplace gaps outrank internal ops work of equal size. Impact = value to LV/RU/EN buyers & sellers; Effort = engineering cost to ship. Legend: ✅ done · ⏳ in progress · ◻️ not started — all against actual on-disk state.

| Rank | # | Item | Impact | Effort | Status | Agent | Deliverable file(s) | Notes / gap |
|---|---|---|---|---|---|---|---|---|
| 1 | 8 | Full end-to-end text search (query param parsing, debounce, result scoring) | High | Medium | ⏳ | frontend-fullstack | `app/listings/page.tsx`, `components/filters.tsx` | category-filter wiring done; text-search param handling partial. Search is the #1 SS.lv behavior; trilingual query handling is the biggest buyer-side gap |
| 2 | 7 | Listing creation flow completed: image upload handling beyond `handleImageUpload` stub, schema validation, draft→publish state machine | High | Medium-High | ⏳ | frontend-fullstack | `app/new-listing/page.tsx`, API routes | upload handler exists as stub; validation/draft state not implemented. Photo-led ads are how SS.lv sellers operate; posting friction directly suppresses supply |
| 3 | 6 | Auth flows beyond page-level fixes: provider config, session persistence, register/login | High | Medium | ◻️ | frontend-fullstack | `app/auth.tsx`, `lib/`, `prisma/schema.prisma` | no session provider / persistence present on disk. Hard prerequisite for both #2 (author attachment) and any future saved-searches/messaging features |
| 4 | 10 | UI pass using installed design skills (categories / listings / new-listing pages) | Medium-High | Low-Medium | ◻️ | frontend-fullstack / soft-design | `app/**/*`, `app/globals.css` | DESIGN_AUDIT found `globals.css` lacks shadcn token layer → card/muted vars undefined. Trust-driven market: polished UI is cheap differentiation vs aging SS.lv |
| 5 | 1 | Add Postgres `db:` service to `docker-compose.yml` (image: postgres:16-alpine, healthcheck, volume, shared network) or document external DB | Medium | Low | ◻️ | devops-automator | `docker-compose.yml` | compose still `network_mode: host` + hardcoded `DATABASE_URL`; no `db:` service. Small change that unblocks every other deployment item |
| 6 | 2 | Externalize DB credentials → `${DATABASE_URL}` from secrets/env file; confirm `.env` in `.gitignore` | Medium | Low | ◻️ | devops-automator | `docker-compose.yml`, `.gitignore` | credentials still embedded in compose. Trivial effort, removes launch blocker + security exposure |
| 7 | 3 | Run `prisma migrate deploy` (+ guarded seed) in Docker entrypoint | Medium | Low-Medium | ◻️ | devops-automator | `Dockerfile`, entrypoint script | Dockerfile only runs `prisma generate` + `npm start`; empty/unmigrated DB on first start. Required for a working first boot |
| 8 | 4 | Multi-stage Dockerfile (`npm ci --omit=dev`, Next `output: 'standalone'`, non-root user, `.dockerignore`) | Low-Medium | Medium | ◻️ | devops-automator | `Dockerfile` | currently single-stage, dev-flavored (`npm install`), runs as root; `.dockerignore` exists but unverified. Ops hardening, no direct user impact |
| 9 | 5 | ltree extension enablement in DB image / init script | Medium | Low | ⏳ | devops-automator | `docker-compose.yml`, migration SQL | schema uses `ltree`; runtime extension creation not yet wired for fresh DB boot. Silent failure risk on category tree — pairs with #1 |
| 10 | 12 | ltree migration hygiene review per DEPLOYMENT_READINESS.md recommendations | Low | Low-Medium | ⏳ | agency/backend | `prisma/migrations/*`, `prisma/seed.ts` | seeded via upserts; migration init/cleanup script not yet added. Internal hygiene, no visible user effect |
| 11 | 9 | Expand Jest coverage to listing creation mutations, image-upload path, auth session persistence | Low-Medium | Medium | ◻️ | testing-reality-checker | `__tests__/*` | base suite added; mutation + upload + auth coverage still missing. Protects high-impact flows (#2, #6) indirectly |
| 12 | 11 | CI pipeline: typecheck + lint + build + tests on PRs | Low | Low-Medium | ◻️ | devops-automator / agency/CI | `.github/workflows/*` | no `.github/workflows` present. Developer-facing only; existing `continuous_build.sh` loop already provides a partial gate |

Ranking rationale (SS.lv gap analysis): ranks 1–4 are all user-facing marketplace gaps where SellBuy.lv trails SS.lv today (search depth, posting speed, accounts, visual trust). Ranks 5–9 are deployment-readiness items grouped together because they are small-effort enablers with shared context (one Docker/compose session covers most). Ranks 10–12 are internal quality work deferred because they have near-zero immediate user impact in the Latvian market.

## Next cycle focus

- **Primary:** Ship the top user-facing gap — finish end-to-end text search (P1.8, now rank 1): query param parsing, debounce, and result scoring that behaves sensibly across LV/RU/EN queries. This is the single biggest behavioral gap vs SS.lv for buyers.
- **Secondary:** Complete the listing creation flow (P1.7, rank 2): real image upload, schema validation, draft→publish — plus auth provider + session persistence (P1.6, rank 3), since listing creation needs an attached author. Together these close the seller-side gap vs SS.lv.
- **Sustaining:** In parallel, clear the low-effort deployment blockers as one batch (P0.1 db: service, P0.2 `${DATABASE_URL}` externalization, P0.3 migrate-deploy entrypoint, P0.5 ltree enablement — ranks 5/6/7/9) to move `DEPLOYMENT_READINESS.md` from `NOT ready` toward `ready`. Apply the DESIGN_AUDIT token-layer fix to `globals.css` (P2.10, rank 4) in the same cycle if frontend capacity allows.
- **Deferred:** Multi-stage Dockerfile hardening (P0.4), ltree migration hygiene (P2.12), Jest mutation/upload/auth coverage expansion (P1.9), and CI workflow (P2.11) drop to the back of the queue — valuable, but no direct user-visible impact this cycle.
