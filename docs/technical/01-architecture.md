# 01 — Architecture

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026

## 1. Context

SellBuy.lv is a Latvian marketplace with listings, search, messaging, payments with escrow (R2), auctions (R3), and business features (R4). The system needs to be reliable for money and auctions, fast on mobile networks, and simple enough for a small team to operate.

Quality attributes, in order of priority:
1. Correctness of money, auctions, and permissions.
2. Security and privacy of personal data.
3. Availability of core flows (search, listing, messaging, bidding).
4. Latency on mobile networks.
5. Operability: observable, recoverable, low on-call burden.
6. Cost per active user.

## 2. Components

```
                 ┌──────────────────────────────────────────────┐
  Browsers ───▶  │ CDN / edge (static assets, cached pages)     │
  (LV/RU/EN)     └───────────────┬──────────────────────────────┘
                                 │
                 ┌───────────────▼──────────────┐       ┌──────────────────┐
                 │ apps/web (Next.js on Vercel) │──────▶│ Search index     │
                 │ pages, route handlers,       │       │ (PostgreSQL FTS  │
                 │ server actions               │       │  at launch)      │
                 └───┬───────────┬──────────┬───┘       └──────────────────┘
                     │           │          │
          ┌──────────▼──┐  ┌─────▼─────┐  ┌─▼──────────────────┐
          │ PostgreSQL  │  │ Object    │  │ Realtime provider   │
          │ 17 (ltree,  │  │ storage   │  │ (chat, live bids)   │
          │ pg_trgm)    │  │ (S3 API)  │  └─────────────────────┘
          └──────▲──────┘  └───────────┘
                 │
     ┌───────────┴────────────┐       ┌──────────────────────────────┐
     │ apps/worker            │◀─────▶│ Job queue (pg-boss in PG)    │
     │ auction close, expiry, │       └──────────────────────────────┘
     │ escrow timers, webhooks│
     │ reconciliation, emails │──────▶ Email, SMS, push providers
     └───────────┬────────────┘
                 │
     ┌───────────▼────────────┐   ┌─────────────────────────────────────┐
     │ External integrations  │   │ Payment provider (PSP), Smart-ID,    │
     │ (adapters with retries)│──▶│ Omniva, DPD, company register, VIES, │
     └────────────────────────┘   │ image classifier, stolen-goods check │
                                  └─────────────────────────────────────┘

  Observability: Sentry (errors), OpenTelemetry (traces), metrics, structured logs
```

### 2.1 apps/web

- Next.js App Router. Server components for listing, category, search, and storefront pages (SEO and speed). Client components only for interactive widgets (filters, photo upload, chat, bid form, map).
- Route handlers and server actions call domain services. They contain no business rules.
- Authentication through a session cookie; authorisation checked in every service call.
- Caching: category tree and static content cached at the edge; listing pages cached for 60 seconds with revalidation on change; search results not cached beyond 30 seconds; personal pages are never cached publicly.

### 2.2 apps/worker

- Runs pg-boss against PostgreSQL. Jobs are idempotent, carry a stable job key, and record attempts.
- Scheduled jobs: listing expiry, renewal reminders, auction closing (per auction, scheduled at `ends_at`), escrow auto-release, shipment checks, payout runs, reconciliation, search index sync, data export generation, account deletion after cooldown, notification digests, retention cleanup.
- Runs on a small always-on container host (Render, Fly.io, Railway, or similar; decision DEC-02). Never run on Vercel functions.
- Two replicas for availability. Job claiming is safe with multiple replicas because pg-boss uses row locking.

### 2.3 packages/domain

- Pure TypeScript. No database, network, clock, or random number access except through injected interfaces.
- Contains: listing state machine, offer state machine, auction rules (increments, proxy resolution, anti-sniping window, reserve), order and escrow state machine, fee calculation, price rounding, validation rules, category rules (flags and template checks), verification-level gating, permission policies.
- Covered by property-based tests (for auction and fee math) and example-based tests (for states).

### 2.4 packages/db

