# SellBuy.lv v2 — Roadmap

Last updated: 2026-08-25 (from git log through `6774794`, cycle 2026-08-25_02:02).

## Completed this cycle (~Aug 20–25)

### Features
- Category taxonomy API (`/api/categories` + `/api/categories/tree`) with ltree queries and JSONB attribute schema
- `/new-listing` and `/about` pages with shadcn/ui components
- Listing detail page (`/listings/[id]`) with shadcn/ui components
- Listing model extended with `description` and `images`; API route types fixed; ltree query fixed
- Unique constraint on `Category.path` to prevent duplicates
- Design/UI skill packs added to project + Hermes (emilkowalski/skills, impeccable, taste-skill, ui-pro-max)

### Stability / build
- Build is green: 7/7 pages prerender, `BUILD SUCCESS` in CONTINUOUS_BUILD.log
- Fixed TS errors in `CategoryCard.tsx`, `filters.tsx`, `auth.tsx`, listings page
- Fixed lint issues in `auth.tsx`, `new-listing/page.tsx`
- Added Radix UI deps (`@radix-ui/react-select` etc.)
- `force-dynamic` on categories + database routes for Vercel static-build compatibility
- Continuous build loop hardened (`continuous_build.sh`), `.gitignore` for local dev scripts

## Remaining work — next-cycle priorities

### P0 — Deployment readiness (see DEPLOYMENT_READINESS.md, status: NOT ready)
1. Create `.env.example`; remove hardcoded Postgres credentials from compose
2. Add Postgres service to `docker-compose.yml` (healthcheck, volume) or document external DB
3. Run `prisma migrate deploy` (+ guarded seed) in Docker entrypoint
4. Make `prisma/seed.ts` parameterized / injection-safe

### P1 — Core marketplace functionality
5. Search + filters wired end-to-end against category tree API
6. Listing creation flow completed (image upload, validation, draft→publish)
7. Auth flows finished beyond the current auth.tsx fixes (login/register/session persistence)
8. Tests: expand `__tests__` coverage for taxonomy API, listing CRUD, filters

### P2 — Polish & ops
9. Multi-stage Dockerfile (`npm ci --omit=dev`, standalone output, non-root user, `.dockerignore`)
10. ltree migration hygiene review (per readiness doc recommendations)
11. UI pass using newly installed design skills (categories/listings pages)
12. CI pipeline running typecheck/lint/build on PRs
