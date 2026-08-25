# NEXT_FEATURE_RECOMMENDATION.md — Highest-Impact Feature for the Next SellBuy.lv Cycle

**Date:** 2026-08-25 · **Author:** Trend Researcher (subagent)
**Inputs:** STRATEGY_NOTES.md (SS.lv gap analysis), ROADMAP.md next-cycle priorities, FEATURE_BACKLOG.md re-ranking.

---

## The Pick: 🏆 Runtime Authentication (real login/session + server-derived authorId)

**One-liner:** Implement real auth end-to-end — email+password (or magic-link) registration/login, persistent sessions (JWT or NextAuth), and replace the spoofable `authorId` in `POST /api/listings` with a server-side identity derived from the session token. Every listing mutation must be attributed to an authenticated user.

### Why this wins

1. **It's the only Critical-severity gap in the analysis.** STRATEGY_NOTES flags auth as 🔴 Critical with the explicit note that *"marketplace cannot launch without real auth."* Everything else is High/Medium. A marketplace where anyone can post listings under anyone else's name has no sellers, no accountability, and no legal standing for takedowns — it is unlaunchable in its current state.
2. **Security, not just features.** `POST /api/listings` accepting a raw client-supplied `authorId` is an active spoofing vulnerability. This is not "parity with SS.lv" — it's table stakes and a liability. No other backlog item is a vulnerability.
3. **It is the dependency root of half the remaining roadmap.** Chat/messaging (#4), seller ratings/reviews (#5), saved searches, image-upload ownership, draft→publish state machine, and report/abuse flows all require authenticated users. Building any of them first means retrofitting auth into them later at higher cost. Auth first = every subsequent feature lands on solid ground.
4. **Competitive parity unlocks trust features.** SS.lv's moat includes verified profiles and seller reputation. None of that is even expressible until a User owns listings via a trusted identity.
5. **User value is immediate:** users can manage ("my listings"), edit/delete their own posts, and be contacted safely — the core seller loop of any classifieds site.

### Effort estimate

**Medium — one build cycle (~3–5 focused days).**
- Schema: minimal changes (User model exists; add passwordHash / account relations).
- Backend: register/login/logout routes, session cookie middleware, swap `authorId` → `session.user.id` in listing mutations (~1 day).
- Frontend: wire existing `components/auth.tsx` to real endpoints, protect `/new-listing`, add "my listings" view (~1–2 days).
- Tests: extend existing Jest suite with auth-flow tests (~0.5 day).
- Defer Smart-ID/eParaksts verification badges to a later cycle — plain email auth is enough to launch.

### Acceptance criteria
- [ ] Register / login / logout / session persistence work end-to-end.
- [ ] `POST/PATCH/DELETE /api/listings` reject requests without a valid session; `authorId` never accepted from request body.
- [ ] Users can only edit/delete their own listings.
- [ ] `/new-listing` requires login; tests cover auth-rejected mutations.

---

## Runner-ups (in priority order)

| # | Feature | Impact | Effort | Why not first |
|---|---|---|---|---|
| 2 | **Image uploads** (replace `handleImageUpload` stub) | Very high — listings without photos are near-useless in classifieds; SS.lv is photo-first | Medium (S3/R2 presigned uploads, UI) | Huge user value, but ownership/attribution of uploads needs auth anyway; do it right after |
| 3 | **Full-text search (Postgres FTS, Latvian config, ranking)** | High — SS.lv's core moat; current ILIKE misses diacritics & typos | Medium (tsvector column + GIN index, rewrite query layer) | Bad search degrades experience but doesn't block launch; pairs naturally with image-rich listings later |
| 4 | **Chat/messaging per listing** | High for conversion (buyer↔seller contact) | High (realtime infra, notifications) | Depends entirely on auth; biggest build cost on the board |
| 5 | **JSONB attribute filters + city/location field** | High (SS.lv parity for cars/real estate) | Medium-High | Valuable once there's real listing volume — which requires auth + images first |

## Bottom line
Ship **runtime authentication** this cycle. It closes the only launch-blocking vulnerability, unblocks 4 of the top 5 runner-ups, and turns the current demo into a real marketplace.
