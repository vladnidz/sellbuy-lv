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
| Search + filters wired end-to-end against category tree API (listings page fetches categories + listings in parallel) | 2026-08-24 → refined 02:25 | agency/frontend | `app/listings/page.tsx`, `components/filters.tsx` |
| JSONB attribute filters end-to-end | 2026-08-25 | agency/backend + frontend-fullstack | `app/listings/page.tsx`, `app/api/listings/route.ts` |
| Client-side demo auth context | 2026-08-25 | agency/frontend | `app/lib/auth.tsx`, `app/layout.tsx`, `app/new-listing/page.tsx` |
| Build green | 2026-08-24 → 25 | agency/CI | `CONTINUOUS_BUILD.log`, `continuous_build.sh` |
| `prisma/seed.ts` parameterized | 2026-08-25_02:02 → hardened | agency/backend | `prisma/seed.ts` |
| `.env.example` created | 2026-08-25 | agency/devops | `.env.example` |
| `jest.setup.ts` fixed | 2026-08-25 | agency/testing | `jest.setup.ts` |
| Design/UI skill packs added | 2026-08-24 | agency/frontend | `skills-lock.json` |
| `DESIGN_AUDIT.md` produced | 2026-08-25 | agency/frontend | `DESIGN_AUDIT.md` |
| Jest test suite added | 2026-08-25 | agency/testing | `__tests__/api-*.test.ts` |

## Backlog (Ranked by Impact vs Effort)

| Priority | Feature | Impact | Effort | Status | Agent context | Deliverable file(s) | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Runtime auth: real server-side sessions | Critical | Medium-High | ⏳ | frontend-fullstack | `app/lib/auth.tsx`, `app/auth.tsx`, `prisma/schema.prisma` | Prerequisite for trust and secure authorship. |
| 2 | Listing creation flow: full image/state support | High | Medium-High | ⏳ | frontend-fullstack | `app/new-listing/page.tsx` | Essential for monetization and supply. |
| 3 | Full-text search (Postgres FTS) | High | Medium | ⏳ | frontend-fullstack | `app/listings/page.tsx` | Essential for discoverability. |
| 4 | UI pass: token layer (shadcn vars) | Medium-High | Low-Medium | ◻️ | frontend-fullstack | `app/**/*`, `app/globals.css` | Differentiation vs competition. |
| 5 | Postgres service (docker-compose) | Medium-Low | Low | ◻️ | devops | `docker-compose.yml` | Infrastructure hardening. |
