# 09 — Testing, release, operations, and analytics events

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026

## 1. Test strategy

### 1.1 Layers

| Layer | Tools | Scope | Runs |
|---|---|---|---|
| Unit | Vitest | `packages/domain` pure rules: state machines, fee math, ladders, proxy resolution, validation, policy decisions | Every commit |
| Property-based | fast-check | Auction ladder and proxy invariants; fee rounding; ledger balance; search normalisation | Every commit (reduced run), nightly (full run) |
| Integration | Vitest with Testcontainers (PostgreSQL 17) | Services and database transactions; outbox; advisory locks; idempotency; migrations | Every pull request |
| Contract | Vitest with recorded fixtures; Pact where useful | Adapters for Smart-ID, Omniva, DPD, PSP, email, SMS | Every pull request; live sandbox nightly |
| API | Supertest or similar against the running app | Every endpoint: success, validation, authorisation (negative), idempotency, rate limit | Every pull request |
| End-to-end | Playwright | Core flows F-01, F-06, F-08, F-10, F-11, F-15, F-16, F-17 | Every pull request (subset), full nightly |
| Accessibility | Playwright with axe-core; manual screen-reader checks per release | Every page template and core component | Every pull request (automated); per release (manual) |
| Performance | k6 | Search, listing page, bidding, checkout | Staging before each release; weekly baseline |
| Load and concurrency | k6 and custom harness | 1,000 concurrent bids per auction; close job at scale | Before R3; before each auction-related release |
| Security | SAST, dependency scan, secret scan, DAST, pen test | See `07-security-privacy.md` section 15 | Per pull request, per release, per phase |
| Visual regression | Playwright screenshots | Design system components and key pages in LV, RU, EN | Per pull request on changed components |
| Localisation | Lint rule plus translation completeness report | All user-facing strings | Every pull request |

### 1.2 Required tests per story type

| Story type | Required tests |
|---|---|
| Domain rule | Unit tests for every AC; property test if numeric or ordering |
| API endpoint | Success, validation, authorisation (negative), idempotency if state-changing, rate limit if public |
| Money | Ledger posting test per pattern; reconciliation test; webhook duplicate test |
| Auction | Concurrency test; close idempotency test; authorisation test; clock-edge test |
| UI flow | E2E happy path; one error path; accessibility scan; LV, RU, EN rendering check |
| Migration | Forward and rollback on a copy of staging data; timing test on production-size data |
| Integration adapter | Contract test with fixtures; timeout and circuit-breaker test |
| Privacy-sensitive | Log redaction test with planted personal data; analytics event schema test |

### 1.3 Test data

- Seed data: generated listings and users with fictional names and fake contact details. Reproducible from a seed number.
- No production data in non-production environments. If a bug can be reproduced only with production data, the data is copied under the owner's approval, with personal fields replaced by generated values, and the copy is deleted within 7 days.
- Sandbox accounts for each provider; test card numbers only in sandbox.

### 1.4 Quality gates

A pull request cannot merge unless:
- Lint, type check, and unit tests pass.
- Integration and API tests pass for changed modules.
- No new critical or high security findings.
- Accessibility scan passes for changed pages.
- Translation completeness check passes.
- Required reviewers approved (two for money, auction, and identity code).

A release cannot go to production unless:
- All E2E flows for the release pass in staging.
- Load tests pass for affected flows.
- Migration tested on staging copy with timing.
- Feature flags configured with default off for new money, auction, and verification features.
- Release notes approved (and legal notes where required).
- Rollback plan documented.

## 2. Environments

| Environment | Data | Access | Purpose |
|---|---|---|---|
| Local | Seed data | Developers | Development |
| Preview | Seed data | Developers and reviewers | Per pull request review |
| Staging | Seed data plus sanitised copy when approved | Team | Integration, load, release rehearsal |
| Production | Live | Restricted (bastion, logged) | Live service |

Configuration differences are limited to URLs, credentials, and feature flags. Code paths do not branch on environment name except for sandbox adapters.

## 3. Release process

1. Release branch cut weekly (or on demand for hotfixes).
2. Automated pipeline: build, test, security scan, container image build with provenance, staging deploy.
3. Staging verification: E2E, performance, security scan, manual exploratory test by product and QA (or designated tester).
4. Database migration run in staging, then production migration in a maintenance window if it locks tables (target: no maintenance window needed; use online migration patterns).
5. Production deploy with progressive rollout: web on Vercel production (instant rollback to previous deployment); worker in two-step rollout (one replica first, then the second after 15 minutes of healthy metrics).
6. Post-deploy checks: synthetic monitors (sign-in, search, listing view, bid placement on a test auction, checkout in sandbox mode in production only for staff accounts if the provider allows), error rate, queue lag.
7. Release notes published internally and to users where needed.

