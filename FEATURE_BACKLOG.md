# SellBuy.lv v2 — Feature Backlog

> Cross-references each feature to the owning agent context and the deliverable file on disk. Reflects actual state as of `0a549e1` (2026-08-26_00:11). Re-verified against files on disk 2026-08-26 against `git log --oneline -20` (category taxonomy API + listings API + core pages shipped ✅; auth still demo-only; full-text search still ILIKE-based; image upload still a stub). No pending git commit/push beyond this doc update.

## Completed items

Status = ✅ shipped on disk (verified via file inspection + git log through `0a549e1`).

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
| JSONB attribute filters end-to-end (`attr_<name>=`, `attrmin_/attrmax_` params; parameterized SQL against `Listing.attributes`; ancestor-chain schema merge; filter UI on listings page + API support) — verified on disk 2026-08-25 in `app/listings/page.tsx` (`getAttrMatchingIds`, `parseAttrParams`, merged attr fields) and `app/api/listings/route.ts` | 2026-08-25 | agency/backend + frontend-fullstack | `app/listings/page.tsx`, `app/api/listings/route.ts` |
| Client-side demo auth context (`AuthProvider`, localStorage persistence) wired into layout + new-listing page — **demo only**, no server session/provider (see Next Cycle Plan) — verified on disk 2026-08-25 | 2026-08-25 | agency/frontend | `app/lib/auth.tsx`, `app/layout.tsx`, `app/new-listing/page.tsx` |
| Build green: 7/7 pages prerender, `BUILD SUCCESS` in log | 2026-08-24 → 25 | agency/CI | `CONTINUOUS_BUILD.log`, `continuous_build.sh` |
| `prisma/seed.ts` parameterized (ON CONFLICT upsert + `$queryRaw` bindings; static `TRUNCATE` only) | 2026-08-25_02:02 → hardened | agency/backend | `prisma/seed.ts` |
| `.env.example` created (placeholder `DATABASE_URL`) | 2026-08-25 (post-ROADMAP) | agency/devops | `.env.example` |
| `jest.setup.ts` TS1005 (unclosed if-block) fixed | 2026-08-25 (`766f19e`) | agency/testing | `jest.setup.ts` |
| Design/UI skill packs added (emilkowalski/skills, impeccable, taste-skill, ui-pro-max) | 2026-08-24 | agency/frontend | `skills-lock.json`, Hermes config |
| `DESIGN_AUDIT.md` produced (token-layer gap analysis) | 2026-08-25_02:25 (`69e3d17`) | agency/frontend | `DESIGN_AUDIT.md` |
| Jest test suite added (taxonomy API x2, listing CRUD x2, CategoryCard) — Prisma mocked | 2026-08-25_02:02 (testing-reality-checker) | agency/testing | `__tests__/api-categories-tree.test.ts`, `__tests__/api-categories-id.test.ts`, `__tests__/api-listings.test.ts`, `__tests__/api-listings-id.test.ts`, `__tests__/category-card.test.tsx`, `__tests__/mocks/prisma.ts` |
| `continuous_build.sh` hardened; `.gitignore` for local dev scripts | 2026-08-24 | agency/CI | `continuous_build.sh`, `.gitignore` |
| Postgres `db:` service in `docker-compose.yml` (image: postgres:16-alpine, healthcheck, volume, shared network, externalized `${DATABASE_URL}`/`${POSTGRES_PASSWORD}` from `.env`) | 2026-08-25_06:36 | devops-automator | `docker-compose.yml`, `.gitignore` |
| Runtime auth (server-side) — **still demo-only (see Remaining #3)** | 2026-08-25 | agency/frontend | `app/lib/auth.tsx`, `app/auth.tsx` |
| `ltree` extension init script wired to compose (`docker/initdb/01-ltree.sql`) | 2026-08-25 | devops-automator | `docker/initdb/01-ltree.sql`, `docker-compose.yml` |

## Remaining items — re-ranked by user impact vs effort

Re-ranked 2026-08-25 against Latvian-market fit and SS.lv gap analysis: SS.lv's moat is instant full-text search, fast ad posting, and trustworthy presentation — so user-facing marketplace gaps outrank internal ops work of equal size. Impact = value to LV/RU/EN buyers & sellers; Effort = engineering cost to ship. Legend: ✅ done · ⏳ in progress · ◻️ not started — all against actual on-disk state.

| Rank | # | Item | Impact | Effort | Status | Agent | Deliverable file(s) | Notes / gap |
|---|---|---|---|---|---|---|---|---|
| 1 | 8 | Full-text search (Postgres FTS: tsvector index, websearch_to_tsquery, trilingual config, result ranking) | High | Medium | ⏳ | frontend-fullstack + agency/backend | `app/listings/page.tsx`, `app/api/listings/route.ts`, `prisma/migrations/*` | **Updated 2026-08-25:** `q` param parsing and case-insensitive `contains` (ILIKE) on title/description now work end-to-end on disk — but that is substring matching, not full-text search. No tsvector/GIN index, no stemming/ranking. Substring ILIKE will not scale or match SS.lv instant-search quality |
| 2 | 7 | Listing creation flow completed: image upload handling beyond `handleImageUpload` stub, schema validation, draft→publish state machine | High | Medium-High | ⏳ | frontend-fullstack | `app/new-listing/page.tsx`, API routes | upload handler exists as stub; validation/draft state not implemented. Photo-led ads are how SS.lv sellers operate; posting friction directly suppresses supply |
| 3 | 6 | Runtime auth: real server-side sessions (provider config, register/login, verified persistence) | Critical | Medium-High | ⏳ | frontend-fullstack | `app/lib/auth.tsx`, `app/auth.tsx`, `prisma/schema.prisma` | **Updated 2026-08-25:** client-side demo context (`AuthProvider`, localStorage) now exists on disk and is wired into layout + new-listing — but it is demo-only (any email "logs in", no password, no server verification). No NextAuth/session provider/credential hashing present. Still a hard prerequisite for trusted listing authorship |
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

## Next Cycle Plan (prioritized 2026-08-25, verified against on-disk state)

1. **CRITICAL — Runtime auth (P1.6, rank 3).** Replace the demo-only `AuthProvider` (`app/lib/auth.tsx`, localStorage) with real server-side sessions: password hashing, register/login API routes, httpOnly session cookies or NextAuth, `authorId` enforcement on listing creation. Current state lets any visitor claim any identity client-side — this blocks trusted authorship and every downstream feature (messaging, saved searches). Nothing else in the user-facing stack is safe to build on until sessions are real.
2. **HIGH — Full-text search (P1.8, rank 1).** Upgrade from ILIKE substring matching to Postgres FTS: generated `tsvector` column + GIN index on `Listing`, `websearch_to_tsquery` with a trilingual/simple config (LV/RU/EN stemming), ranked results (`ts_rank`), and debounced client input in `components/filters.tsx`. Search is SS.lv's core behavior; current matching misses inflected Latvian/Russian forms.
3. **HIGH — Attribute filters: harden + complete (rank moved up; core shipped ✅).** JSONB facet filtering is verified working end-to-end on disk (`getAttrMatchingIds`/`parseAttrParams` in `app/listings/page.tsx`, matching SQL in `app/api/listings/route.ts`, ancestor-chain schema merge + filter UI). Remaining work: GIN index on `Listing.attributes` for performance, facet counts per category, UI polish/edge cases (invalid attr params), and Jest coverage of the attribute SQL paths.

**Then:** listing-creation completion (image upload beyond stub, draft→publish — rank 2), followed by the low-effort Docker/compose deployment batch (ranks 5–7, 9). Deferred as before: multi-stage Dockerfile hardening, ltree migration hygiene, expanded Jest mutation/upload/auth coverage, CI workflow.
