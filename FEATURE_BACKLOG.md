# SellBuy.lv v2 — Feature Backlog

> Synchronized with `sellbuy-backlog.md` (Product Backlog v0.1 · 15 Oct 2026).
> Stack: Next.js 16, TypeScript, React 19 RC, Prisma 7, PostgreSQL 17 (ltree), Tailwind + shadcn/ui.

---

## Completed Items ✅

| Feature / Epic | Cycle | Agent Context | Deliverable File(s) | Notes |
|---|---|---|---|---|
| Category taxonomy API (`/api/categories`, `/api/categories/tree`) + ltree | 2026-08-25 | agency/backend | `app/api/categories/route.ts`, `app/api/categories/tree/route.ts` | Complete hierarchical category pathing |
| Unique constraint on `Category.path` | 2026-08-24 | agency/backend | `prisma/schema.prisma` | DB level integrity |
| Listing model: `description` + `images` fields | 2026-08-24 | agency/backend | `prisma/schema.prisma`, `app/api/listings/route.ts` | Data persistence |
| `/new-listing` page wired to live category tree | 2026-08-25 | agency/frontend | `app/new-listing/page.tsx` | Wizard baseline |
| `/about` page (shadcn/ui) | 2026-08-25 | agency/frontend | `app/about/page.tsx` | Static content |
| Listing detail page `/listings/[id]` | 2026-08-24 | agency/frontend | `app/listings/[id]/page.tsx` | Full listing viewer |
| i18n support (LV, RU, EN, LT, ET, DE, PL, UK) | 2026-09-28 | agency/frontend | `app/lib/i18n.ts`, `components/navbar.tsx` | Ukrainian added Oct 15 |
| User Profile API (`/api/users/[id]`) with rating aggregation | 2026-09-28 | agency/backend | `app/api/users/[id]/route.ts`, `app/profile/[id]/page.tsx` | User management |
| React 19 render purity & TypeScript build fixes | 2026-09-29 | agency/qa | `app/profile/[id]/page.tsx`, `app/api/auth/me/route.ts` | Engine stability |
| GitHub CI & Pre-commit verification gate | 2026-09-29 | agency/devops | `.git/hooks/pre-commit`, `.github/workflows/ci.yml` | Quality gating |
| Seller Ratings & Feedback API (`/api/ratings`) + Rating Form & UI | 2026-09-29 | agency/backend | `app/api/ratings/route.ts`, `components/rating-form.tsx` | Reputation engine |
| Multi-Image Drag & Drop Upload | 2026-09-30 | agency/frontend | `components/image-uploader.tsx`, `app/new-listing/page.tsx` | Multi-image preview |
| AI Listing Assist Endpoint (`/api/listings/ai-assist`) | 2026-10-01 | agency/ai | `app/api/listings/ai-assist/route.ts` | AI attributes & pricing |
| AI Listing Autofill Endpoint (`/api/ai/listing-autofill`) | 2026-10-02 | agency/ai | `app/api/ai/listing-autofill/route.ts` | Automated metadata |
| Postgres Full-Text Search (FTS) | 2026-10-04 | agency/backend | `app/lib/search.ts`, `app/api/listings/route.ts` | Trigram similarity & FTS |
| User Verification & Trust Badges | 2026-10-04 | agency/frontend | `components/verification-badge.tsx`, `app/api/users/verify/route.ts` | Smart-ID / Phone L1/L2 |
| Omniva / DPD Locker Delivery Integration | 2026-10-08 | agency/integrations | `components/delivery-picker.tsx`, `app/api/delivery/route.ts` | Locker network selection |
| Escrow & Payment Protection API & UI | 2026-10-08 | agency/fullstack | `app/api/transactions/route.ts`, `components/escrow-checkout.tsx` | Secure transactions |
| **Real-Time Chat & Messaging (US-05.01)** | 2026-10-14 | agency/fullstack | `app/api/chats/[id]/route.ts`, `app/messages/page.tsx` | In-app messaging & polling |
| **Deep 4-Level Category Taxonomy (US-02.01)** | 2026-10-15 | agency/fullstack | `prisma/deep-taxonomy-seed.ts`, `app/categories/page.tsx` | Interactive 4-level catalog explorer |
| **SellBuy Trust & Vehicle Verification (US-01.05)** | 2026-10-15 | agency/fullstack | `components/vehicle-verification-card.tsx`, `components/vehicle-search-widget.tsx` | Independent VIN & CSDD verification |

