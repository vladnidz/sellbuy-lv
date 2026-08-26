# DESIGN_AUDIT.md — SellBuy.lv vs Pro Max shadcn Standard

**Date:** 2026-08-26 (refresh) · **Scope:** `app/**`, `components/**`, `app/globals.css`, `components/ui/*` · **Read-only — flag only, no source changes**

> ⚠️ This refresh supersedes the 00:20 snapshot. The frontend dev migrated both
> `/listings` pages onto shadcn primitives between 00:20→01:57, so the prior
> "0 imports" claims are **stale**. All counts below were re-verified against
> current source via grep/FS reads.

---

## Executive Summary

shadcn/ui is installed and `components.json` is well-formed (`style: base-nova`,
`cssVariables: true`, `baseColor: neutral`), and **every route now imports real
primitives** except two stragglers. The dealbreaker is the **token layer**:
`app/globals.css` is still the stock Next.js starter — only `--background` /
`--foreground` are defined, so every shadcn semantic class (`bg-card`,
`bg-primary`, `bg-muted`, `ring-foreground`, …) resolves to `var(--…)` on an
undefined variable. Pages paper over this with 312 raw palette classes
(`slate-*/blue-*`), which defeats the token system and is what produces the
Per-Max glassmorphic drift.

**Verdict:** token foundation ❌ · consistency ⚠️ · glassmorphism ⚠️ · consistency ⚠️

---

## 1. shadcn/ui Usage Audit (verified)

### ✅ What's wired up
- `components/ui/`: `button`, `card`, `input`, `select`, `badge`, `skeleton`,
  `dropdown-menu` — all present.
- `components/lib/utils.ts` → `cn = twMerge(clsx(...))` ✅ standard.

### 🟡 Import coverage per route (current)
| Route | shadcn primitives imported |
|---|---|
| `app/page.tsx` | Button, Card, Input |
| `app/listings/page.tsx` | Button, Card, Badge, Input, Select |
| `app/listings/[id]/page.tsx` | Button, Card, Badge |
| `app/listings/loading.tsx` | Skeleton |
| `app/new-listing/page.tsx` | Button, Input, Card, Select |
| `app/categories/page.tsx` | Button, Card, Badge, Input |
| `app/categories/CategoryCard.tsx` | Card, Badge, Button |

### 🔴 Inconsistency: Select imported but a raw `<select>` still lingers
`app/listings/page.tsx` uses shadcn `Select` for category/city/price filters
(lines 419, 442, 466, 490), but **also** renders a native `<select>` at
**line 543** for attribute enum/boolean fields, hand-styled with
`bg-slate-900/60 border-slate-700 focus:border-blue-500/60`. The shadcn Select
was imported (line 16) and never used for this case — dead/primes the wrong one.

### 🔴 Inconsistency: bare primitives in new-listing
`app/new-listing/page.tsx` still hand-rolls where shadcn exists:
- **line 234** — raw `<button>` (AI-autofill chip) instead of
  `Button variant="ghost"`.
- **line 334** — raw `<input type="file">` with `focus:ring-2 focus:ring-blue-500`
  instead of shadcn `Input`.
- **line 351** — raw `<button>` (✕ image-chip remove) instead of
  `Button variant="ghost" size="icon"` / `Badge` action.
- Focus-ring drift: hand-rolled `focus:ring-2 focus:ring-blue-500` diverges
  from the token-based `focus-visible:ring-ring/50` in `components/ui/input.tsx`.

### 🟠 Observation: Button primitive swapped to Base UI
`components/ui/button.tsx:1` imports from `@base-ui/react/button`
(@base-ui/react ^1.7.0 in package.json) — **not** shadcn's default.
This is a deliberate "Pro Max" customization; document it as intentional vs
accidental, and verify it coexists with the radix-backed `ui/select`.

### 🟡 Dead / unused shadcn surface
- `components/ui/dropdown-menu.tsx` — installed, **0 consumers** across `app/`.
- `components/filters.tsx`, `components/filter-select.tsx`, `listings-filters.tsx`,
  `empty-state.tsx` — **not imported by any page** (dead code). Note
  `listings-filters.tsx:36` uses `bg-slate-900/30` with **no** `backdrop-blur`
  (flat), which itself breaks the glass recipe.

---

## 2. Token Layer Audit (globals.css — the root defect)

`app/globals.css` (26 lines) defines only:
```css
:root { --background:#fff; --foreground:#171717 }
@theme inline { --color-background:var(--background); … }
@media (prefers-color-scheme: dark){ :root{--background:#0a0a0a;…} }
body{ background:var(--background); font-family:Arial,… }
```

### 🔴 Missing the entire shadcn neutral token set
`--card`, `--card-foreground`, `--primary`, `--primary-foreground`,
`--secondary`, `--muted`, `--muted-foreground`, `--accent`, `--popover`,
`--border`, `--input`, `--ring`, `--destructive`, `--success` — **none defined**.

### 🔴 Components reference undefined tokens → transparent/unset rendering
- `components/ui/card.tsx` → `bg-card text-card-foreground` (×1 each) — cards
  default transparent; pages rescue them with explicit `bg-slate-900/30` etc.
- `components/ui/button.tsx` → `bg-primary` (×4), `text-primary-foreground` (×2),
  `bg-muted` (×7), `bg-secondary` (×4), `bg-accent` (×7), `ring-foreground` (×3),
  `bg-popover` (×3) — all undefined. The `default` button variant renders
  `var(--primary)` = unset → falls back to no fill until a page overrides it.
