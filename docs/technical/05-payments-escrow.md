# 05 — Payments, escrow, and ledger

Status: Draft · Owner: tech lead with finance operator · Last change: 15 Oct 2026 · Release: R2

This document defines how money moves through SellBuy.lv. It depends on decision DEC-05 (payment model and provider) and on a legal opinion about whether the chosen model needs a licence (Q-02). Until both are settled, implement only the ledger and the state machines, with a sandbox provider.

Principles:
- SellBuy never holds client funds in its own bank account. Funds are held by the licensed payment provider on the marketplace's behalf, under the provider's terms.
- The internal ledger records every money event as balanced double-entry postings. The ledger is the basis for reconciliation, reporting, and disputes.
- No card data reaches SellBuy servers. Card entry uses the provider's hosted fields or hosted page.
- Every money event has an idempotency key and is traceable to a source event.

---

## 1. Actors in a payment

- **Buyer:** pays the total for an order.
- **Seller:** receives the item amount less the seller's fees, through a payout.
- **Platform:** earns fees; owes VAT on fees; handles disputes and refunds.
- **Payment provider:** holds funds, processes payments, pays out to sellers' bank accounts, reports to the platform.

---

## 2. Order money model

For each order, the fee engine computes components. All values are integer minor units.

| Component | Who pays | Source |
|---|---|---|
| `itemAmount` | Buyer | Fixed price, accepted offer, or auction hammer price |
| `buyersPremiumAmount` | Buyer (auctions) | Premium rule (rate or fixed, capped) on item amount |
| `shippingAmount` | Buyer | Shipping quote |
| `buyerFeeAmount` | Buyer (if rule puts it on buyer) | Escrow service fee rule |
| `vatAmount` | Buyer (on buyer-paid fees, and on any VAT-able component per rule) | Calculated per component |
| `totalAmount` | Buyer | Sum |
| `sellerFeeAmount` | Seller (deducted at payout) | Fee rule |

Formula (structure):

```
totalAmount = itemAmount + buyersPremiumAmount + shippingAmount + buyerFeeAmount + vatAmount
sellerNet   = itemAmount - sellerFeeAmount - sellerVatOnFee (if applicable)
```

Rounding: each component is rounded to the nearest minor unit (half up) individually; the total is the sum of rounded components. This avoids penny differences between the invoice and the ledger.

Who pays VAT on what is set by `FeeRule.vatTreatment` and confirmed by the accountant (Q-03, Q-04). Private C2C item amounts carry no VAT from the platform.

---

## 3. Ledger accounts

Accounts are created once and never deleted. Codes are stable.

| Code | Name | Type | Purpose |
|---|---|---|---|
| `PSP_CLEARING` | Payment provider clearing | ASSET | Funds received from buyers, not yet settled |
| `ESCROW_HELD` | Escrow held for orders | LIABILITY | Funds owed to sellers, held by the provider for active orders |
| `SELLER_PAYABLE:{userOrCompanyId}` | Seller payable | LIABILITY | Released funds available for payout, per seller |
| `REFUNDS_PENDING` | Refunds pending | LIABILITY | Refund requested, not yet settled |
| `PLATFORM_REVENUE_FEES` | Platform fee revenue | REVENUE | Fees earned |
| `PLATFORM_REVENUE_PREMIUM` | Buyer's premium revenue | REVENUE | Premium earned on auctions |
| `VAT_PAYABLE` | VAT payable | LIABILITY | VAT collected on fees and other taxable items |
| `PSP_FEES` | Payment provider fees | EXPENSE | Provider charges, if the platform bears them |
| `CARRIER_PAYABLE` | Carrier payable | LIABILITY | Shipping collected from buyers, owed to carriers |
| `CHARGEBACKS_PENDING` | Chargebacks pending | ASSET (contra) | Disputed card payments awaiting outcome |
| `ADJUSTMENTS` | Adjustments | EXPENSE/REVENUE (as needed) | Manual corrections, always with reason |

Seller payable accounts are created per seller on first sale. The number of seller accounts grows with sellers; the chart of accounts is otherwise small.

---

## 4. Posting patterns

Each pattern is a single `LedgerTransaction` with its entries. Amounts below use cents.

### 4.1 Payment succeeded (order paid)

Buyer paid 10,000 (item) + 500 (shipping) + 0 fee, no VAT on item.

| Account | Direction | Amount |
|---|---|---|
| PSP_CLEARING | DEBIT | 10,500 |
| ESCROW_HELD | CREDIT | 10,500 |

Note: escrow liability is recorded as the full buyer total at payment, since all of it is held until release. Shipping cost is owed to the carrier later; it is not treated as revenue here.

### 4.2 Escrow release (buyer confirmed, auto-release, or dispute won by seller)

Seller fee 800 on item 10,000. Shipping of 500 is collected from the buyer and owed to the carrier, so it is not platform revenue. It goes to `CARRIER_PAYABLE` until the carrier is paid.

