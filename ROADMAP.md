# SellBuy.lv v2 — Roadmap

Last updated: 2026-08-25 (from git log through `56a0e27`, cycle 2026-08-25_03:21).

## Completed this cycle (~Aug 20–25)

### Features
- Category taxonomy API (`/api/categories` + `/api/categories/tree`) with ltree queries and JSONB attribute schema
- `/new-listing` and `/about` pages with shadcn/ui components
- Listing detail page (`/listings/[id]`) with shadcn/ui components
- Listing model extended with `description` and `images`; API route types fixed; ltree query fixed
- Unique constraint on `Category.path` to prevent duplicates
- `new-listing` page wired to live category tree via shadcn `Select` (category fetch resolved, TS2304 fixed)
- Search + filters wired end-to-end against category tree API (`listings/page.tsx` fetches categories + listings; `filters.tsx` renders category options)
- Design/UI skill packs added to project + Hermes (emilkowalski/skills, impeccable, taste-skill, ui-pro-max)
- `DESIGN_AUDIT.md` produced (shadcn/ui token-layer gap analysis)

### Stability / build
- Build is green: 7/7 pages prerender, `BUILD SUCCESS` in CONTINUOUS_BUILD.log
- Fixed TS errors in `CategoryCard.tsx`, `filters.tsx`, `auth.tsx`, listings page
- Fixed lint issues in `auth.tsx`, `new-listing/page.tsx`
- Added Radix UI deps (`@radix-ui/react-select` etc.)
- `force-dynamic` on categories + database routes for Vercel static-build compatibility
- Continuous build loop hardened (`continuous_build.sh`), `.gitignore` for local dev scripts
- `prisma/seed.ts` parameterized (ON CONFLICT upsert + `$queryRaw` bindings, no interpolated user values)
- `.env.example` created (placeholder `DATABASE_URL`)
- `jest.setup.ts` TS1005 (unclosed if-block) fixed
- Jest test suite added: `api-categories-tree`, `api-categories-id`, `api-listings`, `api-listings-id`, `category-card`

## Remaining work — next-cycle priorities

### P0 — Deployment readiness (see DEPLOYMENT_READINESS.md, status: NOT ready)
1. Add Postgres service to `docker-compose.yml` (healthcheck, volume, shared network) or document external DB — compose still uses `network_mode: host` with hardcoded credentials
2. Externalize DB credentials: move `${DATABASE_URL}` out of compose, confirm `.env` is in `.gitignore`
3. Run `prisma migrate deploy` (+ guarded seed) in Docker entrypoint — Dockerfile currently only runs `prisma generate`
4. Harden Dockerfile to multi-stage (`npm ci --omit=dev`, Next standalone output, non-root user, `.dockerignore`)

### P1 — Core marketplace functionality
5. Auth flows finished beyond the current auth.tsx fixes (login/register/session persistence, provider integration)
6. Listing creation flow completed (image upload handling beyond `handleImageUpload` stub, schema validation, draft→publish state machine)
7. Full end-to-end search (query param parsing, debounce, result scoring) — category filter wiring exists, text search still partial

### P2 — Polish & ops
8. ltree migration hygiene review (per readiness doc recommendations)
9. UI pass using newly installed design skills (categories/listings/new-listing pages) — DESIGN_AUDIT identified token-layer gap (`globals.css` missing shadcn token set)
10. CI pipeline (typecheck/lint/build/tests on PRs) — no `.github/workflows` present
11. Expand Jest coverage: listing creation mutations, image-upload path, auth session persistence
