# STRATEGY_NOTES.md — SellBuy.lv MVP vs SS.lv Gap Analysis

**Date:** 2026-08-25 · **Basis:** code inspection of `app/`, `app/api/`, `prisma/schema.prisma`, `ROADMAP.md`, `DESIGN_AUDIT.md`, `DEPLOYMENT_READINESS.md` + public knowledge of SS.lv feature set.

---

## 1. Gap Analysis: SellBuy.lv MVP vs SS.lv

Legend: ✅ present · 🟡 partial/stubbed · ❌ missing

| Area | SS.lv | SellBuy.lv today | Gap severity |
|---|---|---|---|
| **Category taxonomy** | Deep multi-level tree (~15 top categories, 100s of leaves) with per-category attribute forms | ltree-backed hierarchy + `/api/categories/tree`, JSONB `attributes` schema on Category, trilingual names (nameLv/Ru/En). Strongest area. | 🟢 Low — ahead of a typical MVP; needs seeded data depth |
| **Listing filters** | Per-category dynamic filters (year, mileage, engine for cars; rooms, floor for real estate), city/district, condition, price ranges, saved searches | Global only: `q` (title/description contains), category subtree (`path @>`), min/max price, sort, pagination. **No JSONB-attribute-driven filters, no location/city field at all** (Listing has no city column). | 🔴 High — the JSONB attributes exist but are never used in filtering |
| **Search** | Full-text search w/ suggestions, fuzzy matching | Naive SQL `ILIKE` on title+description; no FTS index, no ranking, no typo tolerance, Latvian diacritics unhandled | 🔴 High |
| **Auth / trust** | Email login, Smart-ID/eParaksts verification badge, seller ratings & reviews, "verified company" profiles, report/fraud flags | No auth implementation at runtime — `components/auth.tsx` fixes only; POST /api/listings takes raw `authorId` from request body (spoofable). User model = email+name only. **No verification, ratings, or reporting anywhere in schema.** | 🔴 Critical — marketplace cannot launch without real auth |
| **Chat / messaging** | Built-in per-listing chat, message notifications | Chat/Message models exist in Prisma but there is **no API route and no UI** for them | 🟠 Medium-High |
| **Logistics / delivery** | Omniva/DPD pickup-point selection integrated into deal flow, shipping cost estimates | Nothing | 🟡 Medium (can be deferred until transactions exist) |
| **Payments / promoted listings** | Paid top-placement, VIP ads, featured rotation | Nothing | 🟡 Deferred (monetization later) |
| **Mobile UX** | Mature native-feeling responsive site + app | Next.js responsive pages; DESIGN_AUDIT shows token layer broken (undefined CSS vars → cards render unset backgrounds) so mobile polish is undermined | 🟠 Medium |
| **Localization** | LV/RU/EN full UI | Data model supports it (trilingual category names); UI i18n routing not wired end-to-end | 🟠 Medium |
| **Listing lifecycle** | Draft/publish/renew/expiry/bump | Single create; no status field, no expiry, images accepted as string array with no upload pipeline | 🔴 High |

### Key structural gaps behind the table
1. `Listing` lacks `city/location`, `status` (draft/active/sold/expired), `attributes Jsonb`, `views`.
2. No auth/session enforcement server-side — any client can post as any user.
3. Chat models orphaned (no routes/UI).
4. Design tokens broken per DESIGN_AUDIT (P1).

---

## 2. Recommended Next Feature: **Real Authentication + Server-side Ownership Enforcement**

(Scoped to next cycle; assumes P0 deployment-readiness items proceed in parallel per ROADMAP.)

### Priority scoring (impact × feasibility ÷ effort, 1–5 each)

| Candidate | Impact | Feasibility | Effort | Score (I×F/E) |
|---|---|---|---|---|
| **Auth + ownership enforcement** | 5 — blocks launch entirely; unlocks chat, saved searches, seller trust | 5 — NextAuth/Auth.js + Postgres already in place; email-password first | 2 — well-trodden path, schema mostly ready | **12.5** |
| JSONB attribute-driven dynamic filters | 4 — core differentiator vs SS.lv parity | 3 — requires filter UI generation from category schema | 3 | 4.0 |
| In-app chat (API + UI over existing models) | 4 | 2 — depends entirely on having real users/sessions | 3 | 2.7 |
| City/location field + geo filter | 3 | 4 | 2 | 6.0 |
| Postgres FTS search | 3 | 4 | 3 | 4.0 |
| Omniva/DPD logistics | 2 | 2 — external integrations, needs transactional flow first | 4 | 1.0 |

**Winner: Auth (score 12.5).** It is a hard prerequisite for every trust/chat/lifecycle feature above, it closes a live security hole (`authorId` spoofing in `POST /api/listings`), and it rides infrastructure that already exists. Geo-filter (6.0) is the best follow-up.

### Why not something flashier
Attribute filters and chat both have higher perceived value but **cannot ship safely before sessions exist**: filters need nothing else, true — but chat needs identities, and any trust feature (Smart-ID later, ratings) needs accounts. Auth converts the prototype into a product.

---

## 3. Implementation Spec — Auth + Ownership Enforcement

**Stack:** Auth.js v5 (`next-auth@beta`) with Credentials provider (email+password, bcrypt via `bcryptjs`) + Prisma adapter groundwork. JWT session strategy (no extra DB round-trip per request). Smart-ID deliberately deferred — add a `verifiedAt DateTime?` + `verificationProvider String?` on `User` now so the badge system can light up later without migration churn.

### Schema changes (single migration)
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  phone         String?
  verifiedAt    DateTime?   // future Smart-ID/eParaksts
  createdAt     DateTime  @default(now())
  // relations unchanged
}
```
Add `@@index([email])` implicit via unique. No Listing changes yet (add `status` in a follow-up migration to keep this one small).

### API surface
- `POST /api/auth/register` — validate email format + password ≥ 8 chars (zod), bcrypt hash (cost 12), create user, return session.
- `POST /api/auth/login` / `/api/auth/logout` — Auth.js handlers; httpOnly, secure, sameSite=lax cookies.
- `GET /api/auth/session` — current user (id, name, email).
- **Harden `POST /api/listings`:** replace body-supplied `authorId` with `auth()` session check; return 401 when absent. Same for `PUT/DELETE /api/listings/[id]` (verify `listing.authorId === session.user.id`).

### UI
- Header: login/register dialog (shadcn `Dialog` + existing `auth.tsx` form work) and user dropdown once signed in.
- `/new-listing`: require session — redirect to login if anonymous.
- Trilingual strings for all new UI copy (LV/RU/EN) consistent with existing locale approach.

### Tests (jest)
- Register/login/logout happy paths + duplicate-email 409 + weak-password 400.
- `POST /api/listings` returns 401 unauthenticated; ignores client-sent `authorId`.
- `DELETE /api/listings/[id]` 403 for non-owner.

### Estimate & risks
~3–5 dev-days. Risks: Auth.js v5 beta API drift (pin exact version); Next.js version here has breaking changes — consult `node_modules/next/dist/docs/` before wiring middleware. Do **not** gate this cycle on Smart-ID integration.

### Acceptance criteria
1. Anonymous users cannot create/edit/delete listings (401/403 verified by tests).
2. Sessions persist across reloads via secure cookies.
3. Build stays green (7/7 prerender) and lint passes.
