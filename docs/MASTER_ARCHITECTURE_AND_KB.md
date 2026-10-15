# SellBuy.lv — Master Architecture, Backlog & Production Knowledge Base

> **Version:** 1.0.0 (Production Blueprint) · **Date:** 15 October 2026
> **Scope:** Unified Baltic Marketplace (Latvia first: Riga & regions) — C2C Classifieds, B2C Retail Commerce, B2B Equipment Auctions & Smart Logistics.
> **Repository:** `/home/shadow3/projects/sellbuy-v2` · **Branch:** `main`
> **Live Preview (Cloudflare Tunnel):** `https://boots-fabric-exclusion-succeed.trycloudflare.com`

---

## 1. Executive Summary & Domain Vision

SellBuy.lv is an independent, next-generation Baltic commerce platform engineering the intersection of:
1. **SS.com / SS.lv Velocity:** Category breadth, near-zero friction C2C posting, localized taxonomy, and diacritic-insensitive search.
2. **220.lv / PHH Group Infrastructure:** Multi-seller merchant storefronts, parcel locker logistics (Omniva & DPD), VAT invoices, and B2B procurement.
3. **Vinted / Temu Buyer Trust & Algorithmic Discovery:** Integrated buyer-protection escrow, automatic shipping label generation, zero seller listing fees, and anti-fraud identity verification (Smart-ID / eParaksts / CSDD).
4. **Transparent Price Discovery:** Independent 90-day sold-price history and timed English auctions with anti-sniping protection.

---

## 2. Platform Information Architecture & Modules

```
SellBuy Platform
├── MOD-01: Identity, Trust & Accounts (Smart-ID, Phone OTP, L0-L3 Graded Verification, Profiles)
├── MOD-02: Deep Catalog & Taxonomy Engine (4-Level ltree Paths, Dynamic Attribute Schemas)
├── MOD-03: Multi-Category Listings Wizard (Multi-Image Drag-and-Drop, EXIF Stripping, CSDD/VIN Trust)
├── MOD-04: Full-Text Search & Discovery (pg_trgm Trigrams, Diacritic-Insensitive, Saved Searches & Alerts)
├── MOD-05: Real-Time Messaging & Negotiation (In-App Chat, Polling/SSE, Quick Replies, Contact Masking)
├── MOD-06: Escrow, Payments & Fee Engine (Double-Entry Ledger, Card/Open-Banking, Auto-Release)
├── MOD-07: Baltic Logistics & Delivery (Omniva Packomat / DPD Locker Integration, Automated Labels)
├── MOD-08: Timed English Auctions Engine (Proxy Bidding, Hidden Reserve, 2-Min Anti-Sniping Extension)
├── MOD-09: B2B Marketplace & Company Storefronts (Enterprise Registry / VIES, Bulk Upload, RFQs)
├── MOD-10: Trust, Moderation & Compliance (DSA Notice-and-Action, DAC7 Reporting, GDPR DPIA)
└── MOD-11: Price Intelligence & AI Metadata (Sold History, Title Normalization, Attribute Suggestions)
```

---

## 3. Directory Navigation & Authoritative Artifact Index

All comprehensive specifications, architectural diagrams, contracts, and backlogs are organized across the following paths:

| Artifact / Document | Path | Purpose |
|---|---|---|
| **Master Product Backlog (150+ Stories)** | `docs/backlog/BACKLOG.md` & `docs/sellbuy-backlog.md` | Full MoSCoW-prioritized epics (EP-00 to EP-16) with testable Given/When/Then acceptance criteria. |
| **Machine-Readable Backlog CSV** | `docs/backlog/stories.csv` | Granular story export with release tags (R1–R5), priority, and sizing. |
| **End-to-End Traceability Matrix** | `docs/traceability-matrix.md` | Maps Business Goals → Requirements → Stories → Target Files → Tests → Release. |
| **Sitemap & Screen Specifications** | `docs/sitemap-and-screen-specs.md` | UI/UX specifications, states, user actions, and component token bindings. |
| **OpenAPI 3.0 Contract** | `docs/openapi.yaml` | Machine-readable REST API schemas, endpoints, parameter validations, and auth schemes. |
| **Functional User Flows** | `docs/functional/02-user-flows.md` | End-to-end paths for C2C sellers, deal hunters, collectors, and B2B buyers. |
| **Business Rules & Limits** | `docs/functional/03-business-rules.md` | Hard rules for L0–L3 verification tiers, listing durations, fees, and escrow windows. |
| **Technical System Architecture** | `docs/technical/01-architecture.md` | Distributed systems design, caching, background worker queues, and event streams. |
| **Relational Data Model & ERD** | `docs/technical/02-data-model.md` & `prisma/schema.prisma` | PostgreSQL 17 + ltree schema, indexes, state machines, and double-entry ledger. |
| **Auctions & Bidding Engine Spec** | `docs/technical/04-auctions-engine.md` & `docs/functional/auctions.md` | Increment ladder formulas, proxy resolution, concurrency locks, and anti-sniping. |
| **Payments & Escrow Lifecycle** | `docs/technical/05-payments-escrow.md` | Safe fund holding, dispute workflows, and PSP integration (Montonio/Stripe). |
| **Security & Privacy Framework** | `docs/technical/07-security-privacy.md` | OWASP ASVS L2, EXIF stripping, GDPR data minimization, and DAC7 compliance. |
| **Integrations Architecture** | `docs/technical/08-integrations.md` | Smart-ID authentication, Omniva/DPD locker APIs, and CSDD open registry. |
| **Testing & CI/CD Runbook** | `docs/technical/09-testing-release-ops.md` | Automated Jest test suites, ESLint rules, and Docker Compose deployment runbooks. |

---

## 4. Current Platform Verification Status (October 2026)

- **Test Suite Status:** 25/25 test suites passing (140 unit and integration tests).
- **Linter Status:** Clean (`eslint . --report-unused-disable-directives --max-warnings 5` passes with 0 errors).
- **Container Deployment:** `sellbuy-v2-sellbuy-1` running healthy on Docker under standalone Next.js 16.
- **Active Sprint Focus:** R1 MVP completion with verified saved searches (`/saved-searches`), 4-level category explorer (`/categories`), vehicle trust verification, and real-time messaging (`/messages`).
