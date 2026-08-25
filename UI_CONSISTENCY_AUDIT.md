# UI_CONSISTENCY_AUDIT.md — Pro Max Standards Compliance

**Date:** 2026-08-25 · **Scope:** `app/**/*.tsx`, `components/*.tsx`, `components/ui/*`, `app/globals.css`, `components.json` · **No code changes made**
**Reference standard:** Pro Max dark-glass aesthetic — shadcn semantic tokens, Linear/Stripe minimalist layouts, single glass recipe, fixed type ramp, 4-step spacing scale.
**Companion doc:** `DESIGN_AUDIT.md` (same day). This audit independently re-verified every claim against the current tree; all counts below are fresh greps.

---

## Executive Summary

Component architecture is sound (real shadcn/ui primitives, `cn()` + tailwind-merge everywhere, zero inline styles), but the app is styled **entirely in raw Tailwind palette classes with zero semantic-token consumption** outside `components/ui/`. The token layer in `globals.css` is still the stock Next.js starter (2 vars), so the ~46 semantic classes used inside `components/ui/` (`bg-card`, `bg-primary`, `text-muted-foreground`, …) resolve against **undefined CSS variables**. 325 hardcoded palette-color occurrences across 9 consumer files produce visible drift between routes (nav chrome differs per page, borders alternate slate-700/800/900, headings jump text-3xl→5xl).

**Verdict:** structure ✅ · token foundation ❌ · cross-route consistency ❌ · typography ⚠️ · glass treatment ⚠️ · spacing ✅ (minor)

---

## Verified Findings

### 🔴 P1 — Token layer missing: globals.css is still starter CSS
`app/globals.css` defines only `--background` / `--foreground` (+ Geist font mappings). No tailwind.config exists; Tailwind v4 `@theme inline` maps only background/foreground. Missing: `--primary`, `--secondary`, `--muted`, `--muted-foreground`, `--accent`, `--card`, `--popover`, `--destructive`, `--border`, `--input`, `--ring` and their `@theme inline` color mappings.

Measured impact:
- `components/ui/` consumes **46 semantic color classes** (7× `bg-accent`, 7× `bg-muted`, 4× `bg-primary`, 8× `bg-destructive*`, 3× `bg-popover`, 1× `bg-card`, plus foreground text variants) → all resolve to unset variables. Buttons/badges/dropdowns render unstyled or transparent backgrounds.
- `components.json` says `baseColor: "neutral"`, `cssVariables: true` — never regenerated to match.

**Fix:** hand-port the neutral baseColor shadcn v4 token block into `globals.css`, remapped to the slate-950/900 dark-glass palette; add full `@theme inline` mapping set.

### 🔴 P2 — Zero semantic-token consumption in app code
Grep for `bg-card|bg-primary|text-muted-foreground|…` across `app/` + `components/` (excl. `ui/`): **0 matches**. All theming is raw palette:
- Blue family alone: 27× `text-blue-400`, 11× `bg-blue-600`, 10× `bg-blue-700`, 7× `bg-blue-950`, 6× `border-blue-900/30`, 5× `text-blue-300`, … (~90 blue occurrences)
- Status colors hardcoded: 3× `text-green-400` (active listings), 1× `bg-green-950`/`border-green-700`; errors 1× `bg-red-950`/`ring-red-500`
- Slate neutrals: 10+ steps deep per file (`slate-300`…`slate-950/80`) with per-file subsets that don't match each other.

**Fix:** tokenize accent → `--primary` (blue), status → badge variants (`success`/`warning`), neutrals → `--card`/`--border`/`--muted-*`; sweep all pages.