### 3.1 Feature flags

- Flag names: `area.feature` (for example `auctions.proxy_bidding`, `payments.escrow`).
- Default off for money, auction, verification, and moderation features.
- Rollout by role first (staff), then by percentage of users, then general availability.
- Each flag has an owner and an expiry date. Expired flags are removed in the next release.
- Flag changes are audited.

### 3.2 Migrations

- Expand-and-contract for breaking changes: add new column, backfill, dual-write, switch reads, remove old column in a later release.
- Long-running backfills run in the worker with batches and progress records.
- Index creation uses concurrent options where supported.
- Each migration file includes a header comment: purpose, reversibility, expected duration on production size, locks taken.

## 4. Operations

### 4.1 On-call

- Rota with at least two people for production incidents once live.
- Severity levels:
  - SEV1: payments, auctions, sign-in, or data exposure broken for many users. Response within 15 minutes, 24/7.
  - SEV2: a core flow degraded for some users; money at risk but contained. Response within 1 hour.
  - SEV3: non-core issue or workaround available. Next business day.
- Escalation path documented; includes legal (for data incidents) and finance (for money incidents).

### 4.2 Dashboards

- Business: sign-ups, verified users, listings published, searches, messages, offers, orders, GMV, auctions live, bids per minute, disputes, reports, SLA attainment.
- Technical: request rate, error rate, latency p50 and p95 per route, database connections and slow queries, worker queue depth and lag, job failures, adapter errors and circuit states, search latency.
- Finance: settlement status, reconciliation differences, payouts scheduled and paid, holds, refunds.

### 4.3 Alerts (initial set)

| Alert | Condition | Severity |
|---|---|---|
| API error rate | Above 1% for 5 minutes | SEV2 |
| Sign-in failure spike | Above 3x baseline for 10 minutes | SEV2 |
| Auction close lag | Above 60 seconds | SEV1 when auctions live |
| Bid latency | p95 above 250 ms for 5 minutes | SEV2 |
| Queue lag | Above 5 minutes for money jobs | SEV1 |
| Webhook signature failures | Above 10 in 10 minutes | SEV2 |
| Reconciliation difference | Any unexplained difference older than 48 hours | SEV2 |
| Ledger imbalance | Any | SEV1 |
| Search drift | Above 0.5% | SEV3 |
| Image safety backlog | Above 500 items older than 1 hour | SEV3 |
| Moderation SLA | High-severity queue older than 24 hours | SEV2 |
| Certificate expiry | Within 14 days | SEV3 |

### 4.4 Backups and recovery

- Managed database: continuous backup with point-in-time recovery (RPO 5 minutes); daily snapshots retained 35 days.
- Object storage: versioning enabled on private bucket; lifecycle rules for deleted objects.
- Quarterly restore drill: restore a snapshot to an isolated environment, run reconciliation and smoke tests, record results.
- Recovery targets: RTO 1 hour for web and database.

### 4.5 Runbooks (to write before R1 launch)

| Runbook | Trigger | Key steps |
|---|---|---|
| Auction close failure | Close lag alert | Check worker health; check advisory locks; run close for overdue auctions manually with audit reason |
| PSP webhook outage | Webhook failure alert or no events for 30 minutes | Switch to polling mode; reconcile stuck orders; notify finance |
| Payment fraud spike | Chargeback or fraud score spike | Raise fraud thresholds; hold high-risk payouts; review top sellers |
| Mass report or spam wave | Report volume spike | Rate-limit new accounts; enable stricter spam rules; triage queue |
| Search drift | Drift alert | Re-run projection for affected categories; check outbox backlog |
| Data exposure | Security report or detection | Contain; assess personal data; legal notification decision within 72 hours |
| Account takeover wave | Sign-in anomaly | Force re-authentication for affected accounts; block suspicious IP ranges; notify users |
| Stolen-goods campaign | M2 case cluster | Block listings; freeze linked accounts; law-enforcement request process |
| Smart-ID outage | Provider status or error spike | Display notice; keep other methods; queue support |
| Ledger imbalance | Integrity check fails | Freeze payouts; identify transaction; correct with adjustment and reason; finance review |

## 5. Analytics events

### 5.1 Naming