- Prisma schema, migrations, seeds. The schema is documented in `02-data-model.md`.
- Raw SQL is allowed only for the auction bid statement, the ledger posting batch, and the search query. Each raw statement lives in one file with a test.

### 2.5 Search

- Launch: PostgreSQL full-text search with a generated `tsvector`, `pg_trgm` for typo tolerance, and a normalisation function for Latvian diacritics and transliteration (`technical/06-search.md`).
- Migration path: when thresholds are reached (500,000 active listings or faceted p95 above 300 ms), replace the query layer with Meilisearch or OpenSearch behind the same service interface. The outbox pattern feeds both.

### 2.6 Realtime

- Chat and live auction updates use a realtime provider channel per conversation or auction.
- Server publishes events from the same transaction that writes the state (outbox pattern), so clients never see a state that was not committed.
- Fallback: if realtime is unavailable, clients poll every 5 seconds on the open conversation or auction page.

### 2.7 Storage

- Originals stored in a private bucket. Public variants (WebP, AVIF, thumbnails) stored in a public bucket behind the CDN with unguessable keys.
- Upload flow: client requests a signed upload URL, uploads directly, server validates the file (type sniffing, size, dimensions), strips metadata, creates variants, marks the image ready.
- Images not referenced by a listing within 24 hours are deleted.

### 2.8 Integrations

Each external system has an adapter in `apps/worker` or `apps/web` (server-only) with: timeouts, retries with backoff and jitter, circuit breakers, idempotency keys where supported, request and response logging with redaction, and a sandbox configuration. Details in `08-integrations.md`.

## 3. Key flows

### 3.1 Create listing
Client validates locally → server action → domain validation → rule engine (sync for cheap checks; async for image classification) → write listing in a transaction with outbox event `listing.submitted` → worker indexes listing and runs image checks → state set to active or pending_review.

### 3.2 Place bid (R3)
Client sends bid with idempotency key → server authorises (eligibility, not seller, not linked) → atomic conditional update in the database (see `04-auctions-engine.md`) → on success, outbox event `auction.bid_accepted` → realtime publish and outbid notices → response with the bidder's status.

### 3.3 Escrow purchase (R2)
Checkout creates order in `awaiting_payment` with idempotency key → PSP session created → hosted payment page → PSP webhook `payment.succeeded` (verified signature, idempotent handler) → ledger postings → order `paid` → seller notified → shipment events move the order → delivery → auto-release timer scheduled in worker → release postings → payout eligibility.

### 3.4 Auction close (R3)
Worker job scheduled at `ends_at` (and rescheduled if extended) → takes advisory lock on the auction → recomputes outcome from committed bids → writes outcome and order in one transaction → outbox events → notices. Idempotent: a second run finds the outcome already recorded and exits.

## 4. Deployment

| Environment | Web | Worker | Database | Purpose |
|---|---|---|---|---|
| Local | Docker Compose or `pnpm dev` | Docker Compose | PostgreSQL container | Development. Seed data only. Raspberry Pi 4B supported for this environment only. |
| Preview | Vercel preview per pull request | Shared staging worker | Staging database (no production data) | Review |
| Staging | Vercel production-like project | Staging worker | Staging database | Pre-release testing, load tests, integration sandboxes |
| Production | Vercel production | Production worker (two replicas) | Managed PostgreSQL with replicas and daily backups | Live |

Production secrets come from the hosting provider's secret store and the secrets manager. Access to production databases requires a bastion session with logging.

## 5. Failure modes and recovery

