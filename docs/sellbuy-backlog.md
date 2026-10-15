# SellBuy.lv — Product Backlog

Version 0.2 · 15 Oct 2026 · Status: active engineering backlog & product specification
Scope: second-hand and business goods, auctions, classifieds for Latvia (Riga first)
Stack reference: Next.js 16, TypeScript, React 19 RC, Prisma 7, PostgreSQL 17 (ltree), Tailwind + shadcn/ui, Vercel, GitHub Actions
Companion docs (in repo): docs/functional/{categories,chat,profiles}.md, docs/integrations/{smart-id,logistics}.md, docs/architecture/data-schema.md

---

## 0. How to read this backlog

**IDs.** EP-xx = epic, US-xx.yy = user story, NFR-xx = non-functional requirement, DEC-xx = decision to make, RISK-xx = risk, Q-xx = open question for lawyer or business owner.

**Release tags.**
- R1 = MVP classifieds launch (free browsing, free listing, messaging, no payments)
- R2 = trust and payments (verification, escrow, shipping, price intelligence)
- R3 = auctions
- R4 = business marketplace (company accounts, RFQ, tenders, invoices)
- R5 = intelligence and scale (AI, feeds, apps, expansion)

**Priority (MoSCoW, inside a release).** Must / Should / Could / Won't (this round).

**Size.** XS (under 1 day), S (1–3 days), M (about 1 week), L (2–3 weeks), XL (must be split before work starts). Estimates assume one experienced full-stack developer and need re-estimation after spikes.

**Acceptance criteria (AC)** are written as testable statements. If a story has no AC, it is not Ready.

---

## 1. Product vision

SellBuy.lv is a Latvian marketplace where people and businesses sell used and new goods, sell business equipment, and run auctions. It combines the breadth and ease of an SS.com-style classifieds board with payment protection, structured trust, and price intelligence, which are not common in Latvian classifieds today.

**Vision in one line:** Sell almost anything in Latvia, safely, and know what it is worth.

---

## Current Sprint Execution Tracking (P0 / Active Focus)

| ID | Feature / Epic | Priority | Status | Implemented Files / Notes |
|---|---|---|---|---|
| **US-05.01** | Real-time chat & messaging API/UI | P0 / R1 | **DONE** | `app/api/chats/route.ts`, `app/api/chats/[id]/messages/route.ts`, `app/messages/page.tsx`, `app/messages/[id]/page.tsx` |
| **US-05.02** | Quick replies & templates (LV, RU, EN, UK) | P0 / R1 | **DONE** | Built into chat view with Latvian pre-sets |
| **US-02.01** | Deep 4-Level Category Taxonomy Explorer | P0 / R1 | **DONE** | `prisma/deep-taxonomy-seed.ts`, `app/categories/page.tsx`, `app/categories/categories-client.tsx` |
| **US-01.05** | SellBuy Trust & Vehicle Verification Standards | P1 / R1 | **DONE** | `components/vehicle-verification-card.tsx`, `components/vehicle-search-widget.tsx` (CSDD & VIN verification) |
| **US-04.04** | Saved Searches & Query Alerts | P1 / R1 | **DONE** | `app/api/saved-searches/route.ts`, `components/save-search-button.tsx`, `app/saved-searches/page.tsx`, `__tests__/api-saved-searches.test.ts` |
| **US-05.03** | Contact Details Masking & Safe Reveal | P1 / R1 | **TODO** | `app/lib/chat-filter.ts`, `app/api/chats/[id]/messages/route.ts`, `components/message-bubble.tsx` |
| **US-05.04** | Structured In-Chat Offers & Counter-Offers | P1 / R2 | **TODO** | `app/api/offers/route.ts`, `components/chat-offer-card.tsx`, `app/messages/[id]/page.tsx` |
| **US-09.01** | Auctions: Timed English Auctions & Proxy Bidding | P2 / R3 | **TODO** | Timed duration (1-10 days), proxy bidding ladder, hidden reserve, anti-sniping extension |

---

## 2. Market context and positioning

### 2.1 What we verified (October 2026)

- **220.lv** is part of the PHH Group (Pigu). It has sold third-party seller offers alongside its own stock since 2019 and advertises more than 1,300 categories. It offers "Fulfillment by Pigu" (central warehouse). Delivery options reported in its own material and press include Latvijas Pasts post offices, parcel lockers, and courier. Payment options listed in its app include internet banking, bank transfer, leasing, and cash on pickup. Statista ranks it as Latvia's most visited e-commerce site, with 3.82 million weighted visits in July 2023.
- **SS.com (ss.lv)** is Latvia's largest classifieds site. Latvians still call it SS.lv, and the old domain redirects. It covers hundreds of commerce categories, plus real estate, cars, and jobs. A partner page cites about 4.3 million monthly visits (this is a vendor claim, not audited). Semrush shows about 3.1 million visits in June 2025 for ss.lv (an estimate). Its category pages expose attributes such as engine size, mileage, rooms, and floor area. Several third-party scrapers exist for SS.com prices, which shows demand for price data. The site does not provide built-in price history.

