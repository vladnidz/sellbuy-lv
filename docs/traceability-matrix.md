# SellBuy.lv — Traceability Matrix

> Alignment of Strategic Objectives → Functional Requirements → Epics/Stories → Implementation Tasks → Test Suites → Target Release.

---

| Objective | Requirement | User Story | Task / Component File | Test Suite | Release | Status |
|---|---|---|---|---|---|---|
| **Zero-Friction Baltic C2C Classifieds** | Multilingual 4-level category navigation | **US-02.01** | `app/categories/page.tsx`, `categories-client.tsx`, `prisma/deep-taxonomy-seed.ts` | `__tests__/api-categories-tree.test.ts` | R1 | **VERIFIED** |
| **Instant Buyer-Seller Deal Velocity** | Real-time chat & in-app messaging | **US-05.01** | `app/api/chats/route.ts`, `app/api/chats/[id]/messages/route.ts`, `app/messages/page.tsx`, `app/messages/[id]/page.tsx` | `__tests__/api-chat-messages.test.ts`, `__tests__/api-chats.test.ts` | R1 | **VERIFIED** |
| **Instant Buyer-Seller Deal Velocity** | Latvian, Russian, English Quick Replies | **US-05.02** | `app/messages/[id]/page.tsx` | `__tests__/api-chat-messages.test.ts` | R1 | **VERIFIED** |
| **Structured Trust & Safety** | Smart-ID, Phone OTP, & Vehicle CSDD/VIN Verification | **US-01.05** | `components/vehicle-verification-card.tsx`, `components/vehicle-search-widget.tsx`, `app/api/users/verify/route.ts` | `__tests__/api-user-verification.test.ts` | R1 | **VERIFIED** |
| **Discovery & Deal Alerts** | Saved searches & filter query notifications | **US-04.04** | `app/api/saved-searches/route.ts`, `components/save-search-button.tsx`, `app/saved-searches/page.tsx` | `__tests__/api-saved-searches.test.ts` | R1 | **VERIFIED** |
| **Reputation & Counterparty Safety** | User reviews, ratings aggregation, and verification badges | **US-06.01** | `app/api/ratings/route.ts`, `components/rating-form.tsx`, `app/api/users/[id]/route.ts` | `__tests__/api-ratings.test.ts` | R1 | **VERIFIED** |
| **Fair Price Discovery & Liquidation** | Timed English auctions with automated proxy bidding | **US-09.01**, **US-09.02** | `docs/functional/auctions.md`, `prisma/schema.prisma` | Pending R3 test harness | R3 | **SPECIFIED** |
| **Anti-Sniping Bot Protection** | 2-minute dynamic closing window reset | **US-09.04** | `docs/functional/auctions.md` (DEC-13) | Pending R3 test harness | R3 | **SPECIFIED** |
| **Safe Money Movement** | Escrow funds hold and delivery-confirmed release | **US-07.02** | `app/api/transactions/route.ts`, `components/escrow-checkout.tsx` | `__tests__/api-transactions.test.ts` | R2 | **INITIALIZED** |
| **Local Logistics** | Omniva & DPD parcel locker picker & label generation | **US-08.01**, **US-08.02** | `components/delivery-picker.tsx`, `app/api/delivery/route.ts` | `__tests__/api-delivery.test.ts` | R2 | **INITIALIZED** |
