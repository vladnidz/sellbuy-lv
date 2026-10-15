# 08 — Integrations

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026

Every external system is reached through an adapter with the same reliability pattern. Adapters live in `packages/integrations/<system>` and are called only from services and workers, never directly from UI components.

## 1. Adapter standard

Every adapter must provide:
- **Configuration** from the secrets manager and environment: base URL, credentials, timeouts, sandbox flag.
- **Timeouts:** connect 2 seconds, read 5 seconds (adjust per provider; document in the adapter).
- **Retries:** exponential backoff with full jitter, maximum 3 attempts, only for idempotent operations or operations with an idempotency key. Never retry a payment without the provider's idempotency key.
- **Circuit breaker:** opens after 5 failures in 30 seconds; half-open after 60 seconds; fails fast with a typed error while open.
- **Idempotency:** provider idempotency keys derived from the internal operation ID.
- **Logging:** request and response summaries with redaction (section 1.1). Bodies are logged only in the sandbox.
- **Mapping:** provider types converted to domain types at the adapter boundary. Domain code never imports provider types.
- **Contract tests:** recorded fixtures for each endpoint; live sandbox tests in the nightly pipeline.
- **Feature flag:** each integration can be disabled without deploy, with a documented fallback.

### 1.1 Redaction list

Personal codes, phone numbers, email addresses, IBAN numbers, names, addresses, card-like numbers, tokens, signatures, and authorisation headers are removed from logs before writing.

## 2. Smart-ID

**Purpose:** strong identity for registration (L2) and verification upgrades. Reference: `docs/integrations/smart-id.md` (existing document, to be reconciled under task T-00).

**Operations:**
- Authentication session start: input is the user's personal code and phone number (for the device-linked flow) or national identity (for the same-device flow, per the provider's current options). Returns session ID and a verification code to display.
- Session status polling: returns `RUNNING`, `COMPLETE`, or an error code (user cancelled, timeout, certificate issues, user not found).
- Certificate and signature validation: performed by the provider library; SellBuy validates the response certificate chain, the returned identity, and the request hash.

**Data rules:**
- The personal code is used once to start the session and to compute a keyed hash for identity matching. It is not stored, logged, or sent to analytics.
- The verified given name and family name are stored encrypted, shown only with consent.
- The verification record stores the level, method, result, and timestamp. It does not store the raw response.

**Error handling:**
- User cancels: no account change; message explains next step.
- Timeout: retry allowed after 30 seconds.
- Provider unavailable: phone and email methods remain; message explains that verification is temporarily unavailable.
- Mismatch with an existing identity: sign in to the existing account after confirmation; never create a duplicate.

**Terms:** confirm use case and data storage under the provider's terms (Q-11).

## 3. Omniva (parcel lockers and post offices)

**Purpose:** parcel shipping for consumers and businesses (R2).

**Operations:**
- Shipment creation: send parcel details (size class, weight, sender and receiver contact, destination locker or post office) and receive a tracking number and label reference.
- Label retrieval: PDF or ZIP for printing; cached with a 24-hour signed link.
- Tracking events: pushed to SellBuy by webhook or polled every 30 minutes for open shipments, whichever the provider supports.
- Point search: list of lockers and post offices with opening hours and availability, cached for 1 hour per region.

**Data rules:** only the recipient's name, phone, and destination point are sent. The seller's address is sent only as the sender record the provider requires.

**Event mapping:** provider events map to `ShipmentStatus` (LABEL_CREATED, IN_TRANSIT, READY_FOR_PICKUP, DELIVERED, RETURNED, LOST). Unknown events are stored with `code` and mapped to IN_TRANSIT by default, with an alert for new codes.

**Failure handling:** if label creation fails, the order stays `PAID` and the seller sees the error with a retry button; support is alerted after 3 failures.

## 4. DPD (courier and pickup points)

**Purpose:** courier delivery and pickup points (R2).

**Operations:** same pattern as Omniva: shipment creation, label retrieval, tracking, pickup point search, and pickup scheduling where supported.

**Differences to handle in the adapter:** field length limits, phone format requirements, pickup window rules, and cut-off times per region. Each difference is covered by a contract test.

## 5. Payment service provider

**Purpose:** card and bank payments, escrow-style holds, payouts to sellers, refunds, chargebacks, and settlement reports (R2). Decision DEC-05 selects the provider; the adapter interface is written provider-neutral.

**Interface (provider-neutral):**
- `createPaymentSession(orderId, amount, currency, methods, idempotencyKey)` returns a hosted-page URL or client secret.
- `capturePayment` or `holdPayment` according to the chosen model.
- `refund(paymentId, amount, reason, idempotencyKey)`.
- `createPayout(accountRef, amount, idempotencyKey)`.
- `getSettlementReport(date)`.
- `verifyWebhook(headers, body)`.

**Requirements for the chosen provider:**
- Hosted fields or hosted payment page (PCI scope SAQ A).
- Support for connected seller accounts or equivalent split payouts.
- Support for Latvian bank payments (open banking) and Apple Pay and Google Pay.
- Webhooks with signatures and retry.
- Settlement reports in machine-readable format.
- Sandbox with test cards and test payouts.
- Data processing agreement compatible with GDPR.

**Money safety:** see `05-payments-escrow.md`. The adapter never calculates amounts; it receives integer minor units from the domain.

