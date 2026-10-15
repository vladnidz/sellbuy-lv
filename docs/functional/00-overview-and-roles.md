# 00 — Overview, actors, roles, and permissions

Status: Draft · Owner: product owner · Last change: 15 Oct 2026

## 1. Purpose

SellBuy.lv lets people and businesses in Latvia sell second-hand goods, sell business equipment and surplus stock, and run auctions. Buyers can pay safely, have goods delivered or collected, and build trust through verified identity and reviews.

## 2. Scope by release

| Tag | Name | Scope |
|---|---|---|
| R1 | Classifieds MVP | Registration and login (Smart-ID, phone, email), categories, listings with photos and attributes, search and filters, saved searches, messaging, favourites, basic reviews, reporting, basic moderation |
| R2 | Trust and payments | Verification levels L2 and L3, structured offers, fraud scoring, escrow payments, payouts, Omniva and DPD shipping, returns, promotions, price history and comparables |
| R3 | Auctions | English auctions, proxy bidding, anti-sniping, reserve prices, buyer's premium, bidder verification, shill-bidding controls |
| R4 | Business | Company accounts and team roles, bulk upload, RFQ, sealed tenders, VAT invoices, business storefronts, freight |
| R5 | Intelligence and scale | AI listing assistant, condition grading, demand signals, feeds and API, native apps, further expansion |

Out of scope for every release: real estate, job advertisements, services, firearms and ammunition, medicines, live animals, and cryptocurrency. Real estate and jobs may be reconsidered after R5 as separate products.

## 3. Actors

| Actor | Description |
|---|---|
| Guest | Not signed in. Browses listings, search, public profiles, and public auction pages. |
| Member L0 | Signed in with email or magic link only. Not verified. |
| Member L1 | Phone number confirmed by SMS code. |
| Member L2 | Identity verified with Smart-ID. Can use escrow, restricted categories, and bid above the auction threshold. |
| Member L3 | Verified business. Required to publish business listings, run tenders, and use a business storefront. |
| Seller | A member with at least one listing. Any level. |
| Buyer | A member who has made an offer, bid, or purchase. |
| Bidder | A buyer who has placed at least one auction bid. |
| Company owner | Owns a company account. Manages members, billing, and settings. |
| Company manager | Manages listings and orders for the company. Cannot change ownership or billing. |
| Company editor | Creates and edits listings for the company. Publishing needs manager approval if the company sets that rule. |
| Company viewer | Reads company orders, listings, and reports. |
| Moderator M1 | Reviews reports, flagged listings, and appeals of standard cases. |
| Moderator M2 | Handles fraud, stolen goods, and legal cases. Views personal data for assigned cases only, with a logged reason. |
| Support agent | Answers tickets. Views user records with a logged reason. Cannot read message content unless the user consents or the law requires it. |
| Finance operator | Handles payouts, holds, refunds, and reconciliation. Four-eyes approval above threshold. |
| Admin | Manages taxonomy, flags, thresholds, and staff accounts. Cannot approve their own finance actions. |
| Auditor | Read-only access to audit logs and financial reports. |
| System | Worker processes and scheduled jobs. Act under their own service identities, never as a user. |

## 4. Verification levels

| Level | How obtained | Unlocks | Limits |
|---|---|---|---|
| L0 | Email or magic link | Browse, favourites, saved searches, messaging with rate limits | Up to 5 active listings. No payments, auctions, or restricted categories. |
| L1 | Phone number confirmed by SMS code | Messaging without rate limits, review writing, selling | Up to 20 active listings. No escrow, restricted categories, or auction bidding above the low-value threshold. |
| L2 | Smart-ID verification | Escrow, restricted categories, bidding above the auction threshold, paid promotions | Up to 100 active listings. No business listings. |
| L3 | Company verification (flow F-05) | Business listings, RFQ, tenders, business storefront, VAT invoices | Up to 1,000 active listings, subject to plan limits. |

Thresholds (listing counts, auction value limits) are configurable by admins and recorded in `03-business-rules.md`. The values here are starting proposals awaiting owner approval.

## 5. Permission matrix (summary)

Key: A = allowed; C = allowed with conditions (see notes); N = not allowed.

| Action | Guest | L0 | L1 | L2 | L3 | Company member | Moderator | Support | Finance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Browse and search | A | A | A | A | A | A | A | A | A | A |
| Create classified listing | N | C | A | A | A | C (editor or above) | N | N | N | N |
| Create business listing | N | N | N | N | A | C (editor or above) | N | N | N | N |
| Message a seller | N | C | A | A | A | A | N | N | N | N |
| Buy with escrow | N | N | N | A | A | C (role) | N | N | N | N |
| Bid in an auction | N | N | C | A | A | C (role) | N | N | N | N |
| Create an auction | N | N | C | A | A | C (editor or above) | N | N | N | N |
| Leave a review | N | N | A | A | A | A | N | N | N | N |
| Report content | A | A | A | A | A | A | A | A | A | A |
| Moderate reports | N | N | N | N | N | N | A (M1 or M2) | N | N | A |
| View a user's personal data | N | N | N | N | N | N | C (M2, assigned, logged) | C (logged) | C (logged) | A (logged) |
| Approve payouts | N | N | N | N | N | N | N | N | A (four-eyes) | A (not own) |
| Change taxonomy | N | N | N | N | N | N | N | N | N | A |
| Read audit log | N | N | N | N | N | N | N | N | N | A (Auditor: A) |

Notes:
- L0 listing and messaging are rate-limited. L1 bidding is limited to auctions the seller has opened to L1 bidders.
- Company members act only within their role and within the company's verification level.
- Moderators see personal data only for a case they are assigned to. Every view is logged with a reason.
- Every permission is enforced on the server. This table states intended behaviour. Each story that changes a permission includes a negative test.

## 6. Transaction types

| Type | Seller | Buyer | Typical goods | Payment |
|---|---|---|---|---|
| C2C | Private member | Private member | Used household goods, electronics, clothing | Direct agreement in R1; escrow optional in R2 |
| B2C | Business member (L3) | Private member | Refurbished goods, surplus stock | Escrow. Withdrawal rights apply. |
| B2B | Business member (L3) | Business member (L3) | Equipment, lots, surplus | Escrow or invoice. VAT invoices. |
| Auction | Verified seller in an auction-eligible category | Verified bidder | Collectibles, instruments, equipment | Winner payment window, escrow |

## 7. Item lifecycle (summary)

Draft, then pending review (only if a rule triggers it), then active, then reserved (an accepted offer or winning bid awaits payment), then sold, expired, removed, or archived. Full state machines are in `02-user-flows.md` and `technical/02-data-model.md`.

## 8. Definition of Ready for a story

A story is ready when:
1. It has a persona, a goal, and testable acceptance criteria.
2. Its priority, size, and release tag are set.
3. Its dependencies are done or in progress.
4. Any new screen has a design, or the design is part of the story within a time box.
5. Analytics events are named in `technical/09-testing-release-ops.md`.
6. The legal flag is set if the story touches money, personal data, auctions, or moderation.
7. Translation keys are planned in Latvian, Russian, and English.

## 9. Glossary (product terms)

- **Escrow hold:** funds held by the payment provider until release conditions are met.
- **Reserved:** a listing or auction with an accepted offer or winning bid, awaiting payment.
- **Verification level:** L0 to L3 as defined in section 4.
- **Business storefront:** a public page for a company account showing its listings, reviews, and badges.