- `app/listings/[id]/page.tsx:234` — raw `<Button>` with no className inherits the
  unset primary, so it visually collapses to an unstyled button unless overridden.

### 🔴 Font override
`body { font-family: Aria, Helvetica, sans-serif }` overrides the declared
`--font-sans: var(--font-geist-sans)`. Geist (loaded in layout) never applies.

---

## 3. Pro Max Glassmorphic Consistency Audit (verified)

### 🟡 Recipe drift — 4 distinct "glass" opacity tiers
Inventory of `backdrop-blur` + `bg-*/opacity` combos in use:

| Recipe | Location | blur | note |
|---|---|---|---|
| `bg-slate-950/80` | nav (`page.tsx`, `categories`) | `backdrop-blur-xl` | consistent ✅ |
| `bg-slate-900/30` | `CategoryCard`, `listings-filters.tsx:36` | xl (CardCard) / **none** (filters) | split recipe |
| `bg-slate-900/40` | listings card, `CategoryCard:190` | `backdrop-blur-xl` | close to /30 |
| `bg-slate-900/50` | `empty-state`, new-listing wrapper | sm/xl | mixed blur |
| `bg-slate-900/60` | SelectTrigger, filter-select | `backdrop-blur-sm` | |
| `bg-slate-900/95` | SelectContent | `backdrop-blur-xl` | inner panel, opaque |

- `backdrop-blur-xl` ×8, `backdrop-blur-sm` ×6 — no `backdrop-blur-md`.
- `/30` and `/40` coexist on near-identical card surfaces; `/50` and `/60`
  coexist on near-identical controls. Canonical recipe should collapse these.
- ❌ `bg-white/5` cited in the prior audit — **not present** in current source
  (grep confirms zero `bg-white/…` usages on app/components).

### 🔴 Listing detail is flat — Pro Max exception call-out
`app/listings/[id]/page.tsx` — **0** `backdrop-blur` usages. The hero/detail
surface is a flat gradient with no glass treatment, while the list index cards
next to it are glass. Inconsistent within the same route group.

### 🟡 Border-color drift
Glass surfaces mix `border-slate-800`, `border-slate-700`, `border-slate-800/50`
as their ring line — none tokenized (`--border` undefined). Should be one
`ring-1 ring-foreground/10` style.

---

## 4. Typography Ramp Audit (verified)

| Size token | Count |
|---|---|
| `text-2xl` | 18 |
| `text-3xl` | 7 |
| `text-5xl` | 4 |
| `text-4xl` | 3 |

- Hero: `text-5xl` on `categories`, but `text-4xl`+`text-3xl` stack on
  `listings/[id]` — no shared heading component / role ramp.
- Body sizes mix `text-xs`/`text-sm`/`text-lg` within single views; no
  canonical scale. No `Heading` primitive wired to the Pro Max ramp.

---

## 5. Dark-mode strategy (verified)

`globals.css:15-20` uses `prefers-color-scheme: dark`. But every page hardcodes
dark gradients (`from-slate-950 via-slate-900 to-indigo-950`, 20 occurrences) and
white text regardless of the media query. Result: a `prefers-color-scheme: light`
user gets a white `--background` (light chrome) wrapped around permanently dark
gradient content — the "light mode" is cosmetic chrome only. Either commit to
always-dark (drop the media query) or thread a real `.dark` class end-to-end.

---

## 6. Palette lock-in (verified)

**312** raw `(text|bg|border)-(slate|blue|indigo|emerald|amber|red|green)-[0-9]+`
classes across `app/` + `components/`. Zero consumption of `--primary`/
`--success`/badge variants. Per the audit's P4, a brand/accent change currently
requires editing every route. Status/badge greens (e.g.
`text-emerald-400` in new-listing:250) should move to a `--success` token.

---

## Prioritized Fix List (owner: frontend dev — do not duplicate page edits)

| # | Prio | Fix | Files |
|---|---|---|---|
| 1 | 🔴 High | Add full shadcn neutral token layer (remap to slate-950 dark); delete Arial override & keep one dark strategy | `app/globals.css` |
| 2 | 🔴 High | Replace native `<select>` @ listings:543 with shadcn `Select` (already imported) | `app/listings/page.tsx` |
| 3 | 🔴 High | Replace raw `<button>`/`<input type=file>` in new-listing with shadcn `Button`/`Input` | `app/new-listing/page.tsx` |
| 4 | 🟠 Med | Tokenize accent/status → `--primary`, `--success`, badge/alert variants | `app/globals.css` + pages |
| 5 | 🟠 Med | Extract canonical `.glass-card` (`bg-slate-900/40 backdrop-blur-xl ring-1 ring-foreground/10`) + `.glass-nav`; apply uniformly incl. listing detail | globals + all routes |
| 6 | 🟡 Low | Wire a shared `Heading`/type-ramp component; pick one hero size | all routes |
| 7 | 🟡 Low | Remove dead code: `dropdown-menu.tsx`, `filters.tsx`, `filter-select.tsx`, `listings-filters.tsx`, `empty-state.tsx` | `components/` + tree-shaken imports |

## Compliant / Noteworthy

- ✅ shadcn/ui properly installed; `cn` util standard; responsive classes throughout.
- ✅ No arbitrary spacing values; vertical rhythm uses the 4-step scale (minor drift in mb-8/12/16).
- ✅ `ui/select` correctly backed by `@radix-ui/react-select`.
- 🔎 Button primitive intentionally on `@base-ui/react` (Pro Max customization) — confirm intended.
