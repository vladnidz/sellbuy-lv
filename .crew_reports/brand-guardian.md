# Brand Guardian Audit — SellBuy.lv UI Consistency

**Date:** 2026-08-26 · **Auditor:** Brand Guardian subagent · **Baseline standard:** `DESIGN_AUDIT.md` (Pro Max — shadcn tokens, consistent spacing scale, clear typography hierarchy, restrained glassmorphic accents)
**Scope inspected:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/listings/**`, `app/categories/**`, `app/new-listing/page.tsx`, `app/about/page.tsx`, `components/ui/*`, `components/*filters*`
**No code changes made — flag only.**

---

## Executive Summary

The codebase has **partially recovered** since the baseline audit: `/listings`, `/categories`, `/new-listing` and the home page now import real shadcn primitives (`Button`, `Card`, `Input`, `Select`, `Badge`). However, the **token foundation in `app/globals.css` is still the stock Next.js starter** — every `bg-card`, `text-muted-foreground`, `ring-*` semantic class resolves against undefined variables, forcing developers to keep hardcoding slate/blue palette classes (~155 occurrences across audited pages). Residual hand-rolled controls survive in exactly the spots the original audit flagged, typography hierarchy still drifts per route, and the sticky nav is copy-pasted across three routes.

**Verdict:** component adoption ✅ (improved) · token foundation ❌ · cross-route consistency ⚠️

---

## Top 5 Deviations

### 🔴 1. globals.css still has no shadcn token layer — Geist font never applies
**File:** `app/globals.css:1-26`

Still the stock starter: only `--background` / `--foreground` are defined (`:3-6`, flipped under `prefers-color-scheme: dark` at `:15-20`). The entire shadcn set (`--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--popover`, `--border`, `--input`, `--ring`) is missing, so `components/ui/card.tsx`'s `bg-card text-card-foreground`, `bg-muted/50`, etc. render against undefined variables — which is precisely why every page overrides card styling with raw `bg-slate-900/40 …` classes. Additionally, `body { font-family: Arial, Helvetica, sans-serif }` (`globals.css:25`) overrides the `--font-sans: var(--font-geist-sans)` mapping declared at `:11`; `layout.tsx:7-15` loads Geist but it never renders. The light-mode media query also fights the permanently-dark pages (see #5).

**Fix:** Replace `globals.css` with a full neutral-based shadcn token block remapped to the slate-950 dark palette (define all semantic vars + extend the `@theme inline` mappings for each). Delete the Arial fallback on `:25` so `var(--font-sans)` applies. Drop or gate the media query at `:15-20` (see #5).

### 🔴 2. Raw native `<select>` + hand-styled inputs inside /listings filters
**File:** `app/listings/page.tsx:543-589`

Despite importing shadcn `Select` (`page.tsx:9-16`) and using it correctly at `:448`, the city filter is a bare native `<select>` at `:543` styled by hand: `w-full h-10 rounded-md border border-slate-700 bg-slate-900/60 px-3 text-sm text-white backdrop-blur-sm transition-colors focus:border-blue-500/60` (`:547`), and three more hand-styled inputs sit at `:570`, `:580`, `:589` with the same bespoke recipe. This diverges from the shadcn `SelectTrigger` used eight lines up in the same form.

**Fix:** Convert the `:543` `<select>` to the already-imported shadcn `Select`/`SelectTrigger`/`SelectContent`/`SelectItem` pattern (mirror `:448`), and swap the three inputs at `:570/:580/:589` for `<Input />` from `@/components/ui/input`. Remove the duplicated focus/border recipes entirely once tokens (#1) exist.

### 🔴 3. Native `<textarea>`, `<input>` and bare `<button>` in new-listing
**File:** `app/new-listing/page.tsx:271, 285, 297`

The form imports shadcn `Input`/`Select` (`:4-19`) yet hand-rolls: a `<textarea>` at `:271` (`focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`) and an `<input>` at `:285` with the same non-token focus ring, plus a bare `<button>` ("✕" image-chip remove) at `:297`. These `focus:ring-blue-500` recipes contradict both the shadcn `focus-visible:ring-*` convention in `ui/input.tsx` and the `focus:border-blue-500/60` style used on `/listings` — two different focus languages in one app.

**Fix:** Use `<Textarea className="min-h-[120px]" />` (add `ui/textarea.tsx` if absent) and `<Input type="file" />` for the two fields; replace the `:297` remove button with `<Button variant="ghost" size="icon">` (or an `X` icon-button). Let the shared primitive own the focus ring; delete `focus:ring-blue-500` overrides.

### 🟠 4. ~155 hardcoded palette classes; accent color not tokenized
**Files (counts via grep):** `app/listings/page.tsx` ×55, `app/categories/page.tsx` ×24, `app/new-listing/page.tsx` ×28, `app/listings/[id]/page.tsx` ×21, `app/categories/CategoryCard.tsx`, `app/about/page.tsx`

Every surface hardcodes `slate-700/800/900/950` surfaces and a `blue-*` accent (e.g. `text-blue-400` price display at `app/listings/[id]/page.tsx:119`, stats at `about/page.tsx:93-101`, focus rings in #2/#3). Glass surface recipes alone fragment into at least four variants: `bg-slate-900/30` (`categories/page.tsx:125`), `/40` (`CategoryCard.tsx:190`), `/50` (`new-listing/page.tsx:190`), `/60` (`listings/page.tsx:448`). A brand/accent change requires editing 6+ files; the Pro Max standard expects `--primary`, `--card`, `--muted`, `--success` consumption.

**Fix:** After #1 lands, sweep these files replacing `slate-900/x` surfaces → `bg-card` (+ a single `.glass-card` utility for blurred ones: `bg-card/60 backdrop-blur-md ring-1 ring-white/10`), `blue-500/400` accents → `text-primary` / `bg-primary`, and status colors → `Badge variant="success"` (add the variant to `ui/badge.tsx`).

### 🟠 5. Typography hierarchy drifts per route + nav chrome copy-pasted
**Files:** `app/page.tsx:45`, `app/categories/page.tsx:115`, `app/listings/[id]/page.tsx:115`, `app/about/page.tsx:23`, `app/listings/page.tsx:371`, `app/categories/page.tsx:84`, `app/page.tsx:26`

Page-title ramp is inconsistent: home `text-5xl font-extrabold` (`page.tsx:45`), about `text-5xl` (`about/page.tsx:23`), categories `text-4xl sm:text-5xl` (`categories/page.tsx:115`), listing detail only `text-3xl lg:text-4xl` (`[id]/page.tsx:115`) — same-level headings get four treatments. Meanwhile the gradient-heading recipe `bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text` is duplicated verbatim in 3+ files. The sticky navbar markup `border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50` is pasted identically in three routes (`app/page.tsx:26`, `app/categories/page.tsx:84`, `app/listings/page.tsx:371`), and notably `/listings/[id]` appears to have no shared nav/header at all.

**Fix:** Extract a shared `<SiteHeader />` component (one nav implementation, used in root layout so `[id]/page.tsx` inherits it too) and a `<PageTitle>` heading component that pins one hero size (`text-4xl sm:text-5xl`) and owns the gradient treatment. Body copy should standardize on `sm`/`base` roles.

---

## Already Compliant
- ✅ shadcn primitives installed and now imported on all main routes (improvement over baseline)
- ✅ No arbitrary spacing values; section rhythm largely on the standard scale
- ✅ Mobile-first responsive classes throughout
- ✅ Semantic HTML (`<nav aria-label="Pagination">` at `listings/page.tsx:687`)

## Recommended Fix Order
1. Token layer + font fix in `globals.css` (unblocks everything else)
2. Extract `.glass-card` utility + tokenize accent/status colors
3. Finish primitive migration in `listings/page.tsx` filters & `new-listing`
4. Shared `<SiteHeader />` + `<PageTitle>` components