| Failure | Impact | Detection | Behaviour | Recovery |
|---|---|---|---|---|
| Database primary down | All writes fail | Health checks, error rate | Web shows maintenance page for writes; reads from replica where safe | Failover to standby (managed service); verify ledger reconciliation |
| Worker down | Timers, notices, payouts delayed | Queue depth and age alerts | Jobs wait in queue | Restart replicas; jobs resume; auction close runs late within 60 seconds of recovery (alert threshold) |
| Auction close missed | Auction outcome late | Alert on jobs overdue by 60 seconds | Reconciliation job runs every minute and closes overdue auctions | Automatic; manual close via admin if needed |
| PSP webhook delayed | Order stays `awaiting_payment` | Reconciliation against PSP API every 15 minutes | Order status polls PSP for stuck orders | Automatic; support runbook for unresolved |
| Realtime provider down | Live updates delayed | Client errors, provider status | Polling fallback | Automatic |
| Search index drift | Results stale or missing | Count comparison job every hour | Re-index changed records; full rebuild if needed | Runbook |
| Object storage down | Image upload fails; pages show placeholders | Error rate on image requests | Placeholder image; uploads queued client-side for up to 10 minutes | Automatic |
| Email or SMS provider down | Notices delayed | Queue age | Retries with backoff; fallback provider configured for SMS | Switch provider per runbook |
| Smart-ID down | Registration and verification blocked | Provider status and error rate | Phone and email methods remain available; message explains | Automatic |
| Data corruption in ledger | Financial integrity | Daily reconciliation | Freeze payouts; investigate | Runbook, finance and tech |

## 6. Decision defaults

The owner makes the decisions (DEC-01 to DEC-12 in the backlog). The defaults below are recommendations so the team can start Phase 0 work. Implement a recommended default only behind a feature flag until the decision is recorded.

| ID | Decision | Recommended default | Reason |
|---|---|---|---|
| DEC-01 | Search engine | PostgreSQL full-text and trigram at launch | Fewer moving parts; enough for early volume; clear migration path |
| DEC-02 | Job runner and worker host | pg-boss on a small always-on container host | Timers must run outside Vercel; PostgreSQL-backed jobs avoid another queue |
| DEC-03 | Free posting for private sellers | Free posting, paid promotions only | Supply first; matches the market leader's habit |
| DEC-04 | Realtime | Managed realtime provider | Avoids long-lived connections on serverless hosting |
| DEC-05 | Payment model | Licensed PSP with marketplace split payouts (Stripe Connect or a Baltic provider); funds held by the PSP, never by SellBuy | Avoids holding client funds; licensing question still needs a legal opinion (Q-02) |
| DEC-06 | Object storage | Cloudflare R2 | S3-compatible, no egress fees for public reads (confirm current terms) |
| DEC-07 | Fee model | Placeholder structure only (`03-business-rules.md` section 4) | Owner decision |
| DEC-08 | Business subscription | Tiered plans | Owner decision |
| DEC-09 | AI vendor | Choose after a 2-week evaluation on 200 real listings | Quality and data processing terms matter more than list price |
| DEC-10 | Analytics | Privacy-friendly analytics, no personal data in events | Simpler consent; GDPR-friendly |
| DEC-11 | Mobile | PWA first; native after R2 usage data | Lower cost; faster iteration |
| DEC-12 | Launch geography | Riga first, then the rest of Latvia | Densest demand; easier logistics for beta |

## 7. Non-functional targets

| Area | Target |
|---|---|
| Search p95 latency | Under 300 ms at 500,000 listings |
| Listing page TTFB | Under 400 ms from edge cache |
| Bid API p95 | Under 250 ms |
| Mobile LCP (mid-range Android, 4G) | Under 2.5 s |
| Core flow availability | 99.9% monthly |
| Auction close accuracy | Never later than 60 seconds after scheduled end |
| RPO (data loss) | 5 minutes (PITR) |
| RTO (recovery) | 1 hour for web and database; 4 hours for full worker recovery |
| Scale at launch | 100,000 active listings; 10,000 concurrent users |
| Scale at 18 months | 1,000,000 active listings; 100,000 concurrent users |

## 8. Architecture decision records

Each decision in section 6 becomes an ADR file in `docs/adr/` when decided, with context, options, decision, and consequences. ADR template: `docs/adr/0000-template.md`.

## 9. Security boundaries

- Browser to web: authenticated by cookie; CSRF protection on state-changing requests.
- Web to database: least-privilege role for the web app; no schema changes at runtime.
- Worker to database: separate role with rights for job tables and the domain tables it updates.
- Web and worker to external systems: credentials in the secrets manager; per-integration service accounts.
- Staff tools: separate authentication (two-factor), separate role model, separate audit stream.
- Details in `07-security-privacy.md`.