| Account | Direction | Amount |
|---|---|---|
| ESCROW_HELD | DEBIT | 10,500 |
| SELLER_PAYABLE:seller | CREDIT | 9,200 |
| PLATFORM_REVENUE_FEES | CREDIT | 800 |
| CARRIER_PAYABLE | CREDIT | 500 |

When the carrier is paid (or the platform settles the carrier invoice), DEBIT `CARRIER_PAYABLE` 500 and CREDIT `PSP_CLEARING` 500. If shipping is paid through the seller's own carrier account instead, finance sets the configuration; the ledger pattern stays the same.

### 4.3 Auction buyer's premium

Hammer 20,000; buyer premium 10% = 2,000 (illustrative rate; not decided, DEC-07).

Included in the order total at payment (4.1), and recognised at release:
| Account | Direction | Amount |
|---|---|---|
| PLATFORM_REVENUE_PREMIUM | CREDIT | 2,000 |

### 4.4 Full refund before release

| Account | Direction | Amount |
|---|---|---|
| ESCROW_HELD | DEBIT | 10,500 |
| REFUNDS_PENDING | CREDIT | 10,500 |

When the provider confirms the refund:
| Account | Direction | Amount |
|---|---|---|
| REFUNDS_PENDING | DEBIT | 10,500 |
| PSP_CLEARING | CREDIT | 10,500 |

### 4.5 Partial refund after release

Refund 3,000 from a seller who was already paid. The seller balance is reduced; if the balance is insufficient, the shortfall is recorded as a seller receivable, collected from future payouts.

| Account | Direction | Amount |
|---|---|---|
| SELLER_PAYABLE:seller | DEBIT | 3,000 |
| REFUNDS_PENDING | CREDIT | 3,000 |

### 4.6 Payout

Seller balance 9,200 paid to bank account.

| Account | Direction | Amount |
|---|---|---|
| SELLER_PAYABLE:seller | DEBIT | 9,200 |
| PSP_CLEARING | CREDIT | 9,200 |

The payout is confirmed by the provider's payout event. The payout record moves through `SCHEDULED`, `PROCESSING`, `PAID`, or `FAILED` (failed payouts are reversed: DEBIT `PSP_CLEARING`, CREDIT `SELLER_PAYABLE`).

### 4.7 Chargeback

Buyer disputes card payment at the bank. Provider debits the platform.

| Account | Direction | Amount |
|---|---|---|
| CHARGEBACKS_PENDING | DEBIT | 10,500 |
| PSP_CLEARING | CREDIT | 10,500 |
| ESCROW_HELD | DEBIT (if still held) | 10,500 |
| SELLER_PAYABLE:seller | DEBIT (if already released; may create receivable) | 9,200 |

Chargeback fees charged by the provider go to `PSP_FEES`. The chargeback outcome moves `CHARGEBACKS_PENDING` to `PSP_CLEARING` (won) or to `EXPENSE` (lost).

### 4.8 VAT on platform fee

Fee 800 is VAT-able at 21%: net 661.16 → rounded 661, VAT 139 (rounding half up on 800 / 1.21 = 661.157...). Net to revenue, VAT to liability.

| Account | Direction | Amount |
|---|---|---|
| PLATFORM_REVENUE_FEES | CREDIT | 661 |
| VAT_PAYABLE | CREDIT | 139 |

The VAT treatment of the fee is set per `FeeRule`. The accountant confirms the rounding convention (Q-04) before launch. The example above uses the convention "VAT extracted from gross, rounded half up".

---

## 5. Order state machine (escrow)

```
AWAITING_PAYMENT ──payment succeeded──▶ PAID ──seller ships──▶ SHIPPED
       │                                   │                       │
       │ deadline passed / buyer cancels   │ seller cancels        │ carrier: delivered
       ▼                                   ▼                       ▼
   CANCELLED / EXPIRED                 CANCELLED (refund)      DELIVERED
                                                                   │
                                  buyer confirms / auto-release    │ dispute opened
                                                ▼                  ▼
                                          CONFIRMED ──release──▶ RELEASED    DISPUTED
                                                                              │
                                                 seller wins ──▶ RELEASED     │ buyer wins
                                                                              ▼
                                                                          REFUNDED
```

Local pickup uses `HANDOVER_PENDING` in place of `SHIPPED` and `DELIVERED`. Handover confirmation moves the order to `DELIVERED`.

Rules:
- Transitions are validated in `packages/domain/order/state.ts`.
- Each transition writes ledger postings in the same transaction, or does not write them if the transition has no money effect.
- Escrow release requires `DELIVERED` or `HANDOVER_PENDING` completed, and no open dispute.
- Auto-release time is set when the order becomes `DELIVERED`. It is recalculated only if the carrier reports a new delivery event (rare, for example after a lost-and-found).

---

