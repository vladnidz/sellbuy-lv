# DESIGN_AUDIT.md — SellBuy.lv vs Pro Max shadcn Standard

**Date:** 2026-08-25 · **Scope:** `app/**/*.tsx`, `components/*.tsx`, `components/ui/*` · **No code changes made**

---

## Executive Summary

The app **uses real shadcn/ui components** (`button`, `card`, `input`, `select`, `badge`, `dropdown-menu` installed via components.json, base-nova style) and consistently applies the **slate-900 glass aesthetic** in page markup. However, the **token layer is broken**: `app/globals.css` is still the stock Next.js starter CSS with zero shadcn design tokens, so every semantic class the UI primitives rely on (`bg-card`, `text-card-foreground`, `ring-foreground/10`, `bg-muted`) resolves against **undefined variables**. All color/spacing/typography decisions are hardcoded as raw Tailwind palette classes per page, producing drift between routes.

**Verdict:** structure ✅ · token foundation ❌ · cross-page consistency ⚠️

---

## Issues Found

### 🔴 P1 — globals.css has no shadcn token layer
`app/globals.css` defines only `--background` / `--foreground` (starter defaults). Missing the entire shadcn set: `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--popover`, `--border`, `--input`, `--ring`, plus `@theme inline` mappings for each. Consequences:
- `components/ui/card.tsx` renders with `background-color: var(--color-card)` where `--card` is **undefined** → cards fall back to transparent/unset backgrounds.
- `ring-foreground/10`, `bg-muted/50` (CardFooter) are equally unresolved.
- `components.json` declares `baseColor: "neutral"`, `cssVariables: true` — the CSS was never regenerated to match.

**Fix:** re-init the theme (`shadcn init` diff or hand-port the neutral baseColor token block into globals.css) mapping tokens onto the slate-950/900 dark-glass palette the pages assume.

### 🔴 P2 — Raw `<input>` / `<button>` bypass shadcn in new-listing
- `app/new-listing/page.tsx:280` — native `<input type="file">` styled by hand (`bg-slate-900 border-slate-700 rounded-lg px-4 py-3 focus:ring-blue-500`) instead of shadcn `Input`.
- `app/new-listing/page.tsx:297` — bare `<button>` (image-chip remove "✕") instead of shadcn `Button variant="ghost" size="icon"` or `Badge` + action.
- Hand-rolled focus rings (`focus:ring-blue-500`) diverge from the token-based `focus-visible:ring-*` used inside ui/input.tsx.

### 🟠 P3 — Hardcoded palette classes everywhere instead of semantic tokens
Every page styles directly with `slate-*` / `blue-*` / `indigo-*` / `green-*` (~59 occurrences across 8 files). No page consumes `--primary`, `--muted-foreground`, etc., so a brand/accent change requires editing 8+ files. Worst offenders:
- `app/listings/page.tsx` — blue-300…blue-950 (10 steps) + green-400 + indigo
- `app/listings/[id]/page.tsx` — same spread, different subset than the list page (blue-100/300/600/800 present here but not there)
- Status/badge colors (e.g. green-400 for active) should be tokenized as `--success` / badge variants.

### 🟠 P4 — Dark mode is faked via prefers-color-scheme while pages hardcode dark
globals.css flips to light under `prefers-color-scheme: light`, but all page content is permanently dark (`from-slate-950 via-slate-900 to-indigo-950`, white text). Light-mode users get light chrome around dark content. Either commit to always-dark (remove the media query) or implement proper `.dark` class theming.

### 🟠 P5 — Typography scale drifts per route
Hero headings: `text-5xl` (home, about) vs `text-4xl`/`text-3xl` (listing detail). Body sizes mix xs/sm/lg inconsistently; no shared heading component or type ramp. Pro Max standard expects a fixed ramp (xs/sm/base/lg/xl/2xl–4xl mapped to roles). Also: `body { font-family: Arial }` overrides the declared `--font-sans: var(--font-geist-sans)` token — Geist is never applied even though layout loads it.

### 🟡 P6 — Glass treatment is inconsistent
`backdrop-blur` appears on home + listings index only; listing detail, about, categories use flat gradients without blur. Glass card recipe differs: some `bg-white/5`, some `bg-black/70`, some plain `bg-slate-900`. Should be one canonical utility (e.g. `.glass-card`: `bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10`).

### 🟡 P7 — Spacing mostly fine; minor drift
Standard scale (px-4/py-3/gap-6/mb-8…) dominates; no arbitrary spacing values found. Section rhythm varies (mb-16 vs mb-12 vs mb-8) between hero/grid blocks — normalize section margins.

---

## Prioritized Fix List (for frontend-developer)

| # | Priority | Fix | Files |
|---|----------|-----|-------|
| 1 | 🔴 High | Add full shadcn token layer to globals.css (neutral baseColor remapped to slate-950 dark); delete starter vars & Arial override | app/globals.css |
| 2 | 🔴 High | Replace raw `<input>`/`<button>` with shadcn `Input` / `Button` | app/new-listing/page.tsx |
| 3 | 🟠 Med | Tokenize accent/status colors → `--primary` (blue), `--success` (green), badge variants; sweep hardcoded blue/green classes | all pages |
| 4 | 🟠 Med | Decide dark-mode strategy: remove light-mode media query OR add `.dark` class theming end-to-end | globals.css |
| 5 | 🟠 Med | Unify type ramp: one hero size (text-4xl/5xl), consistent body sm/base | all pages |
| 6 | 🟡 Low | Extract `.glass-card` utility; apply uniformly incl. listing detail/about/categories | globals.css + pages |
| 7 | 🟡 Low | Normalize section vertical rhythm to 4-step scale (mb-8/12/16) | all pages |

## What's Already Compliant
- ✅ shadcn/ui properly installed (`components.json`, CVA-based primitives in `components/ui/`)
- ✅ `cn()` + tailwind-merge in use; zero inline `style={{}}` in app/components
- ✅ slate-900/slate-950 glass direction applied consistently as the visual language
- ✅ No arbitrary-value spacing/font-size hacks; standard Tailwind spacing scale respected