- Format: `object_action` in snake case (for example `listing_published`, `bid_placed`).
- Properties: categorical or numeric, never personal data. Listing and auction IDs are allowed (internal, pseudonymous). Bidder and buyer IDs are not sent to third-party tools; use pseudonymous IDs.
- Every event has a schema in `packages/analytics/schemas` and a test.

### 5.2 Core events

| Event | Properties (examples) | Release |
|---|---|---|
| `user_registered` | method (SMART_ID, PHONE, EMAIL), locale | R1 |
| `user_verified` | level | R1 |
| `listing_started` | category_code, template | R1 |
| `listing_published` | category_code, has_photos_count_bucket, price_type | R1 |
| `listing_expired` | category_code, days_active | R1 |
| `search_performed` | locale, filter_count, sort, result_bucket | R1 |
| `listing_viewed` | category_code, source (search, similar, direct) | R1 |
| `conversation_started` | category_code | R1 |
| `offer_made` | category_code, offer_bucket | R2 |
| `checkout_started` | payment_method_planned | R2 |
| `order_paid` | category_code, total_bucket | R2 |
| `order_released` | category_code, days_to_release | R2 |
| `dispute_opened` | reason | R2 |
| `review_submitted` | role, rating | R1 |
| `report_submitted` | reason_code | R1 |
| `auction_created` | category_code, duration_days | R3 |
| `bid_placed` | auction_id, outcome (accepted, rejected_low, rejected_closed) | R3 |
| `auction_closed` | outcome, bid_count_bucket | R3 |
| `rfq_created` | category_code | R4 |
| `tender_bid_submitted` | category_code | R4 |

### 5.3 Consent

- Analytics events for non-essential purposes are sent only with analytics consent.
- Essential operational events (security, transaction state) are logged server-side, not in third-party analytics.

## 6. Notification catalogue

| Type | Channels | Trigger | Default |
|---|---|---|---|
| `security.new_sign_in` | Email | New device session | On, not optional |
| `security.method_changed` | Email, SMS | Method added or removed | On, not optional |
| `chat.new_message` | In-app, email (batched), push | New message | On |
| `listing.expiring` | Email, push | Day 25 | On |
| `listing.expired` | Email | Day 30 | On |
| `listing.removed` | Email | Moderation action | On, not optional |
| `saved_search.match` | Email, push | Matching new listing | On per search |
| `watch.price_drop` | Push, email (daily) | Price lower | On |
| `offer.received` | In-app, email, push | Offer | On |
| `offer.decided` | In-app, email, push | Accepted, declined, countered, expired | On |
| `order.paid` | Email, in-app | Payment | On |
| `order.shipped` | Email, in-app, SMS (if opted in) | Shipped | On |
| `order.delivered` | Email, in-app | Delivered | On |
| `order.release_reminder` | Email, push | 1 day before auto-release | On |
| `dispute.update` | Email, in-app | Dispute stage change | On, not optional |
| `auction.outbid` | Push, in-app | Outbid | On |
| `auction.won` | Email, in-app, SMS | Winner | On |
| `auction.reserve_not_met` | Email, in-app | Seller and highest bidder | On |
| `payout.paid` | Email | Payout completed | On |
| `marketing.*` | Email | Campaigns | Off until opt-in |

## 7. Accessibility checklist (per release)

- Keyboard: all controls reachable and operable; focus visible; no traps.
- Screen reader: landmarks, headings in order, labels for all inputs, live regions for bid updates and chat messages (polite, rate-limited).
- Colour: contrast at least 4.5:1 for text and 3:1 for UI components; no colour-only meaning.
- Motion: respect reduced-motion preferences; no auto-playing media.
- Forms: errors identified in text, linked to fields, announced.
- Zoom: usable at 200% zoom and at 320 CSS pixels width.
- Language: `lang` attribute set per page for LV, RU, EN.

## 8. Localisation process

- Strings in keyed catalogues per locale. Keys named by area, for example `listing.wizard.title.label`.
- Latvian written first by the product team; Russian and English produced by translators with a glossary; native-speaker review for each release.
- Glossary of product terms (listing, offer, escrow, verification levels, auction terms) owned by product.
- Pseudo-localisation in staging to find truncation and layout issues (text expanded by 30%).
- Missing translation falls back to Latvian and is reported in the completeness dashboard.

## 9. Documentation maintenance

- Specifications in `docs/` are updated in the same pull request as the code they describe.
- Each specification has a status and a last-changed date.
- Quarterly documentation review: broken links, outdated values, status changes, ADR links.
- Business values (limits, thresholds, fees) are in `03-business-rules.md` and the platform settings table; the document is updated when the setting changes.
