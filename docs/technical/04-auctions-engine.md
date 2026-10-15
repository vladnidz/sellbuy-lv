# 04 — Auctions engine

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026 · Release: R3

This document specifies how auctions are created, how bids are accepted, how proxy bids are resolved, how anti-sniping works, and how auctions close. The rules come from `functional/03-business-rules.md` section 6. The stories are US-09.01 to US-09.17.

Principles:
- The database is the source of truth. The current price and the leading bid are updated in the same transaction that accepts the bid.
- Bids never depend on client-side state. The client sends an amount and an idempotency key. The server decides.
- Every rule that determines a winner lives in `packages/domain` as a pure function with property-based tests.
- Closing is idempotent and recoverable.

---

## 1. Auction states

```
           create
             │
             ▼
        SCHEDULED ──start time──▶ LIVE ◀───────────┐
                                    │ bid in anti-snipe window: extend (repeatable)
                                    │
                         end time (after extensions)
                                    ▼
                                CLOSING  (advisory lock, outcome computed)
                                    │
     ┌──────────────┬───────────────┼────────────────────┐
     ▼              ▼               ▼                    ▼
   NO_BIDS    RESERVE_NOT_MET     WON (reserve met)   ENDED (cancelled after close)
     │              │               │
     ▼              ▼               ▼
  (relist)     SECOND_CHANCE     PAID (payment captured)
                 │   │            │
                 ▼   ▼            ▼
               WON  ENDED     COMPLETED (receipt confirmed, funds released)

  Any state before CLOSING ──cancel by staff or seller (with reason)──▶ CANCELLED
```

The extension count is a counter on the auction, not a state. `endsAt` moves forward with each extension, up to `maxExtensions`.

Transitions are implemented in `packages/domain/auction/state.ts`. Each transition takes the current state and an event and returns the next state or throws `ILLEGAL_TRANSITION`. Database writes enforce the same transitions with a `WHERE status = <expected>` clause.

---

## 2. Auction creation

Inputs (validated by Zod, then by domain rules):
- `listingId`, owned by the caller, in `DRAFT` or `ACTIVE`.
- `startingPrice` (minor units, at least 100 cents).
- `reservePrice` (optional; must be at least `startingPrice`).
- `buyNowPrice` (optional; must be greater than `reservePrice` if set, and greater than `startingPrice`).
- `durationDays` in {1, 3, 5, 7, 10}.
- `startsAt` (now or up to 14 days ahead, rounded to the minute).
- `incrementLadderId` (default ladder; alternatives from an approved list only).
- `ruleVersion` (the latest approved version; the seller accepts this version).

Rules checked:
- Category has `auctionEligible = true`.
- Seller's verification level meets the category and value rules (business rules section 6.1 and 6.2).
- Listing is not already linked to an auction.
- Authentication is required when the category flags it and the starting price is at or above the authentication threshold; the auction is created with `status = SCHEDULED` but the worker does not start it until the authentication task is approved.

Effects, in one transaction:
- Insert `Auction` with `status = SCHEDULED`, `endsAt = startsAt + durationDays`, `originalEndsAt = endsAt`, `currentPrice = startingPrice`.
- Insert `AuctionAcceptance` for the seller with `ruleVersion`.
- Update `Listing.status` to `ACTIVE` if it was a draft and passed the rule engine.
- Insert `AuditEvent` (`auction.created`).
- Insert `OutboxEvent` (`auction.scheduled`).
- Enqueue a worker job `auction.start` at `startsAt` and `auction.close` at `endsAt`, both with job keys `auction:{id}:start` and `auction:{id}:close`.

---

## 3. Increment ladder

The ladder is a list of bands ordered by price. For a current price `p`, the increment is the band's increment where `band.from <= p < band.to`.

```ts
type Band = { from: number; to: number | null; increment: number }; // minor units
const DEFAULT_LADDER: Band[] = [
  { from: 0,      to: 10000,  increment: 100 },   // 0 to 99.99 €: 1 €
  { from: 10000,  to: 50000,  increment: 500 },   // 100 to 499.99 €: 5 €
  { from: 50000,  to: 100000, increment: 1000 },  // 500 to 999.99 €: 10 €
  { from: 100000, to: 500000, increment: 2500 },  // 1,000 to 4,999.99 €: 25 €
  { from: 500000, to: null,   increment: 5000 },  // 5,000 € and above: 50 €
];

function incrementFor(price: number, ladder: Band[]): number { /* first band where from <= price < to */ }

function minimumNextBid(currentPrice: number, ladder: Band[], hasLeader: boolean): number {
  // With no bids yet, the minimum is the starting price itself.
  // With a leader, the minimum is current price plus the increment for the current price.
}
```

