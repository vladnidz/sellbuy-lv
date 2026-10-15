# 03 — API specification

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026

The public API is used by the web application and, later, by mobile clients and business integrations. Internal server actions follow the same service layer and the same error codes.

## 1. Conventions

- Base path: `/api/v1`. Breaking changes require `/api/v2`.
- Format: JSON in and out, UTF-8, `Content-Type: application/json`.
- Authentication: session cookie for browsers; bearer token (scoped API key) for business integrations (R4).
- IDs: UUIDv7 strings.
- Money: integer minor units plus currency: `{ "amount": 12345, "currency": "EUR" }` means 123.45 €.
- Timestamps: ISO 8601 UTC with `Z`.
- Language: `Accept-Language` header selects localised content (`lv`, `ru`, `en`); default `lv`.

### 1.1 Response envelope

Success:
```json
{ "data": { ... }, "meta": { "request_id": "req_01J..." } }
```

Paginated:
```json
{ "data": [ ... ], "meta": { "request_id": "...", "next_cursor": "eyJpZCI6..." } }
```

Error:
```json
{
  "error": {
    "code": "BID_TOO_LOW",
    "message": "Bid rejected. The minimum next bid is 45,00 €.",
    "details": { "minimum_next_bid": { "amount": 4500, "currency": "EUR" } },
    "field": null
  },
  "meta": { "request_id": "..." }
}
```

`message` is localised. `code` is stable and is what clients branch on.

### 1.2 Stable error codes (initial set)

| Code | HTTP | Meaning |
|---|---|---|
| UNAUTHENTICATED | 401 | No valid session |
| FORBIDDEN | 403 | Authenticated but not allowed |
| VERIFICATION_REQUIRED | 403 | Needs a higher verification level; details include the level |
| NOT_FOUND | 404 | Resource not found or not visible to caller |
| VALIDATION_FAILED | 422 | Field errors; `details.fields` lists them |
| CONFLICT | 409 | State conflict (for example, listing already reserved) |
| IDEMPOTENCY_KEY_REUSED | 409 | Same key used with a different body |
| RATE_LIMITED | 429 | Retry after `Retry-After` seconds |
| LISTING_LIMIT_REACHED | 403 | Active listing limit for verification level |
| LISTING_EXPIRED | 409 | Action not possible on an expired listing |
| PROHIBITED_ITEM | 422 | Listing violates a prohibited-item rule (message does not repeat the term) |
| BID_TOO_LOW | 409 | Bid below minimum next bid |
| AUCTION_CLOSED | 409 | Auction is not open |
| AUCTION_NOT_ELIGIBLE | 403 | Bidder or seller not eligible |
| SELLER_CANNOT_BID | 403 | Seller bid on own auction |
| OFFER_EXPIRED | 409 | Offer validity passed |
| ORDER_STATE_INVALID | 409 | Transition not allowed from current state |
| PAYMENT_FAILED | 402 | Payment provider declined; message is generic |
| PAYMENT_PENDING | 202 | Payment in progress |
| UPLOAD_INVALID | 422 | File type, size, or content not accepted |
| INTERNAL_ERROR | 500 | Unexpected; `request_id` included for support |

## 2. Idempotency

- Every state-changing request that moves money or changes an order, auction, or offer requires `Idempotency-Key` (UUID, client-generated).
- The server stores the key, request hash, response, and status for 24 hours.
- Same key and same body: returns the stored response, with header `Idempotent-Replayed: true`.
- Same key and different body: `IDEMPOTENCY_KEY_REUSED`.
- Bids use the key as a deduplication key in the bid table.

## 3. Pagination and filtering

- Cursor-based. Parameters: `limit` (default 24, maximum 100), `cursor`.
- Sorting: `sort=newest|price_asc|price_desc|distance|relevance|ending_soonest`, applicable where meaningful.
- Filters: `filter[category]=C02.01`, `filter[price_min]=...`, attribute filters `filter[attr.storage_gb]=256`.

## 4. Rate limits (proposal)

