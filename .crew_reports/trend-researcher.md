# Trend Researcher — Highest-Impact Next Feature Recommendation

**Project:** SellBuy.lv v2 (Latvian marketplace MVP vs SS.lv)
**Source:** `FEATURE_BACKLOG.md` (state as of `0a549e1`, 2026-08-26)
**Recommendation:** #3 (item P1.6) — **Runtime auth: real server-side sessions**

## The pick

Replace the demo-only client-side `AuthProvider` (`app/lib/auth.tsx`, localStorage) with real server-side sessions: password hashing, register/login API routes, httpOnly session cookies (or NextAuth), and `authorId` enforcement on listing creation.

## Why this one (and not search or image upload)

- **It is the only unblocker.** The current state lets any visitor claim any identity purely client-side. Listing authorship, ownership, messaging, saved searches, seller profiles, ratings/trust — every differentiator in the SS.lv-gap strategy (Smart-ID trust layer, Omniva/DPD logistics handoffs, buyer-seller messaging) requires knowing *who* a user actually is. Search quality (rank 1) improves discovery of a catalog; auth makes the marketplace *real*. Without it, shipping more features compounds on a fake identity layer.
- **User impact: Critical.** Sellers won't post inventory under an account that can be spoofed by anyone with DevTools; buyers won't transact with unverified sellers. In a trust-sensitive Baltic market where SS.lv's brand is "established and safe," fake auth is a launch blocker, not polish.
- **Effort: Medium-High but well-bounded.** Client context already exists and is wired into layout + new-listing page, so this is a backend swap (hashing, session cookie, API routes) + enforcement, not greenfield UI. Roughly comparable effort to FTS or image upload.
- **Dependency order.** Backlog's own Next Cycle Plan already flags it as "CRITICAL… nothing else in the user-facing stack is safe to build on until sessions are real." Correct sequencing:
  1. **Auth sessions** ← do now
  2. Image upload / draft→publish posting flow (rank 2) — needs real authorship
  3. Full-text search upgrade ILIKE → Postgres FTS tsvector/GIN, trilingual config (rank 1) — independent of auth, can proceed in parallel if capacity allows
  4. Then Smart-ID verification, logistics integrations — all blocked on #1

## Runner-up

**Full-text search (P1.8)** is the highest *visibility-per-effort* item once auth lands — Latvian/Russian inflection defeats ILIKE substring matching, and instant ranked search is SS.lv's core moat. But it optimizes an existing capability rather than unblocking new ones.

**Do not do next:** Docker/compose batch (ranks 5–9) — trivial effort, but deployment readiness has zero user-facing impact until there's something trustworthy to deploy.

## Bottom line

Ship server-side auth sessions first. It converts the demo into a marketplace, gates all trust/logistics differentiators, and reuses the existing client auth wiring.