Treat all traffic numbers as directional. They come from vendors and estimators.

### 2.2 Competitive positioning

| Player | What it does well | What it lacks for our target users | Our angle |
|---|---|---|---|
| SS.com | Near-universal category coverage, huge habit base, low friction | Payment protection, buyer protection, structured trust, price history, auctions, business tools | Same breadth and ease, plus protection and intelligence |
| 220.lv (PHH) | Retail-scale logistics, post-office and locker delivery, several payment methods | Retailer-led catalogue; peer-to-peer used goods and auctions are not its core | Peer-to-peer used goods and business lots with auctions |
| eBay | Auctions, buyer protection, global reach | Weak local discovery in Latvian, high fees on small items | Local-first, Latvian-language, lower fees on small items (to test) |
| Vinted | Trust, in-app shipping labels, strong fashion community | Fashion only; no business items; no auctions | Expand the trust model to all used goods and business goods |
| OLX / Facebook Marketplace | Local reach | Minimal buyer protection; scam-prone | Verified sellers, escrow option, scam nudges |

---

### 2.3 eBay Benchmark Analysis: Timed English Auctions & Proxy Bidding

eBay auctions are timed English auctions with proxy bidding. A bidder enters a maximum, and eBay bids for them in small increments until they lead or reach that maximum. The winner pays just above the second-highest bid, not their own maximum. SellBuy's EP-09 adopts this proven engine while introducing deliberate Baltic market improvements:

#### Key Mechanics Adopted from eBay:
1. **Proxy Bidding & Incremental Ladders (US-09.02, US-09.03):**
   - The visible price stays low and only escalates incrementally as competing bids arrive.
   - Bidders set their true maximum limit once; the system acts automatically on their behalf.
2. **Hidden Reserve Price (US-09.01):**
   - Sellers can protect high-value goods without setting an artificially high starting bid. Bidders see only whether the reserve has been met.
3. **Flexible Duration Choices (US-09.01):**
   - 1, 3, 5, 7, or 10-day durations to accommodate fast inventory liquidation vs maximum visibility.
4. **Shill Bidding Prevention (US-09.08):**
   - Strict detection preventing sellers or linked accounts (shared IP clusters, device fingerprints, or payment methods) from bidding on their own lots.

#### Where SellBuy Differs from eBay:
1. **Anti-Sniping Dynamic Extension (US-09.04):**
   - Unlike eBay's hard close (which invites last-second sniping bots and frustration), SellBuy automatically extends the closing countdown by 2 minutes if a bid lands in the final 2 minutes (capped at 10 extensions).
   - This ensures fair competition and transparent price discovery for human bidders.