### 🔴 P3 — Raw `<input>`/`<button>` bypass shadcn in new-listing
- `app/new-listing/page.tsx:280` — native file input, hand-styled `focus:ring-blue-500 focus:border-transparent` (diverges from ui/input's `focus-visible:ring-[3px] ring-*` recipe).
- `app/new-listing/page.tsx:297` — bare image-chip remove button instead of `Button variant="ghost" size="icon"`.

**Fix:** wrap both with shadcn primitives (file input can stay visually custom but should reuse `Input`'s ring/focus tokens once P1 lands).

### 🟠 P4 — Dark mode faked via `prefers-color-scheme`
`globals.css` flips to a light palette under `prefers-color-scheme: light`, but every page hardcodes permanently-dark content (`from-slate-950 via-slate-900 to-indigo-950`, white/blue text on all routes). Light-mode users get light body chrome around dark content — broken hybrid.

**Fix:** commit to always-dark (delete the media query) or implement proper `.dark` class theming end-to-end. Always-dark is cheaper and matches the design intent.

### 🟠 P5 — Typography ramp drifts per route
Verified heading sizes:
| Route | Hero | Section |
|---|---|---|
| home | `text-5xl font-extrabold` | `text-2xl font-bold` |
| about | `text-5xl font-extrabold` | `text-3xl font-bold` ×5 |
| categories | `text-5xl font-extrabold` | `text-2xl font-bold` |
| listing detail | `text-4xl font-extrabold` **and** `text-4xl font-bold` | `text-xl font-bold` |
| new-listing | — | `text-2xl`/`text-3xl` mixed |

No shared heading component; hero weight flips extrabold↔bold at the same size. Additionally: layout.tsx loads Geist (`--font-geist-sans`), but `globals.css` body sets `font-family: Arial` — **Geist is never applied**.

**Fix:** one type ramp mapped to roles (hero `text-5xl extrabold`, section `text-2xl semibold`, card-title `text-lg semibold`); replace Arial with `var(--font-sans)`.

### 🟠 P6 — Glass treatment inconsistent
- `backdrop-blur-xl` appears on only **6 elements** across 5 files (sticky navs, one upload panel, CategoryCard). Listing detail, about, home cards use flat `bg-slate-900/50` without blur.
- Card surface recipes vary: `bg-slate-900` (solid), `/50`, `/40`, `/30`, `bg-black/70`, `bg-slate-950/80` — six different glass opacities with no canonical utility.
- Border recipe drifts between `border-slate-700`, `-800`, `-800/50`, `-700/50` even within one file (listings index uses all of 700/800/950 alphas).

**Fix:** extract `.glass-card` (`bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10` or border-slate-800 equivalent) into globals.css as a component class; apply uniformly including detail/about/categories.

### 🟡 P7 — Spacing: compliant with minor rhythm drift
No arbitrary-value spacing found; standard scale dominates (mb-2/4/6/8, gap-*, px/py on-scale). Only issue: section margins mix `mb-16`(3), `mb-12`(1), `mb-20`(1), `mt-20`(3) between equivalent hero→grid blocks across routes.

**Fix:** normalize section vertical rhythm to mb-12 or mb-16 consistently. Low priority.

---

## What's Already Compliant
- ✅ Real shadcn/ui installed & used heavily (28 usages on listings page, 24 in listings-filters, CVA-based primitives)
- ✅ `cn()` + tailwind-merge throughout; zero inline `style={{}}` in app/components
- ✅ Consistent slate-based visual language (the *values* are right; they're just not tokenized)
- ✅ No arbitrary-value spacing/font-size hacks
- ✅ Standard spacing scale respected

---

## Prioritized Fix List → frontend-developer

| # | Priority | Fix | Files |
|---|----------|-----|-------|
| 1 | 🔴 High | Full shadcn token layer in globals.css (neutral baseColor → slate-950 dark remap) + `@theme inline` mappings; delete starter vars & Arial override (`font-family: var(--font-sans)`) | `app/globals.css` |
| 2 | 🔴 High | Replace raw `<input>`(L280)/`<button>`(L297) with shadcn `Input` / `Button variant="ghost" size="icon"` | `app/new-listing/page.tsx` |
| 3 | 🟠 Med | Tokenize accent/status colors: blue→`--primary`, green/red→badge variants; sweep ~90 blue + 6 green/red occurrences | all pages + filters |
| 4 | 🟠 Med | Dark-mode strategy: remove light media query (recommended, always-dark) | `app/globals.css` |
| 5 | 🟠 Med | Unify type ramp: hero `text-5xl extrabold` everywhere, section `text-2xl semibold`, kill bold/extrabold mixing; consider shared `PageHeading` component | all pages |
| 6 | 🟡 Low | Extract `.glass-card` utility; apply uniformly incl. detail/about/home cards; collapse 6 surface recipes to 1 | `globals.css` + pages |
| 7 | 🟡 Low | Normalize section rhythm to single step (mb-16 recommended) | all pages |

**Sequencing note:** #1 must land first — #2/#3/#6 all depend on tokens existing; doing them before #1 means re-touching the same lines twice.