| Scope | Limit |
|---|---|
| Anonymous browsing | 300 requests per minute per IP |
| Authenticated browsing | 600 requests per minute per user |
| Sign-in attempts | 5 per 15 minutes per identifier and per IP |
| OTP sends | 3 per hour per phone number |
| Message sends | Per verification level (`01-categories.md`, business rules section 1) |
| Bids | 30 per minute per user per auction |
| Listing creation | 10 per hour per user |
| Image uploads | 60 per hour per user |
| Business API | Per key, plan-based (R4) |

Rate-limit headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

## 5. Endpoints

Access column: G = guest, M = member (any level), L1, L2, L3 = minimum level, C = company member with role, S = staff with role, W = webhook signature, T = API key with scope.

### 5.1 Identity and sessions (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /auth/smart-id/sessions | G | Start Smart-ID authentication or registration | US-01.01 |
| GET | /auth/smart-id/sessions/{id} | G | Poll Smart-ID status | US-01.01 |
| POST | /auth/phone/codes | G | Send SMS code | US-01.02 |
| POST | /auth/phone/codes/{id}/verify | G | Verify SMS code | US-01.02 |
| POST | /auth/email/links | G | Send magic link | US-01.03 |
| POST | /auth/email/links/verify | G | Consume magic link | US-01.03 |
| POST | /auth/sessions/rotate | M | Rotate session (internal use) | US-01.10 |
| DELETE | /auth/session | M | Sign out current session | US-01.10 |
| GET | /auth/sessions | M | List active sessions | US-01.10 |
| DELETE | /auth/sessions/{id} | M | End a session | US-01.10 |
| POST | /auth/recovery | G | Start recovery (same response either way) | F-03 |

### 5.2 Account and profile (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /me | M | Own profile and verification status | US-01.07 |
| PATCH | /me | M | Update display name, language, notifications | US-01.07 |
| GET | /users/{id}/profile | G | Public profile | US-01.04 |
| POST | /me/verification/smart-id | M | Start L2 verification | US-01.05 |
| POST | /me/blocks | M | Block user | US-01.09 |
| DELETE | /me/blocks/{userId} | M | Unblock user | US-01.09 |
| POST | /me/data-exports | M | Request export | US-01.08 |
| POST | /me/deletion | M | Request deletion (cooldown) | US-01.08 |
| DELETE | /me/deletion | M | Cancel deletion | US-01.08 |
| POST | /companies | L2 | Create company account (starts L3 flow) | US-01.06 |
| GET | /companies/{id} | G | Public company storefront data | US-10.08 |
| PATCH | /companies/{id} | C (owner) | Update company | US-10.01 |
| POST | /companies/{id}/members | C (owner) | Invite member | US-10.02 |
| PATCH | /companies/{id}/members/{memberId} | C (owner) | Change role | US-10.02 |
| DELETE | /companies/{id}/members/{memberId} | C (owner) | Remove member | US-10.02 |

### 5.3 Catalogue and categories (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /categories | G | Category tree (cached) | US-02.01 |
| GET | /categories/{code} | G | Category with flags and template | US-02.01 |
| GET | /categories/{code}/attributes | G | Attribute definitions | US-02.02 |
| GET | /brands | G | Brand catalogue (filter by family) | US-02.02 |
| GET | /brands/{brandId}/models | G | Model catalogue for brand | US-02.02 |
| GET | /search/categories?q= | G | Category search with aliases | US-02.06 |
| POST | /admin/categories | S (admin) | Create category | US-02.07 |
| PATCH | /admin/categories/{code} | S (admin) | Update category | US-02.07 |
| POST | /admin/categories/{code}/move | S (admin) | Move listings and retire | US-02.07 |