Property tests (fast-check) must verify:
- The minimum next bid is strictly greater than the current price whenever there is a leader.
- Increments are monotonic non-decreasing across bands.
- Ladders with overlapping or gapped bands are rejected at configuration time.

---

## 4. Proxy resolution

### 4.1 Definitions

- Each accepted bid has a `maxAmount` (the bidder's maximum) and a sequence number (`sequence`, monotonic per auction).
- The auction's leader is the bid with the highest `maxAmount`. For equal maxima, the earlier `sequence` wins.
- The visible current price is the lower of:
  - the leader's `maxAmount`, or
  - the second-highest distinct bidder's maximum plus one increment for that price.
- When only one bidder has bid, the visible price is the starting price (or the minimum opening bid if the seller set one).

### 4.2 Algorithm (pure function)

```ts
type ProxyState = { leader: { bidderId: string; max: number; seq: bigint } | null;
                    runnerUp: { bidderId: string; max: number } | null;
                    currentPrice: number; };

function resolve(bids: Bid[], start: number, ladder: Band[]): ProxyState {
  // 1. Keep only the highest maximum per bidder (a bidder may not outbid themselves).
  // 2. Sort by max desc, seq asc. The first is the leader.
  // 3. The second entry (different bidder) is the runner-up.
  // 4. If no runner-up: currentPrice = start (no competing bids).
  // 5. If runner-up exists:
  //      candidate = runnerUp.max + increment(runnerUp.max, ladder)
  //      currentPrice = min(candidate, leader.max)
  //    If candidate exceeds leader.max, the leader wins at leader.max.
}
```

Checks:
- A new bid by the current leader raises their maximum but does not change the visible price, unless the new maximum changes the outcome against the runner-up.
- A new bid by someone else that is lower than the leader's maximum causes the visible price to rise by at least one increment, to the runner-up plus increment, capped at the leader's maximum.
- A new bid by a challenger above the leader's maximum makes the challenger the leader; the visible price becomes the previous leader's maximum (capped by the challenger's maximum).

### 4.3 What is stored

- `Bid.maxAmount`: the submitted maximum.
- `Bid.visibleAmount`: the visible price produced by the bid, if the bid led at that moment, otherwise the price at that moment.
- `Auction.currentPrice`: the latest visible price.
- `Auction.leadingBidId`: the current leader.

Recomputation on each accepted bid is O(n) in bidders but bounded: for each auction the function reads only the highest maximum per bidder (indexed on `(auctionId, bidderId)` via a materialised summary, see section 5.4).

---

## 5. Accepting a bid

### 5.1 Request

`POST /auctions/{id}/bids` with `Idempotency-Key` header and body:
```json
{ "maxAmount": { "amount": 25000, "currency": "EUR" } }
```

### 5.2 Steps

1. Validate input (Zod): amount is an integer, currency EUR, amount within 1 to 10,000,000 minor units.
2. Authorise: caller is authenticated; verification level meets the auction threshold (`L2` above the threshold, `L1` below); caller is not the seller; caller is not linked to the seller (`LinkedAccountFlag`); caller is not restricted or suspended.
3. Check idempotency: if `(auctionId, idempotencyKey)` already exists, return the stored result.
4. Open a transaction at `READ COMMITTED` with `SELECT ... FOR UPDATE` on the `Auction` row. The row lock serialises bids for the same auction.
5. Check state: `status = LIVE` and `now < endsAt` (using the database clock).
6. Check minimum: compute `minimumNextBid` from the locked current price and ladder. If `maxAmount < minimumNextBid`, rollback with `BID_TOO_LOW` and the minimum in the error details.
7. Check the bidder is not the seller and has no conflicting rule (already checked in step 2; repeated under the lock for safety).
8. Insert the bid with `sequence = nextval` for the auction (a per-auction counter column is locked and incremented in the same transaction).
9. Resolve proxy state with the locked bid set (section 4).
10. Update `Auction.currentPrice`, `leadingBidId`, `bidCount`. Set `version = version + 1`.
11. Anti-sniping check (section 6). If triggered, update `endsAt` and `extensionCount` in the same transaction.
12. Insert `AuditEvent` (`bid.accepted`) and `OutboxEvent` (`auction.bid_accepted`) with the new state.
13. Commit.
14. After commit, the outbox publisher pushes the realtime event and enqueues outbid notices.

### 5.3 The conditional write pattern

When the lock is not used (for example in a future high-throughput path), the same guarantee comes from a conditional update:

```sql
UPDATE "Auction"
SET    "currentPrice" = $newPrice,
       "leadingBidId" = $bidId,
       "bidCount"     = "bidCount" + 1,
       "version"      = "version" + 1,
       "updatedAt"    = now()
WHERE  "id" = $auctionId
  AND  "status" = 'LIVE'
  AND  now() < "endsAt"
  AND  "version" = $expectedVersion
RETURNING "currentPrice", "endsAt", "version";
```

If zero rows are returned, the application re-reads and retries (up to 3 times with jitter), then fails with `CONFLICT`. The lock-based path is the default; the conditional update is documented as the fallback.

### 5.4 Summary table for proxy resolution

To avoid scanning all bids for each request, `BidderMaxSummary` holds the highest maximum per bidder for each auction. It is updated in the same transaction as the bid. The model is defined in `02-data-model.md` section 9.

```prisma
model BidderMaxSummary {
  auctionId String @db.Uuid
  bidderId  String @db.Uuid
  maxAmount Int
  sequence  BigInt
  @@id([auctionId, bidderId])
  @@index([auctionId, maxAmount, sequence])
}
```

---

## 6. Anti-sniping

Rules (from `03-business-rules.md` section 6.5):
- Window: the final `antiSnipeWindowSeconds` (default 120) before `endsAt`.
- Extension: `endsAt = now + antiSnipeExtensionSeconds` (default 120) when a bid is accepted inside the window. Note: the extension is set from the bid time, not added to the original end, so repeated bids keep extending.
- Cap: `extensionCount <= maxExtensions` (default 10). After the cap, no further extension.
- Visibility: extensions appear in bid history and in the countdown.

Pseudocode:
```ts
const inWindow = (endsAt - now) <= windowSeconds * 1000 && now < endsAt;
if (inWindow && extensionCount < maxExtensions) {
  newEndsAt = now + extensionSeconds * 1000;
  extensionCount += 1;
} else {
  newEndsAt = endsAt;
}
```

Edge cases:
- Two bids in the same second: the lock serialises them; the second one sees the first's extension.
- A bid exactly at `endsAt`: rejected (`AUCTION_CLOSED`), since the check is `now < endsAt`.
- Clock skew: all time comparisons use the database clock (`now()`), never the client clock.

Property tests: the auction end time after any sequence of accepted bids is monotonic non-decreasing, and extensions never exceed the cap.

---

## 7. Closing

### 7.1 Scheduling

- The `auction.close` job is scheduled at `endsAt`. When an extension happens, the job is rescheduled with the same key (`auction:{id}:close`), replacing the old schedule.
- A reconciliation job runs every 60 seconds and closes any auction with `status IN (LIVE, CLOSING)` and `endsAt < now() - 5 seconds`.

### 7.2 Steps (idempotent)

1. Acquire an advisory lock: `pg_try_advisory_xact_lock(hashtext('auction:' || id))`. If not acquired, exit (another worker is closing).
2. Re-read the auction. If `status` is not `LIVE` or `CLOSING`, or if `closedAt` is set, exit. This makes repeated runs harmless.
3. Check `now() >= endsAt`. If the auction was extended after scheduling, reschedule and exit.
4. Set `status = CLOSING`.
5. Compute outcome from committed bids:
   - No bids: `NO_BIDS`.
   - Leader's maximum (or visible price, per the proxy rules) at or above `reservePrice` (or no reserve): `WON` with `winnerId`, `hammerPrice = visible price at close`.
   - Otherwise: `RESERVE_NOT_MET`.
6. In one transaction:
   - Update `Auction` (`status`, `closedAt`, `outcomeRecordedAt`).
   - For `WON`: create `Order` in `AWAITING_PAYMENT` with `buyersPremiumAmount` and `totalAmount` computed by the fee engine, `paymentDeadlineAt = now + 48h`, `offerId = null`, `auctionId`.
   - For `WON`: set `Listing.status = RESERVED`.
   - For `RESERVE_NOT_MET`: set `status`, keep `Listing` in `ACTIVE`, create a second-chance task.
   - Insert `AuditEvent` (`auction.closed`) and outbox events (`auction.won`, `auction.reserve_not_met`, `auction.no_bids`).
7. Commit. The outbox publisher sends notices.
8. Release the advisory lock (automatic at transaction end).

### 7.3 Reserve evaluation

- Reserve is compared to the visible price at close, which equals the leader's maximum or the runner-up plus increment (capped), per section 4.
- Example: starting price 100 €, reserve 500 €. Leader max 600 €, runner-up max 450 €. Visible price = min(450 + 5 = 455, 600) = 455 €, since 450 € falls in the 100 € to 499.99 € band, whose increment is 5 €. 455 € is below the reserve, so the reserve is not met, even though the leader's maximum is above it.

This is a real edge case. The rule must be stated to bidders in the auction terms: the reserve is compared with the visible price, which is the price the winner would pay. The alternative (comparing with the leader's maximum) is an owner decision, recorded as DEC-13 once the decision is made. Until then, use the visible-price rule and show it in the terms.

### 7.4 Payment window

- The winner has 48 hours to pay (escrow, with buyer's premium).
- Missed payment: the order moves to `CANCELLED` with `cancelReason = PAYMENT_MISSED`. The winner gets a strike (enforcement step 1 or 2 per policy). The seller may offer the item to the next-highest bidder within 24 hours (second-chance flow, F-18).

---

## 8. Buy-it-now

- Available while `status = LIVE` and before the first bid, or while the reserve is not yet met, depending on the seller's setting stated in the rules.
- Taking buy-now: transaction locks the auction, checks state, sets `status = CLOSED` with `outcome = BUY_NOW`, creates an `Order` at the buy-now price with the buyer's premium, and sets the listing to `RESERVED`.
- Buy-now and bids cannot race: the lock serialises them.

---

## 9. Retraction

- Allowed only when: retraction is within 1 hour of the bid, the auction is not in the final 2 hours, and the seller consents or a moderator approves.
- Effect: the bid status becomes `RETRACTED`. The proxy state is recomputed without the retracted bid, with a transaction and audit event. The visible price may decrease only if the retraction is approved; it never falls below the starting price.
- Retraction counts are tracked per user. More than two in 30 days create a `FraudSignal`.

---

## 10. Shill and linked-account controls

- Hard rules: seller cannot bid; accounts with a `LinkedAccountFlag` to the seller cannot bid on that seller's auctions.
- Linked-account signals: shared device fingerprint, shared payment instrument fingerprint, IP prefix cluster, mutual reviews, or a manual flag.
- Soft rules: a pattern of bidding that raises the price without winning, repeated across a seller's auctions, creates a `FraudSignal`. If the score crosses a threshold, the auction close waits for review, up to 24 hours (business rules section 6.9). The waiting does not change the winner rules; it delays the outcome.

---

## 11. Notifications

| Event | Recipients | Channel | Timing |
|---|---|---|---|
| Outbid | Previous leader | In-app, push | Within 10 seconds |
| Leading | Bidder who takes the lead | In-app | Immediate (only if the bidder enabled it) |
| Ending soon | Watchers and bidders | Push | 10 minutes before end |
| Extended | All bidders | In-app | Immediate |
| Won | Winner, seller | In-app, email, SMS if enabled | Within 1 minute of close |
| Reserve not met | Seller, highest bidder | In-app, email | Within 1 minute |
| Payment reminder | Winner | Email, SMS | 24 hours before deadline |

---

## 12. Realtime

- Channel per auction: `auction:{id}`.
- Events: `bid_accepted` (with new `currentPrice`, `bidCount`, `endsAt`, `leaderStatus` masked), `extended`, `closing`, `closed`.
- Bidder identifiers are pseudonymised per auction: a stable hash of user ID and auction ID, shown as `bidder ••NN`.
- The leading bidder's maximum is never sent.

---

## 13. Staff operations

- Extend auction: requires reason; creates `AuditEvent`; cannot exceed `maxExtensions` unless the admin role has the override permission, which is audited separately.
- Remove bid: requires reason and approval from a second auction-ops staff member for bids above the threshold; recomputes proxy state; notifies affected bidders.
- Cancel auction: allowed before `CLOSING` with reason; notifies bidders; if the listing was reserved, cancellation is blocked.

---

## 14. Testing

| Test | Type | Purpose |
|---|---|---|
| Ladder band boundaries | Unit | Increment at each boundary |
| Proxy resolution examples | Unit | Known scenarios (ties, single bidder, challenger overtaking) |
| Proxy properties | Property (fast-check) | Visible price monotonic; winner invariant; never above leader's max |
| Anti-sniping sequences | Unit + property | Extension logic and cap |
| Reserve evaluation | Unit | Visible-price rule against reserve |
| Concurrent bids | Integration (Testcontainers Postgres) | 1,000 concurrent bids on one auction: no lost updates, sequence strictly increasing, final state matches replay |
| Close idempotency | Integration | Run close job 5 times in parallel: exactly one outcome and one order |
| Clock edge | Integration | Bid exactly at `endsAt`; bid one millisecond before |
| Authorisation | Integration | Seller bid rejected; linked account rejected; L0 rejected |
| Retraction | Integration | Window and approval rules |
| Realtime masking | Contract | Leader's maximum never sent |

Load targets: 1,000 concurrent bids per auction, p95 under 250 ms, zero lost bids, zero duplicate winners across 1,000 auctions closing in one minute.

---

## 15. Observability

- Metrics: bids per second per auction, lock wait time, bid transaction duration, close duration, close lag (scheduled end to actual close), outcome counts by type.
- Alerts: close lag above 60 seconds; bid p95 above 250 ms; lock wait above 100 ms for 5 minutes; close errors.
- Dashboards: live auctions, bid rate, close lag, outcomes.
