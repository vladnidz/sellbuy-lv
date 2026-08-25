# DESIGN_AUDIT.md — SellBuy.lv vs Pro Max shadcn Standard

**Date:** 2026-08-26 · **Scope:** `app/listings/**`, `app/categories/**`, `app/new-listing/**`, `components/ui/*`, `app/globals.css` · **No code changes made — flag only**

---

## Executive Summary

The app has shadcn/ui installed (`components.json`, baseColor `neutral`, `cssVariables: true`) but usage is **inconsistent by route**: `/categories` and `/new-listing` import real primitives, while **both `/listings` pages import zero shadcn components** and hand-roll every control. The token layer in `app/globals.css` is still the stock Next.js starter (only `--background`/`--foreground`), so semantic classes (`bg-card`, `text-muted-foreground`, `ring-*`) resolve against undefined variables. All visual decisions are hardcoded raw Tailwind palette classes (~130+ occurrences across the audited files), producing drift between routes.

**Verdict:** structure ⚠️ · token foundation ❌ · cross-route consistency ❌

---

## Deviations (flag for frontend developer)

### 🔴 P1 — globals.css has no shadcn token layer
`app/globals.css:1-26` — starter CSS only. Missing entire shadcn set: `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--popover`, `--border`, `--input`, `--ring` + `@theme inline` mappings.
- `components/ui/card.tsx` uses `bg-card text-card-foreground`; both variables are **undefined** → cards render transparent/unset.
- `bg-muted/50`, `ring-foreground/10` (CardFooter etc.) equally unresolved.
- `body { font-family: Arial }` (`globals.css:25`) overrides the declared `--font-sans: var(--font-geist-sans)` — Geist never applies despite layout loading it.

### 🔴 P2 — /listings routes bypass shadcn entirely
- `app/listings/page.tsx` — **0 imports from `@components/ui`**. Native `<select>` at line 543 styled by hand (`border-slate-700 bg-slate-900/60 … focus:border-blue-500/60`), hand-rolled price/city/sort inputs at lines 547–589 instead of shadcn `Select`/`Input`.
- `app/listings/[id]/page.tsx` — also 0 ui-component imports; all buttons/cards are bespoke markup. Inconsistent with `/new-listing` + `/categories`, which do use `Button`, `Card`, `Input`, `Select`.

### 🔴 P3 — Raw `<input>` / `<button>` in new-listing
- `app/new-listing/page.tsx:280` — native `<input type="file">` hand-styled instead of shadcn `Input`.
- `app/new-listing/page.tsx:297` — bare `<button>` ("✕" image-chip remove) instead of `Button variant="ghost" size="icon"` or `Badge` action.
- Hand-rolled focus rings (`focus:ring-blue-500 focus:border-transparent`, lines 271/285) diverge from token-based `focus-visible:ring-*` inside `ui/input.tsx`.

### 🟠 P4 — Hardcoded palette classes everywhere, no semantic tokens
~130+ raw palette classes across the five audited files; zero consumption of `--primary`/`--muted-foreground`/etc. Worst offenders:
| File | Top hardcoded colors |
|---|---|
| `app/listings/page.tsx` | slate-900 ×21, slate-700 ×18, slate-800 ×11, blue-500 ×7, blue-400 ×7 |
| `app/categories/CategoryCard.tsx` | blue-500 ×9, slate-800 ×4 |
| `app/new-listing/page.tsx` | slate-900 ×8, slate-700 ×6 |
| `app/listings/[id]/page.tsx` | unique subset incl. blue-950 ×4 (not used on list page) |

A brand/accent change currently requires editing 5+ files. Status/badge greens should be tokenized (`--success` / badge variants).

### 🟠 P5 — Dark mode faked via prefers-color-scheme
`globals.css:15-20` flips to light under `prefers-color-scheme: light`, but every page is permanently dark (`from-slate-950 via-slate-900 to-indigo-950`, white text). Light-mode users get light chrome around dark content. Commit to always-dark (drop the media query) or implement proper `.dark` class theming end-to-end.

### 🟠 P6 — Typography ramp drifts per route
- Hero/section headings: `text-5xl` (`categories/page.tsx`) vs `text-4xl`+`text-3xl` mix (`listings/[id]/page.tsx`) vs `text-2xl` section titles (`listings/page.tsx` ×6).
- Body sizes mix xs/sm/lg inconsistently within single views (e.g. listings index: xs ×4, sm ×11, lg ×2).
- No shared heading component or role-mapped ramp (Pro Max standard expects fixed xs→4xl mapped to roles).

### 🟡 P7 — Glass treatment inconsistent
`backdrop-blur` count: listings index ×8, categories page ×2, CategoryCard ×1, new-listing ×1, **listing detail ×0** (flat gradient). Recipes differ: `bg-slate-900/40`, `bg-slate-900/60`, `bg-slate-950/80`, `bg-white/5`. Should be one canonical utility (e.g. `.glass-card`: `bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10`).

### 🟡 P8 — Spacing mostly fine; minor rhythm drift
Standard scale dominates; no arbitrary values found. Section margins vary mb-8/mb-12/mb-16 between hero/grid blocks across routes — normalize to one 4-step vertical rhythm.

---

## Prioritized Fix List

| # | Priority | Fix | Files |
|---|----------|-----|-------|
| 1 | 🔴 High | Add full shadcn token layer (neutral remapped to slate-950 dark); delete starter vars & Arial override | app/globals.css |
| 2 | 🔴 High | Migrate /listings pages onto shadcn `Select`/`Input`/`Button`/`Card` | app/listings/page.tsx, app/listings/[id]/page.tsx |
| 3 | 🔴 High | Replace raw `<input>`/`<button>` with shadcn primitives | app/new-listing/page.tsx |
| 4 | 🟠 Med | Tokenize accent/status colors → `--primary`, `--success`, badge variants | all audited files |
| 5 | 🟠 Med | Dark-mode strategy: drop light media query OR `.dark` class theming | app/globals.css |
| 6 | 🟠 Med | Unify type ramp (one hero size, consistent body sm/base) | all routes |
| 7 | 🟡 Low | Extract `.glass-card` utility; apply uniformly incl. listing detail | globals.css + pages |
| 8 | 🟡 Low | Normalize section vertical rhythm to mb-8/12/16 | all routes |

## What's Already Compliant
- ✅ shadcn/ui properly installed via components.json; primitives exist in `components/ui/`
- ✅ `/categories` and `/new-listing` already import real primitives (4 each)
- ✅ No arbitrary spacing values; spacing scale largely on-standard
- ✅ Mobile-first responsive classes present throughout
