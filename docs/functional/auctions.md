# Functional Specification: EP-09 Auctions & Bidding Engine

Status: Draft for Review · Release: R3 · Epic: EP-09
Stack: Next.js 16, Prisma 7, PostgreSQL 17, Redis / worker daemon

---

## 1. Overview & Vision
The SellBuy.lv auction system is designed as a timed English auction with proxy bidding, transparent increment ladders, hidden reserves, and an anti-sniping extension window. It is tailored for high-value second-hand items, collectibles, vintage tools, and small business liquidation lots across Latvia.

---

## 2. Benchmark Comparison (eBay vs SellBuy.lv)

| Feature | Standard eBay Auction | SellBuy.lv Auction Engine | Rationale |
|---|---|---|---|
| **Auction Format** | Timed English auction | Timed English auction | Proven, familiar format for buyers and sellers |
| **Bidding Method** | Automated proxy bidding up to max limit | Automated proxy bidding up to max limit | Reduces buyer effort, prevents artificial price over-escalation |
| **Closing Rule** | Hard close (fixed end second) | **Anti-sniping dynamic extension (2 min)** | Prevents last-second sniping bot abuse; fairer price discovery |
| **Reserve Price** | Hidden reserve; indicates "Reserve not met" | Hidden reserve; indicates "Reserve not met" | Protects seller valuation while encouraging bidding |
| **Fee Structure** | High seller final value fee (~10-13%) | **Low seller listing + Buyer's Premium (DEC-14)** | Free/low-cost listing for Latvian sellers; buyer escrow protection |
| **Anti-Shill Rules** | Retrospective algorithmic flags | **Strict server-side validation** | Blocks seller, matching IPs, and linked device fingerprints |

---

## 3. Core Mechanics & Mathematical Engine

### 3.1 Increment Ladder Table (Default EUR)
Proxy bids increment the visible leading price according to the following schedule:

| Current Leading Price (€) | Minimum Bid Increment (€) |
|---|---|
| €0.01 – €4.99 | €0.25 |
| €5.00 – €24.99 | €0.50 |
| €25.00 – €99.99 | €1.00 |
| €100.00 – €249.99 | €2.50 |
| €250.00 – €499.99 | €5.00 |
| €500.00 – €999.99 | €10.00 |
| €1,000.00 – €2,499.99 | €25.00 |
| €2,500.00+ | €50.00 |

### 3.2 Proxy Bidding Resolution Algorithm
When a user submits a bid with `maxAmount`:
1. If no bids exist: Visible price = `startPrice`, leader = bidder, high max = `maxAmount`.
2. If competing with an existing leader:
   - If `newMax > existingMax`:
     - New leader becomes the new bidder.
     - New visible price = `min(newMax, existingMax + increment)`.
   - If `newMax <= existingMax`:
     - Leader remains unchanged.
     - New visible price = `min(existingMax, newMax + increment)`.
     - Outbid notification dispatched immediately to new bidder.
   - If `newMax == existingMax`: Ties resolve in favor of the **earliest submitted bid**.

### 3.3 Anti-Sniping Dynamic Extension (US-09.04)
- If a qualifying bid arrives within **2 minutes (120 seconds)** of the scheduled closing time:
  - `endsAt = endsAt + 120 seconds`.
  - `extensionCount = extensionCount + 1`.
  - Maximum extensions: **10** (capped to prevent endless runaway loops).
  - All watchers and active bidders receive a live countdown reset alert.

---

## 4. Concurrency & Architectural Guardrails
1. **Atomic Bid Execution**:
   - Every bid submission must be processed using a database-level lock (`SELECT ... FOR UPDATE` on the Auction row) or conditional atomic write.
   - Prevents race conditions during simultaneous bids.
2. **Idempotent Auction Closing (US-09.05)**:
   - Auction close execution is handled by a background worker job key with an advisory lock.
   - If executed multiple times, only the first call transitions status from `live` to `closed`.
   - Generates an `Order` record and opens a 48-hour payment window for the winning bidder.