2. **Buyer's Premium vs Seller-Only Fee Split (DEC-13):**
   - While eBay historically charges high final value fees primarily to sellers (often 10–13%+), SellBuy evaluates a balanced micro-fee model (e.g., free listing for private sellers with a modest buyer's protection premium).
3. **Local Payment & Delivery Escrow (DEC-14):**
   - Direct integration with Baltic payment rails (Smart-ID / Open Banking / Omniva / DPD) with escrow release on locker delivery confirmation.

---

## 3. Epics and user stories

### EP-00 · Foundation and platform (R1)
- **US-00.01** · R1 · Must · M — Full stack local startup with one command
- **US-00.02** · R1 · Must · S — CI test, lint, and build verification gates
- **US-00.03** · R1 · Must · S — Latvian, Russian, English, Ukrainian multilingual support
- **US-00.06** · R1 · Must · S — Design system tokens and core components

### EP-01 · Identity, accounts, and profiles (R1–R2)
- **US-01.01** · R1 · Must · M — Smart-ID authentication
- **US-01.02** · R1 · Must · S — Phone OTP sign-in
- **US-01.03** · R1 · Must · S — Email magic link
- **US-01.04** · R1 · Must · S — Public seller profile
- **US-01.05** · R1 · Must · M — Verification levels (L0 to L3) & SellBuy Trust standards

### EP-02 · Category tree and attributes (R1)
- **US-02.01** · R1 · Must · L — Category tree up to four levels deep with search
- **US-02.02** · R1 · Must · M — Dynamic attribute definitions per category
- **US-02.03** · R1 · Must · S — Standard condition scale

### EP-03 · Listings (R1)
- **US-03.01** · R1 · Must · M — Mobile-first listing wizard
- **US-03.02** · R1 · Must · M — Multi-image upload (up to 20 photos) with reordering
- **US-03.03** · R1 · Must · S — Structured price types (fixed, negotiable, free)
- **US-03.04** · R1 · Must · S — Area and approximate location (500m offset)

### EP-04 · Search and discovery (R1)
- **US-04.01** · R1 · Must · L — Trigram + full-text search ignoring diacritics
- **US-04.02** · R1 · Must · M — Filter by category attributes with counts
- **US-04.03** · R1 · Must · S — Keyset pagination and multi-sort
- **US-04.04** · R1 · Must · S — Saved search and price drop alerts

### EP-05 · Messaging and negotiation (R1–R2)
- **US-05.01** · R1 · Must · L — In-app chat with real-time delivery
- **US-05.02** · R1 · Must · S — Quick replies and templates
- **US-05.03** · R1 · Must · M — Masked contact details
- **US-05.04** · R2 · Must · M — Structured offers and counter-offers

### EP-07 · Payments, escrow, and fees (R2)
- **US-07.01** · R2 · Must · L — Card, Open Banking, Apple/Google Pay
- **US-07.02** · R2 · Must · L — Escrow funds release on delivery confirmation
- **US-07.03** · R2 · Must · M — Payouts to Latvian IBAN accounts

### EP-08 · Logistics and delivery (R2, R4)
- **US-08.01** · R2 · Must · L — Omniva locker integration and label printing
- **US-08.02** · R2 · Must · L — DPD courier and locker integration
- **US-08.05** · R2 · Should · M — Locker picker map at checkout

### EP-09 · Auctions (R3)
- **US-09.01** · R3 · Must · M — Auction creation with reserve and duration
- **US-09.02** · R3 · Must · L — Atomic conditional bidding with concurrency locks
- **US-09.03** · R3 · Must · M — Proxy bidding maximum limit engine
- **US-09.04** · R3 · Must · M — Anti-sniping extension window (2-min dynamic reset)
- **US-09.05** · R3 · Must · M — Idempotent auction closing with advisory locks
- **US-09.06** · R3 · Must · S — Buyer's premium display & calculation
- **US-09.08** · R3 · Must · S — Anti-shill bidding detection rules

---

## 4. Decisions to make (ADR list)

| ID | Decision | Options | Needed by | Owner |
|---|---|---|---|---|
| DEC-01 | Search engine | PostgreSQL FTS (launch) vs Meilisearch vs OpenSearch | Phase 0 | Tech lead |
| DEC-02 | Background jobs and worker host | Postgres queue (pg-boss) on a small container host vs managed queue | Phase 0 | Tech lead |
| DEC-03 | Free posting for private sellers | Free vs free with paid promotions only vs small fee per listing | Before beta | Product owner |
| DEC-04 | Realtime for chat and bids | Managed provider vs SSE from worker | Before R1 chat | Tech lead |
| DEC-05 | Payment model and PSP | Stripe Connect vs Baltic PSP (Montonio/Paysera); funds held by PSP only | Before R2 | Product owner with lawyer |
| DEC-06 | Object storage | Cloudflare R2 vs Backblaze B2 | Phase 0 | Tech lead |
| DEC-07 | Fee model | Hypotheses: no fee for browsing; success fee on escrow sales; buyer's premium on auctions; business subscriptions | Before R2 | Product owner |
| DEC-08 | Business subscription pricing | Tiered by listing quota and promotion credits | Before R4 | Product owner |
| DEC-09 | AI vendor for listing assistant | Model provider choice; cost cap per listing | Before R2 AI features | Tech lead |
| DEC-10 | Analytics tool | Privacy-friendly tool vs general analytics with consent | Before R1 launch | Product owner |
| DEC-11 | Mobile strategy | PWA only vs native apps after R2 | After R2 | Product owner |
| DEC-12 | Launch geography | Riga first vs Latvia-wide at launch | Phase 0 | Product owner |
| **DEC-13** | **Anti-sniping dynamic extension policy** | Strict 2-minute dynamic extension (eBay departure) vs hard close vs sealed bid | Before R3 | Product owner |
| **DEC-14** | **Auction fee split: Buyer's premium vs Seller commission** | Buyer's premium (e.g. 5%) vs Seller final value fee (10%) vs hybrid | Before R3 | Product owner |

---
*Maintained in synchronization with SellBuy.lv engineering cycles.*