### 5.4 Listings (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /listings | M | Create draft | US-03.01 |
| GET | /listings/{id} | G (public fields) or owner | Read listing | US-03.01 |
| PATCH | /listings/{id} | Owner | Edit draft or active listing | US-03.06 |
| POST | /listings/{id}/publish | Owner | Submit for publication | US-03.01 |
| POST | /listings/{id}/renew | Owner | Renew | US-03.05 |
| POST | /listings/{id}/bump | Owner | Free bump | US-11.01 |
| POST | /listings/{id}/mark-sold | Owner | Mark sold | US-03.05 |
| POST | /listings/{id}/archive | Owner | Archive | US-03.05 |
| POST | /listings/{id}/restore | Owner | Restore from archive | US-03.05 |
| DELETE | /listings/{id} | Owner | Delete draft | US-03.01 |
| POST | /listings/{id}/images | Owner | Create signed upload URL | US-03.02 |
| POST | /listings/{id}/images/{imageId}/complete | Owner | Confirm upload and start processing | US-03.02 |
| PATCH | /listings/{id}/images/order | Owner | Reorder | US-03.02 |
| DELETE | /listings/{id}/images/{imageId} | Owner | Remove image | US-03.02 |
| POST | /listings/{id}/report | M or G | Report listing | US-06.02 |
| GET | /listings/{id}/similar | G | Similar items | US-04.08 |
| GET | /listings/{id}/price-context | G | Comparables and fair-price (R2) | US-12.02, US-12.03 |
| POST | /listings/bulk | L3 | Bulk upload job (R4) | US-10.03 |
| GET | /listings/bulk/{jobId} | L3 | Bulk job report | US-10.03 |
| POST | /listings/drafts/ai-suggest | L1 | AI listing suggestions (R2 or later) | US-12.05 |

### 5.5 Search and alerts (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /search/listings | G | Search with filters and sort | US-04.01 to US-04.03 |
| GET | /search/listings/facets | G | Facet counts for current query | US-04.02 |
| GET | /search/listings/map | G | Clustered map points | US-04.05 |
| GET | /search/suggest?q= | G | Typo and correction suggestions | US-04.06 |
| POST | /me/saved-searches | M | Save search | US-04.04 |
| GET | /me/saved-searches | M | List saved searches | US-04.04 |
| PATCH | /me/saved-searches/{id} | M | Update frequency or name | US-04.04 |
| DELETE | /me/saved-searches/{id} | M | Delete | US-04.04 |
| POST | /me/favourites/{listingId} | M | Favourite | US-04.10 |
| DELETE | /me/favourites/{listingId} | M | Unfavourite | US-04.10 |
| GET | /me/favourites | M | List favourites | US-04.10 |
| GET | /me/recommendations | L1 | Personalised feed (R2) | US-04.07 |

### 5.6 Conversations and offers (R1, R2)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /conversations | M | Start conversation about listing | US-05.01 |
| GET | /conversations | M | List own conversations | US-05.01 |
| GET | /conversations/{id} | Participant | Conversation with messages (paginated) | US-05.01 |
| POST | /conversations/{id}/messages | Participant | Send message | US-05.01 |
| POST | /conversations/{id}/read | Participant | Mark read | US-05.01 |
| POST | /conversations/{id}/mute | Participant | Mute | US-05.08 |
| POST | /conversations/{id}/archive | Participant | Archive | US-05.08 |
| POST | /conversations/{id}/phone-reveal | Participant | Reveal phone (logged) | US-05.03 |
| POST | /listings/{id}/offers | Buyer | Make offer | US-05.04 |
| POST | /offers/{id}/accept | Seller | Accept | US-05.04 |
| POST | /offers/{id}/decline | Seller | Decline | US-05.04 |
| POST | /offers/{id}/counter | Seller | Counter offer | US-05.04 |
| POST | /offers/{id}/withdraw | Buyer | Withdraw | US-05.04 |

