# 03 — Business rules

Status: Draft · Owner: product owner (values need owner approval; "proposal" marks starting values) · Last change: 15 Oct 2026

Every numeric value here is stored in a configuration table (`platform_setting`) and changed only by admins with an audit event. The code reads values from configuration; it never hard-codes them.

---

## 1. Limits by verification level

| Limit | L0 | L1 | L2 | L3 | Note |
|---|---|---|---|---|---|
| Active listings | 5 | 20 | 100 | 1,000 | Proposal. Business plans may raise L3 limits. |
| Photos per listing | 10 | 20 | 20 | 40 | Business listings can use up to 40 photos. |
| Messages per day to new contacts | 5 conversations, 50 messages | Unlimited (with spam rules) | Unlimited | Unlimited | Spam rules apply at every level. |
| Saved searches | 20 | 20 | 50 | 50 | |
| Watchlist items | 200 | 200 | 200 | 200 | |
| Offers in progress (as buyer) | 3 | 10 | 20 | 50 | |
| Auction bid above threshold | Not allowed | Not allowed | Allowed | Allowed | Auction threshold in section 6. |
| Escrow purchases | Not allowed | Not allowed | Allowed | Allowed | Requires R2. |
| Restricted categories | Not allowed | Not allowed | Allowed | Allowed | See `01-categories.md` section 6. |
| Business listings | Not allowed | Not allowed | Not allowed | Allowed | |

Bulk upload: L3 only, up to 500 rows per file, 5 files per day.

---

## 2. Listing lifecycle rules

| Rule | Value | Note |
|---|---|---|
| Default duration | 30 days | Proposal |
| Renewal window | From day 25 | One renewal per listing per day |
| Sold listing display | 14 days, then archived | |
| Archived listing restore | Within 90 days, no re-review if content unchanged | |
| Draft retention | 60 days without changes | Then deleted |
| Bump (free) | Once per 24 hours per listing | Proposal. Moves the listing to the top of the default sort for the category. |
| Re-listing after removal | Not allowed for the same item for 7 days after a removal for prohibited content | |
| Duplicate detection | Same seller, same category, same title and first photo, within 24 hours: blocked | Near-duplicates flagged |
| Price changes | Unlimited, but a price drop by more than 50% in 24 hours triggers review | Anti-manipulation |

---

## 3. Price and display rules

- Currency: EUR only at launch.
- Consumer (B2C) prices are shown including VAT and any mandatory fees. Delivery cost is shown before the buyer commits.
- C2C prices are shown as entered by the seller. The platform does not add VAT to private sales.
- Business (B2B) prices are shown with and without VAT, with the VAT rate, and with a note where VAT is reverse-charged.
- Latvian format: `1 234,50 €`. Dates: `15.10.2026.`. Time: 24-hour in Europe/Riga.
- Price types: fixed (F), negotiable (N), free (Fr). Negotiable prices show the label "Negotiable" (LV: "Cena ar sarunu"; RU: "Договорная"; EN: "Negotiable") and never show a numeric starting price for price-sensitive categories unless the seller enters one.
- A free listing cannot have a price and cannot have an offer flow.

---

## 4. Fee model (placeholders; owner decision DEC-07)

These formulas are structure only. The percentages and fixed amounts are not decided and must not be implemented until approved.

| Fee | Applies to | Formula (structure) | Payer | Status |
|---|---|---|---|---|
| Listing fee | C2C | None at launch (DEC-03) | — | Hypothesis |
| Promotion fee | Paid promotions (R2) | Price of the chosen promotion package | Seller | Set per package |
| Escrow service fee | Escrow sales (R2) | `max(min_fee, rate × price) + fixed` | Buyer or seller, chosen per category | Rate and fixed amount pending DEC-07 |
| Auction buyer's premium | Auctions (R3) | `rate × hammer_price`, capped | Buyer | Pending DEC-07 |
| Auction seller fee | Auctions (R3) | `rate × hammer_price` | Seller | Pending DEC-07 |
| Business subscription | L3 (R4) | Fixed monthly per plan | Company | Pending DEC-08 |
| Payment processing | Card and bank payments | Passed through from the payment provider contract | Per configuration | Pending DEC-05 |

Rules that apply to every fee:
- The fee is computed in integer minor units with explicit rounding (half up to the nearest cent).
- The total is shown before payment. The fee breakdown appears on the invoice.
- VAT is charged on platform fees at the standard Latvian rate, confirmed by the accountant (Q-04).
- A fee change applies only to listings created or orders placed after the change date. Open orders keep their original fee.

---

## 5. Escrow and payment windows

| Rule | Value | Note |
|---|---|---|
| Shipment deadline | 2 business days after payment | Missed deadline: buyer may cancel with full refund |
| Auto-release after delivery | 3 days (default), configurable per category | Shorter for low-risk categories, longer for high-value items |
| Protection window | 14 days after delivery | Dispute must be opened inside this window |
| Seller response to dispute | 3 business days | |
| Moderator decision target | 5 business days | |
| Appeal of dispute decision | 7 days, once | New evidence only |
| Payout frequency | Weekly, or on demand above the minimum | Minimum amount: proposal 20 € |
| Auction payment window | 48 hours after close | |
| Second-chance offer validity | 24 hours | |

---

## 6. Auction rules (R3)

### 6.1 Eligibility

- Category must have the A flag.
- Seller must be L1 or above (L2 for high-value items above the authentication threshold).
- Bidder must be L1 or above, or L2 above the auction threshold.

### 6.2 Thresholds (proposals)