## 6. Email, SMS, and push

**Email provider:** transactional email with templates in LV, RU, EN. Requirements: DKIM, SPF, DMARC aligned, bounce and complaint webhooks, unsubscribe headers for marketing, EU data residency if available.

**SMS provider:** one-time codes and critical transaction notices. Requirements: delivery reports, sender ID registration for Latvia, fallback provider configured. SMS content never includes the full listing title or the buyer's details.

**Web push:** VAPID keys in the secrets manager. Subscription records hold an encrypted reference, not the raw endpoint keys where avoidable. Expired subscriptions are removed on 404 or 410 responses.

**Messenger notices (R2, optional):** only with explicit opt-in and provider terms reviewed. Disabled by default.

## 7. Realtime provider

**Purpose:** chat delivery, typing indicators, live auction updates (R1 for chat, R3 for auctions).

**Interface:** publish to channel, subscribe with token, presence (optional, not used for personal information).

**Authorisation:** short-lived channel tokens issued by the server with channel-level permissions (participant of conversation; watcher or bidder of auction). The client cannot choose channels it has not been granted.

**Payload rule:** events carry IDs and state only. Message bodies are fetched through the API after the event, so the realtime provider does not hold message content beyond the transport.

## 8. Image classification and perceptual hashing

**Purpose:** safety scoring, duplicate detection, stock-photo detection (R1 basic, R2 full).

**Options:** managed image moderation API or a self-hosted model. Decision recorded in the ADR when chosen.

**Data rules:** images are sent without metadata. The provider's data retention and training-use terms must be disabled or accepted by the owner in writing.

**Output mapping:** scores 0 to 1 per category. Thresholds in configuration. Uncertain scores go to review; confident scores below the block threshold pass; confident scores above the block threshold are rejected with a reason category.

## 9. Company register (Latvia)

**Purpose:** verify registration number, legal name, and status for L3 company onboarding (F-05, US-01.06).

**Interface:** lookup by registration number returns legal name, status (active, liquidated, reorganising), registered address, and registration date. Requires an agreement or an open-data access route; the exact route is open (Q-06).

**Rules:** cache results for 24 hours; store only the fields needed for verification; re-check on renewal and on any change request.

**Fallback:** if unavailable, onboarding is saved and retried every 2 hours for up to 3 days; then the user is offered manual review with documents.

## 10. VIES (EU VAT number validation)

**Purpose:** validate cross-border VAT numbers for B2B and reverse-charge treatment (R4).

**Interface:** SOAP or REST service provided by the EU, rate-limited; results cached for 24 hours.

**Rules:** validate format locally first; call VIES only for numbers with other EU country codes or for Latvian numbers in cross-border flows. Store the validation result and timestamp with the company record.

**Fallback:** if VIES is unavailable, the company is marked "VAT pending" and invoices default to the standard treatment until validated, with a note in the record. Legal confirmation required before reverse-charge is applied (Q-03).

## 11. Stolen-goods checks (phones, vehicles)

**Purpose:** check IMEI for phones and VIN for vehicles against lawful stolen-goods data (R3, US-06.9).

**Options:** national or commercial databases, subject to lawful access (Q-08). Options must be confirmed for Latvia and the EU before selection.

**Data rules:** the IMEI and VIN are sent only to the checking provider, only at review time (not at listing time, to reduce exposure), and the result stores a yes or no with a reference, not the IMEI.

**Outcome:** a positive match blocks the listing and creates a high-severity case for M2 review. Negative results do not prove the item is not stolen; the listing notice says so.

## 12. Analytics

**Purpose:** product measurement with consent (US-16.06, DEC-10).

**Rules:**
- No personal data in events or properties (section 6.3 of `07-security-privacy.md`).
- Consent required for non-essential analytics. Essential events (security, transaction) use server-side logs under the legal basis of contract and legitimate interest, reviewed by counsel.
- Retention set in the analytics tool's configuration, aligned with the retention schedule.
- Data stored in the EU where the provider allows.

## 13. Error tracking and observability

- Sentry for errors with scrubbing rules; separate DSNs per environment.
- OpenTelemetry traces exported to the managed observability backend; personal data excluded from span attributes.
- Metrics: request rates and latencies per route, background job lag, queue depth, adapter error rates and circuit-breaker state.

## 14. Integration status and ownership

| System | Release | Owner | Status | Blocking question |
|---|---|---|---|---|
| Smart-ID | R1 | Tech lead | Specified (existing doc) | Q-11 |
| Phone SMS provider | R1 | Tech lead | To select | Sender ID registration |
| Email provider | R1 | Tech lead | To select | Domain setup |
| Realtime provider | R1 (chat) | Tech lead | DEC-04 | Vendor choice |
| Image moderation | R1 basic | Tech lead | To select | Data terms |
| Object storage | R1 | Tech lead | DEC-06 | None |
| Omniva | R2 | Tech lead | Specified (existing doc) | API access agreement |
| DPD | R2 | Tech lead | To specify | API access agreement |
| PSP | R2 | Tech lead with finance | DEC-05 | Q-02 |
| Company register | R2 (L3) | Tech lead | To specify | Q-06 |
| VIES | R4 | Tech lead | To specify | Q-03 |
| Stolen-goods checks | R3 | Tech lead with legal | To specify | Q-08 |
| Messenger notices | R2 optional | Product | Not started | Consent design |