### 5.7 Orders and escrow (R2)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /orders | L2 (buyer) | Create order from fixed price or accepted offer. Requires `Idempotency-Key` | US-07.01 |
| GET | /orders/{id} | Participant | Order detail with timeline | US-08.06 |
| POST | /orders/{id}/payment-session | Buyer | Start hosted payment | US-07.01 |
| POST | /orders/{id}/cancel | Buyer or seller (rules) | Cancel before shipment | US-07.09 |
| POST | /orders/{id}/ship | Seller | Mark shipped with shipment data | US-08.01 |
| POST | /orders/{id}/confirm-receipt | Buyer | Confirm receipt | US-07.02 |
| POST | /orders/{id}/confirm-handover | Seller or buyer | Confirm local pickup | US-08.04 |
| POST | /orders/{id}/disputes | Buyer | Open dispute | US-07.08 |
| POST | /disputes/{id}/evidence | Participant | Add evidence | US-07.08 |
| POST | /disputes/{id}/respond | Seller | Respond with resolution | US-07.08 |
| GET | /me/orders | M | Orders as buyer or seller | US-07.02 |
| POST | /webhooks/psp | W | PSP webhook receiver | US-07.01 |
| POST | /webhooks/carriers/{carrier} | W | Carrier tracking events | US-08.06 |

### 5.8 Shipping (R2)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /shipping/points?carrier=&lat=&lng= | G | Pickup points | US-08.05 |
| GET | /shipping/quote | M | Quote for listing and destination | US-08.03 |
| PUT | /me/shipping-profiles/{id} | Seller | Shipping profile | US-08.03 |
| POST | /orders/{id}/labels | Seller | Create carrier label | US-08.01, US-08.02 |
| GET | /orders/{id}/labels/{labelId} | Seller | Download label | US-08.01 |

### 5.9 Payouts and finance (R2)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /me/payout-account | M | Payout status (masked IBAN) | US-07.03 |
| PUT | /me/payout-account | L2 | Set payout account (validated) | US-07.03 |
| GET | /me/balance | M | Balance and pending amounts | US-11.03 |
| GET | /me/payouts | M | Payout history | US-07.03 |
| POST | /admin/payouts/{id}/approve | S (finance, four-eyes) | Approve payout batch | US-13.03 |
| POST | /admin/holds | S (finance) | Place hold with reason | US-13.03 |
| GET | /admin/reconciliation/{date} | S (finance, auditor) | Reconciliation report | US-07.07 |

### 5.10 Auctions (R3)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /listings/{id}/auction | Seller (L1 or L2 by value) | Create auction configuration | US-09.01 |
| GET | /auctions/{id} | G | Public auction state (current price, status, end time) | US-09.09 |
| POST | /auctions/{id}/bids | L1 or L2 (per threshold) | Place bid. Requires `Idempotency-Key` | US-09.02, US-09.03 |
| GET | /auctions/{id}/bids | G | Bid history with pseudonymous IDs | US-09.10 |
| GET | /me/bids | M | Own bids and status | US-09.09 |
| POST | /auctions/{id}/bids/{bidId}/retract | Bidder | Request retraction | US-09.15 |
| POST | /auctions/{id}/buy-now | L2 | Buy now (creates order) | US-09.07 |
| POST | /auctions/{id}/second-chance | Seller | Offer second chance | US-09.14 |
| POST | /auctions/{id}/cancel | Seller or staff (reason) | Cancel | US-13.06 |
| GET | /auctions/{id}/analytics | Seller | Seller analytics | US-09.16 |
| POST | /admin/auctions/{id}/extend | S (auction ops) | Extend with reason | US-13.06 |
| POST | /admin/bids/{bidId}/remove | S (auction ops) | Remove bid with reason | US-09.17 |

### 5.11 Business (R4)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /rfqs | L3 | Create RFQ | US-10.05 |
| GET | /rfqs | L3 | List own RFQs or RFQs to respond to | US-10.05 |
| POST | /rfqs/{id}/responses | L3 | Respond | US-10.05 |
| POST | /rfqs/{id}/responses/{responseId}/accept | L3 (buyer) | Accept response and create order | US-10.05 |
| POST | /tenders | L3 | Create tender | US-10.06 |
| POST | /tenders/{id}/bids | L3 | Submit sealed bid | US-10.06 |
| GET | /tenders/{id}/result | Seller (after deadline) | Result | US-10.06 |
| POST | /invoices | L3 | Create invoice (business) | US-10.07 |
| GET | /invoices/{id}.pdf | Participant | Invoice PDF | US-10.07 |
| POST | /invoices/{id}/credit-notes | L3 | Credit note | US-10.07 |
| GET | /v1/feeds/{companyId}.xml | T (scope feed:read) | Product feed | US-10.09 |
| POST | /api-keys | C (owner) | Create scoped API key | US-10.09 |
| DELETE | /api-keys/{id} | C (owner) | Revoke | US-10.09 |