## 6. Webhooks from the provider

Endpoint: `POST /webhooks/psp`.

Requirements:
- Verify the provider signature before parsing the body. Reject unsigned or badly signed requests with HTTP 400, and log without the body.
- Idempotent: store `providerEventId` in a unique table. A repeated event returns HTTP 200 without changes.
- Process asynchronously: the endpoint writes the event to the outbox and returns 200 within 2 seconds. The worker processes the event with its own transaction.
- Ordering: events can arrive out of order. The handler reads the current state and applies only transitions that are valid from it; out-of-order events for an invalid transition are logged and dropped with `ORDER_STATE_INVALID`.

Handled events (initial): `payment.succeeded`, `payment.failed`, `payment.canceled`, `refund.succeeded`, `refund.failed`, `payout.paid`, `payout.failed`, `dispute.created` (chargeback), `dispute.closed`.

---

## 7. Reconciliation

Daily job (06:00 Europe/Riga):
1. Fetch the provider's settlement and transaction reports for the previous day.
2. Match provider transactions to internal `Payment`, `Refund`, `Payout` by provider IDs.
3. Compare amounts and statuses. Each mismatch creates a reconciliation task with type and amounts.
4. Check ledger integrity: total debits equal total credits per currency; `ESCROW_HELD` equals the sum of unreleased order totals; `SELLER_PAYABLE` sums equal the seller balances.
5. Publish the reconciliation report to the finance dashboard. Unexplained differences older than 48 hours escalate to the finance lead.

Stuck orders job (every 15 minutes): orders in `AWAITING_PAYMENT` with a PSP session older than 30 minutes are polled against the provider API. Results apply through the normal webhook handler path.

---

## 8. Payouts

- Eligibility: the seller has a verified payout account (IBAN validated, holder name matches verified identity), balance above the minimum (proposal: 20 €), and no active hold.
- Schedule: weekly (default), or on demand once per day above the minimum.
- Holds: fraud, dispute, legal request, or manual finance hold. Holds prevent the payout but not the ledger posting.
- Approval: payout batches above the four-eyes threshold (proposal: 5,000 € per batch) need a second finance approver who is not the initiator.
- Failure: a failed payout reverses the posting and notifies the seller. Repeated failures put the account on hold.
- Tax reporting: seller yearly totals feed the DAC7 report (US-07.10). The data is kept in the ledger, not recalculated from orders.

---

## 9. Disputes and refunds

- A dispute freezes escrow release (state `DISPUTED`). The ledger is not changed until the decision.
- Decision outcomes map to postings:
  - Full refund to buyer: section 4.4 (before release) or 4.5 (after release, with receivable if needed).
  - Partial refund: refund amount posted as in 4.5.
  - Seller wins: release postings as in 4.2.
- Refunds go to the original payment method through the provider. Cash refunds are not issued.
- Refund reasons are stored with the refund record. Refund amounts cannot exceed the captured amount less prior refunds.

---

## 10. Taxes, invoices, and reporting

- Platform fee invoices are issued at each order (receipt for the buyer; fee invoice to the seller where VAT applies).
- Invoice numbers come from a gap-free sequence per series (`PLATFORM-2026-000001`).
- Business invoices (R4) follow the Latvian format requirements confirmed in Q-04.
- Corrections are made by credit notes, never by editing issued invoices.
- VAT returns: monthly export from `VAT_PAYABLE` postings with invoice references.
- Reports: daily settlement summary, monthly revenue by category and fee type, payouts, disputes, refunds, chargebacks.

---

## 11. Security and PCI scope

- Card data is entered only in the provider's hosted fields or hosted page. SellBuy's servers never receive card numbers or CVC.
- Scope target: PCI DSS SAQ A (confirm with the provider, US-15.11).
- Webhook secrets and API keys are stored in the secrets manager. They are rotated every 90 days and on any suspicion of exposure.
- Bank account numbers (IBAN) are encrypted at the application level; the database holds masked values and an encrypted reference.
- Finance staff access is logged. Four-eyes controls apply to payouts above the threshold, manual ledger adjustments, and holds above the threshold.

---

## 12. Testing

| Test | Type |
|---|---|
| Every posting pattern in section 4 | Unit (domain) and integration (database) |
| Ledger balance invariant after random sequences of events | Property test |
| Webhook signature verification | Unit |
| Duplicate and out-of-order webhook events | Integration with a fake provider |
| Escrow state machine | Unit (all transitions) |
| Refund limits | Unit |
| Reconciliation with injected mismatches | Integration |
| Provider sandbox end-to-end | E2E (nightly) |

---

## 13. Open items

- DEC-05: payment model and provider.
- Q-02: licensing opinion on the model.
- Q-03 and Q-04: VAT and invoicing rules, including rounding convention.
- DEC-07: fee values.
- Carrier payment configuration (finance to confirm: platform pays carriers, or seller holds the carrier account).