---

## Active & Upcoming Sprints (Aligned with `sellbuy-backlog.md`) 🚀

| ID | Release | Priority | Epic / Story | Agent Context | Target Deliverables | Notes |
|---|---|---|---|---|---|---|
| **US-04.04** | R1 | **P1 / Must** | **Saved Searches & Search Alert Notifications** | agency/fullstack | `prisma/schema.prisma`, `app/api/saved-searches/route.ts`, `components/save-search-button.tsx`, `app/saved-searches/page.tsx`, `__tests__/api-saved-searches.test.ts` | **DONE** (2026-10-15). Modal to save queries, notify toggle, dedicated management page (`/saved-searches`), navbar bookmark shortcut, and unit test suite (9 tests passing). |
| **US-05.03** | R1 | **P1 / Must** | **Contact Details Masking & Safe Reveal** | agency/fullstack | `app/lib/chat-filter.ts`, `app/api/chats/[id]/messages/route.ts`, `components/message-bubble.tsx` | ⏳ **CURRENT ACTIVE ITEM**. Mask raw phone & emails in chat until mutual interest or verified L2 status. |
| **US-05.04** | R2 | **P1 / Must** | **Structured In-Chat Offers & Counter-Offers** | agency/fullstack | `app/api/offers/route.ts`, `components/chat-offer-card.tsx`, `app/messages/[id]/page.tsx` | **DONE** (2026-10-15). Prisma `Offer` model, `/api/offers` REST endpoints, interactive `ChatOfferCard` component, and unit test suite (4 tests passing). |
| **US-10.01** | R4 | **P1 / Must** | **Business Storefronts & Trader Info Verification** | agency/backend | `prisma/schema.prisma`, `app/api/business/route.ts`, `app/shops/[slug]/page.tsx` | Company account, Enterprise Registry (UR) / VIES check, and dedicated storefronts. |
| **US-13.01** | R1 | **P2 / Must** | **Notice-and-Action Moderation Queue & Report API** | agency/fullstack | `app/api/reports/route.ts`, `components/report-modal.tsx`, `app/admin/moderation/page.tsx` | User reporting for scam/duplicate listings, statement of reasons, and moderation dashboard. |
| **US-09.01** | R3 | **P2 / Must** | **Auctions: Atomic Bidding & Anti-Sniping** | agency/backend | `prisma/schema.prisma`, `app/api/auctions/route.ts`, `app/api/auctions/[id]/bid/route.ts` | Concurrency locks for atomic bids, proxy bidding, and 2-minute anti-sniping extension. |
| **US-12.01** | R2 | **P2 / Must** | **Price Intelligence & 90-Day Sold Price History** | agency/ai | `app/lib/price-intelligence.ts`, `components/price-history-chart.tsx` | Min/median/max price context based on verified platform sales. |
| **US-03.09** | R1 | **P2 / Should** | **Listing Quality Score & Guidance Engine** | agency/frontend | `components/listing-quality-meter.tsx`, `app/new-listing/page.tsx` | Real-time score (0-100) with tips ("Add 3 more photos", "Specify VIN/model"). |
| **US-08.05** | R2 | **P2 / Should** | **Omniva & DPD Interactive Map Locker Picker** | agency/integrations | `components/delivery-picker.tsx`, `app/api/delivery/terminals/route.ts` | Visual map modal for locker terminal selection with opening hours. |
| **US-06.02** | R1 | **P2 / Must** | **Item & User Reporting Modal with Severity Triage** | agency/frontend | `components/report-modal.tsx`, `app/api/reports/route.ts` | DSA-compliant report submission dialog with category & reason codes. |
| **US-11.03** | R2 | **P2 / Must** | **Seller Analytics & Performance Dashboard** | agency/frontend | `app/dashboard/analytics/page.tsx`, `app/api/analytics/seller/route.ts` | Views, watchers, conversion rates, and payout ledger totals. |