### 5.12 Promotions and advertising (R2)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /promotion-packages | M | Available packages and prices | US-11.02 |
| POST | /listings/{id}/promotions | Owner, L2 | Buy promotion. Requires `Idempotency-Key` | US-11.02 |
| GET | /me/promotions | M | Promotions and spend | US-11.02 |

### 5.13 Moderation, reports, and appeals (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /reports | M or G | Report content or user | US-06.02 |
| GET | /admin/moderation/cases | S (M1 or M2) | Queue | US-13.01 |
| GET | /admin/moderation/cases/{id} | S (M1 or M2, assigned) | Case detail (logs access) | US-13.01 |
| POST | /admin/moderation/cases/{id}/actions | S (M1 or M2) | Take action (reason required) | US-13.01 |
| POST | /appeals | Affected user | Appeal | US-06.04 |
| POST | /admin/appeals/{id}/decide | S (different moderator) | Decide appeal | US-06.04 |
| POST | /admin/users/{id}/enforcements | S (M2) | Apply enforcement | US-06.06 |
| POST | /legal/requests | S (legal) | Register law-enforcement request | US-06.07 |
| POST | /dsa/notices | G | Rights-holder notice | US-15.03 |

### 5.14 Reviews (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /orders/{id}/reviews | Participant | Write review | US-06.01 |
| POST | /reviews/{id}/reply | Reviewed party | Reply once | US-06.01 |
| POST | /reviews/{id}/report | M | Report review | US-06.02 |
| GET | /users/{id}/reviews | G | Reviews received | US-06.01 |

### 5.15 Notifications and consent (R1)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| GET | /me/notifications | M | Notification centre | US-14.01 |
| POST | /me/notifications/read | M | Mark read | US-14.01 |
| GET | /me/notification-preferences | M | Preferences | US-14.02 |
| PUT | /me/notification-preferences | M | Update preferences (security notices fixed) | US-14.02 |
| POST | /me/push-subscriptions | M | Register web push subscription | US-14.01 |
| GET | /me/consents | M | Consent history | US-15.01 |
| POST | /me/consents | M | Record consent version | US-15.01 |

### 5.16 Support and content (R1, R2)

| Method | Path | Access | Purpose | Story |
|---|---|---|---|---|
| POST | /support/tickets | M or G | Create ticket | US-13.07 |
| GET | /support/tickets | M | Own tickets | US-13.07 |
| GET | /content/{slug}?locale= | G | Help and legal content | US-13.05 |

### 5.17 Internal endpoints (not public)

Worker and administration endpoints are not exposed on the public API. They run inside the worker process or behind the staff gateway with separate authentication. Listed for completeness:
- Job triggers (manual re-run of a job, with reason).
- Feature flag management.
- Taxonomy import and export.
- Index rebuild.

## 6. Webhooks (outbound, R4)

Business integrations can subscribe to events: `listing.updated`, `order.paid`, `order.shipped`, `order.completed`, `review.received`.

- Signed with HMAC-SHA256 and a per-subscription secret. Header: `SellBuy-Signature: t=<timestamp>,v1=<hex>`.
- Retries for 24 hours with exponential backoff. Delivery is at least once; receivers must deduplicate using `event_id`.
- Payloads contain identifiers and status, not personal data.

## 7. Versioning and deprecation

- Additive changes (new optional fields, new endpoints) do not change the version.
- Removed fields or changed meanings require a new version path.
- Deprecated endpoints return the header `Sunset` with the date and a link to the migration note. Minimum notice: 90 days.