| Threshold | Value | Effect |
|---|---|---|
| Low-value bidding threshold | 500 € | Bids at or above need L2 |
| Authentication threshold | 300 € for watches and jewellery | Seller submits authentication info; M1 review before go-live |
| Maximum auction duration | 10 days | |
| Minimum auction duration | 1 day | |

### 6.3 Bid increments (default ladder, proposal)

| Current price | Increment |
|---|---|
| 0.01 € to 99.99 € | 1 € |
| 100 € to 499.99 € | 5 € |
| 500 € to 999.99 € | 10 € |
| 1,000 € to 4,999.99 € | 25 € |
| 5,000 € and above | 50 € |

The next minimum bid is the current price plus the increment for the current price band. A seller can select a different ladder only from a short list approved by admins.

### 6.4 Proxy bidding

- A bidder's maximum is never revealed.
- The visible current price is the lower of (a) the second-highest maximum plus one increment, or (b) the leader's maximum. Exact algorithm in `technical/04-auctions-engine.md`.
- Ties: the earlier maximum wins.

### 6.5 Anti-sniping

- Window: bids in the final 2 minutes extend the auction by 2 minutes.
- Maximum extensions: 10 per auction.
- Extensions are shown in bid history.

### 6.6 Reserve

- Reserve is hidden. Bidders see only "Reserve met" or "Reserve not met".
- Reserve cannot be below the starting price.
- Reserve is compared with the visible price (the price the winner would pay), not with the leader's maximum. This rule is proposed; the owner confirms it as DEC-13 before R3, because the choice changes outcomes.
- If the reserve is not met, the seller may offer the second chance (F-18).

### 6.7 Buy-it-now

- Available until the first bid, or until the reserve is met, depending on the seller's choice shown in the rules.
- Buy-it-now creates an order immediately with escrow.

### 6.8 Bid retraction

- Retraction is allowed only with seller consent or moderator approval, within 1 hour of the bid, and never in the final 2 hours.
- More than two retractions in 30 days are flagged for review.

### 6.9 Shill and linked-account controls

- Seller cannot bid on their own auction.
- Accounts sharing a device fingerprint, payment instrument, or IP cluster with the seller cannot bid on that seller's auctions.
- Patterns flagged by fraud scoring hold the auction for review before closing (the close waits, with a maximum delay of 24 hours).

### 6.10 Closing

- Closing happens at the scheduled end, after any extensions.
- Results are final once published. Corrections require a moderator action with an audit event.

---

## 7. Reviews and ranking

- Reviews require a completed transaction (F-14).
- One review per side per transaction.
- Reviews cannot be bought, traded, or incentivised. Rewards for reviews are prohibited.
- Ranking in search is based on relevance, listing quality, freshness, and bump. Paid promotions are labelled and clearly separated. Ranking factors are published in plain language on the help page (P2B transparency, US-10.13).

---

## 8. Moderation and enforcement ladder

| Step | Trigger examples | Effect | Reversible |
|---|---|---|---|
| 1. Warning | First minor breach | Notice only | Not applicable |
| 2. Listing removal | Prohibited or misleading listing | Listing removed; seller notified | Via appeal |
| 3. Restriction | Repeated breaches, unclear conduct | No new listings or messages to new contacts for 7 to 30 days | Via appeal |
| 4. Suspension | Fraud signals, serious breach | Account locked; sessions ended; payouts held | Via appeal and M2 review |
| 5. Ban | Confirmed fraud, stolen goods, child safety | Account closed; data retained as required by law | Only via M2 with legal sign-off |

Immediate suspension without warning is allowed for child safety, stolen goods, active fraud, or threats of violence. These cases go to M2 within the same working day.

---

## 9. Service targets (SLAs)

| Queue | Target |
|---|---|
| High-severity report | First action within 24 hours |
| Standard report | Within 3 business days |
| Appeal | Decision within 7 days |
| Dispute | Decision within 5 business days |
| Support ticket | First response within 1 business day |
| Payout processing | Within 2 business days after scheduled date |
| Company verification | Within 2 business days when checks are unclear |
| Legal and law-enforcement request | Acknowledged within 1 business day; response per legal deadline |

---

## 10. Retention summary

The full retention schedule is in `technical/07-security-privacy.md`. Summary:

| Data | Retention |
|---|---|
| Active account data | While the account is active |
| Deleted account data | 30 days cooldown, then anonymised |
| Messages | Kept with the conversation; removed when either party deletes the account (anonymised in the other party's view) |
| Orders, invoices, payments, ledger | As required by Latvian accounting law (confirm period, Q-04) |
| Moderation cases | 3 years from closure (proposal, confirm with lawyer) |
| Audit logs | 5 years for money and staff actions; 1 year for other system events |
| Access logs with IP | 30 days |
| Consent records | Life of the account plus 3 years |
| Backups | 35 days rolling |

---

## 11. Notification rules

- Security notices (new sign-in, password or method change, payout change) are always sent, and cannot be turned off.
- Transaction notices (offers, bids, shipments, disputes) are sent by in-app and email. SMS is sent only for codes and for payment or delivery events the user has set to SMS.
- Marketing notices require opt-in and are never sent with transaction notices.
- Chat notices: at most one email per conversation per hour, with a digest option.
- Quiet hours default: 22:00 to 08:00 Europe/Riga for non-critical notices.

---

## 12. Change control

- Values in this file change only with an approved change request.
- Each change records the old value, the new value, the reason, the approver, and the effective date.
- Changes that affect money or auctions require a two-person review and a release note for sellers and buyers when required by law.
