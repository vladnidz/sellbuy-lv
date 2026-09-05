# SellBuy.lv v2 — Roadmap

## Next-cycle Goal: PostgreSQL Full-text Search Implementation

## Done
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
- Deployment readiness (P0 remediation for Docker/compose, env config, ltree)

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

### P1 — Full-text Search
- Replace ILIKE-based search with PostgreSQL full-text search index
- Implement search ranking/weighting for listings

### P2 — Image Handling
- Implement proper image upload/processing (replacing current stub)
