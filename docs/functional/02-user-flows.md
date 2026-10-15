# 02 — User flows

Status: Draft · Owner: product owner · Last change: 15 Oct 2026

Each flow lists: trigger, actors, steps, alternatives and errors, and done-when. Story IDs in brackets refer to `backlog/stories.csv`. Messages shown to users are described here and implemented through i18n keys named `flow.<id>.<key>`.

Flow IDs use `F-nn`. Screens are described in words. Design files are referenced by the design system page, not here.

---

## F-01 Registration

**Trigger:** A guest chooses "Sign in" or starts an action that requires an account. [US-01.01, US-01.02, US-01.03]

**Actors:** Guest, system.

**Steps:**
1. Guest chooses one of three methods: Smart-ID (preferred), phone number with SMS code, or email with magic link.
2. **Smart-ID:** the system starts a Smart-ID session for the personal code and phone number the user enters, shows the verification code, and waits for confirmation. On success the account is created at level L2 with the verified given and family name. Only a keyed hash of the personal code is stored (see `technical/08-integrations.md`).
3. **Phone:** the user enters the number in E.164 format, the system sends a six-digit code (valid 5 minutes, five attempts). On success the account is created at level L1.
4. **Email:** the user enters an email; the system sends a magic link (valid 15 minutes, single use). On click, the account is created at level L0, and the user must add a phone number to reach L1.
5. The user sets a display name (2 to 30 characters, no URLs, no contact details), chooses a language (LV default, RU, EN), and accepts the Terms of Use and Privacy Policy version shown. Consent is recorded with the version and timestamp.
6. The user lands on the home page with a prompt to finish their profile.

**Alternatives and errors:**
- Email already registered with another method: the user is offered to sign in with the existing method, not to create a second account.
- Phone already linked to another account: same handling as above, with no disclosure of which account.
- Smart-ID personal code already linked to another account: the system signs the user into that account after a Smart-ID confirmation. It never creates a duplicate.
- Smart-ID timeout or user cancels: no account created; message explains how to retry.
- Terms not accepted: the account is not created.
- Rate limit reached: the message says how long to wait, without revealing whether the number exists.

**Done when:** an account exists with the right level, consent is recorded, and the audit event `user.registered` is written without personal data in the event payload.

---

## F-02 Login and session

**Trigger:** A user returns to the site or chooses "Sign in". [US-01.01 to US-01.03, US-01.10]

**Steps:**
1. The user signs in with the method used at registration, or any other linked method.
2. The server issues a session cookie (HttpOnly, Secure, SameSite=Lax) with an idle timeout of 30 days and an absolute timeout of 90 days. The session is rotated on sign-in and on each privilege change.
3. The user returns to the page they were on.
4. A sign-in from a new device or new location sends a security notice by email. The notice contains the device name and approximate city, and a link to review sessions.

**Alternatives and errors:**
- Expired session: the user is returned to sign-in with the original destination kept.
- Signing in from a suspended account: the message says the account is restricted and points to the appeal route (F-23). It does not reveal moderation details.
- Account pending deletion (within 30 days): the user may cancel the deletion by signing in.

**Session management:** the user can see active sessions and end any of them, or all except the current one [US-01.10]. Staff sessions use the same mechanism with a shorter idle timeout (8 hours) and mandatory two-factor authentication.

---

## F-03 Account recovery

**Trigger:** A user cannot access their method (lost phone, changed number, no Smart-ID). [US-01.02, US-01.03]

**Steps:**
1. The user chooses "Cannot sign in" and enters the email on the account.
2. The system sends a recovery link to that email, regardless of whether the email exists (the response is the same either way).
3. The user confirms their identity: a code sent to the email, and if a phone is on the account, a code to that phone.
4. The user re-links a method. Smart-ID re-verification restores L2 status.
5. Recovery is blocked for seven days after a reported stolen-account event, pending review.

**Done when:** the user can sign in with a new method, previous sessions are revoked, and an audit event is recorded.

---

## F-04 Verification upgrade (L1 to L2)

**Trigger:** A user wants escrow, restricted categories, auction bidding above threshold, or more listings. [US-01.05]

**Steps:**
1. The user sees what the upgrade unlocks, in plain words.
2. The user starts Smart-ID verification (same flow as F-01 step 2).
3. On success, the level becomes L2 and the badge appears on the profile.
4. Listing limits and capabilities update immediately.

**Errors:** if the Smart-ID personal code is already linked to a different account, the flow explains that the existing account must be used, and offers the recovery route if the user lost access (F-03). It never reveals the other account.

---

## F-05 Company onboarding (L3)

**Trigger:** An L2 member wants to publish business listings, run tenders, or open a storefront. [US-01.06, US-10.01]

**Steps:**
1. The member enters the company's legal name, registration number, VAT number (if registered), and registered address.
2. The system checks the registration number with the company register provider (see `08-integrations.md`, Register). The legal name must match the register. If the company is not active in the register, onboarding stops with a clear message.
3. For cross-border VAT numbers, the system validates the number through the EU VIES service.
4. The member confirms they represent the company. The system records the confirmation. The representative's identity is the member's own L2 identity.
5. Ownership is recorded as the company owner role. Other team members are invited later.
6. Company verification (L3) is approved automatically when all checks pass. Failed or unclear checks go to M1 review within two business days.
7. Trader information required under the Digital Services Act (see `technical/07-security-privacy.md`, DSA section) is collected and shown on the storefront where required.

**Errors:** register unavailable: onboarding is saved and retried automatically; the user is told it is pending. Name mismatch: the user can request a manual review with supporting documents.

---

## F-06 Create a listing

**Trigger:** A member chooses "Sell". [US-03.01 to US-03.04, US-02.01 to US-02.03]

**Steps:**
1. **Category.** The member searches or browses the tree (see `01-categories.md`). The chosen leaf determines the template, flags, and allowed price types. Restricted or L3-only categories are shown with a lock and the required level.
2. **Attributes.** Required fields for the template appear first. Brand and model come from catalogues; typed values are flagged for review.
3. **Photos.** Up to 20 photos (HEIC, JPEG, PNG; up to 15 MB each). The first photo is the cover. The system strips EXIF metadata, creates thumbnails, and runs duplicate and safety checks. A photo that fails the safety check is rejected with a reason.
4. **Title and description.** Title 10 to 80 characters. Description up to 4,000 characters, plain text (no HTML, no links). Contact details typed into text are masked on publication.
5. **Price.** Fixed, negotiable, or free, depending on the leaf flags. The price field shows the currency and, for business listings, whether VAT is included.
6. **Location.** City and district are required. Exact address is never shown. Pickup point is optional.
7. **Delivery.** For eligible leaves: pickup, parcel (Omniva or DPD), or freight. The shipping profile sets the cost (R2).
8. **Review.** The member sees a preview, the quality score tips, and the listing expiry date (30 days).
9. **Publish.** The system runs the rule engine (prohibited words, restricted items, duplicate check, image checks). Passing listings become active. Flagged listings go to `pending_review` and the member sees "Under review. Usually within 24 hours."

**Autosave:** every change saves a draft. Drafts expire after 60 days without changes.

**Alternatives and errors:**
- Limit reached for the verification level: the message names the limit and the upgrade path (F-04).
- Duplicate listing within 24 hours: the member sees the existing listing and can edit it instead.
- Prohibited item: the message names the rule category without repeating the prohibited term.
- Missing required field: the field is focused, and the message says what is needed.

**Done when:** the listing is in the expected state, the search index update is queued, and events `listing.created` and (if applicable) `listing.pending_review` are written.

---

## F-07 Edit, renew, mark sold, archive

**Trigger:** The seller manages an existing listing. [US-03.05, US-03.06, US-03.10]

**Steps:**
1. **Edit.** Any field may change. Changes to price, title, photos, or category re-run the rule engine. Changes to description or attributes that do not affect rules apply immediately. Bump history is kept.
2. **Renew.** Possible from day 25 of 30. Renewal resets the expiry date to 30 days from renewal. Limited to one renewal per listing per day.
3. **Mark sold.** The seller marks the listing as sold, optionally linking a buyer who has a conversation with them (for review eligibility). The listing shows "Sold" for 14 days, then archives.
4. **Archive.** The seller can archive a listing at any time. Archived listings are hidden and can be restored within 90 days without re-review, if no rule changed.
5. **Expiry.** On expiry, the listing is hidden and the seller is notified 5 days before (day 25) and on the day of expiry.

**Bulk actions (R2):** select up to 50 listings to renew, archive, or change price. The result report lists successes and failures.

---

## F-08 Browse and search

**Trigger:** Any visitor searches, browses a category, or opens a city page. [US-04.01 to US-04.03, US-04.06, US-04.08]

**Steps:**
1. The visitor types a query or chooses a category.
2. The results page shows listings, the count, active filters, and sort order.
3. Filters come from the leaf template (attributes marked filterable). Counts update as filters change.
4. The visitor opens a listing. The page shows photos, price, condition, attributes, description, location (approximate), seller profile summary, similar items, and the fair-price indicator (R2).
5. The URL holds all filter and sort state, so the page can be shared or bookmarked.

**Alternatives and errors:**
- Zero results: the page suggests corrections, removes the last filter, and shows popular categories.
- Search unavailable: a simple category page with recent listings is shown; the search bar shows a short notice.
- Listing expired or removed: the page shows a notice and similar live items; the URL returns a clear status.

---

## F-09 Saved searches, favourites, and alerts

**Trigger:** A visitor saves a search or favourites a listing. [US-04.04, US-04.10]

**Steps:**
1. The user saves the current search with a name. Alert frequency: instant, daily, or weekly.
2. New matching listings trigger alerts. Instant alerts are batched if more than five arrive in ten minutes.
3. Favourites show a price-drop notice when the seller lowers the price. Watchlist limit: 200 items.
4. The user can pause or delete alerts from one place.

**Limits:** 20 saved searches for L0 and L1 accounts; 50 for L2 and above.

---

## F-10 Messaging and offers

**Trigger:** A buyer messages a seller about a listing, or makes an offer. [US-05.01 to US-05.08]

**Steps:**
1. The buyer opens the listing and starts a conversation. The conversation is linked to the listing and the two parties.
2. Messages support text and up to three images. Quick replies are available.
3. Phone and email typed in messages are masked for both sides. Each side can choose "Show my phone" after a mutual message exchange or at L2. Reveal events are recorded.
4. **Offer:** the buyer enters an amount. The seller can accept, decline, or counter. An offer expires after 48 hours. An accepted offer creates a price for that buyer only, valid for 48 hours to complete the purchase (F-11).
5. Warnings appear when a conversation shows scam signals (see US-05.07). The warning explains safe-payment practice and links to the guide.
6. Either side can report a message or user (F-21). Either side can block the other (US-01.09).

**Rate limits:** L0 accounts may start up to five conversations per day and send up to 50 messages per day. These limits lift at L1.

**Errors:** the seller has turned off offers for the listing: the offer button is hidden, with an explanation in the listing. A blocked user cannot start a conversation; the message is generic.

---

## F-11 Purchase with escrow (R2)

**Trigger:** A buyer accepts a fixed price or an accepted offer and chooses escrow. [US-07.01, US-07.02, US-08.01 to US-08.05]

**Steps:**
1. The buyer checks the order summary: item, price, buyer fee, delivery method and cost, total. VAT is shown for business sellers.
2. The buyer chooses delivery: parcel to Omniva locker or post office, DPD courier or pickup point, or local pickup (if the seller allows).
3. The buyer pays through the payment provider's hosted page. Funds are held in escrow.
4. The seller receives a notification with a 48-hour window to ship (or arrange pickup). Missing the window lets the buyer cancel with a full refund.
5. The seller ships. The shipment status updates from carrier events.
6. Delivery is confirmed by the carrier scan (for parcels) or by the buyer's confirmation (for pickup).
7. The buyer confirms receipt, or the system releases funds after the auto-release period (default 3 days after delivery, configurable per category). A buyer can open a dispute within the protection window (F-13).
8. Funds are released to the seller's payout balance. Reviews open for both sides (F-14).

**Alternatives and errors:**
- Payment fails: the order is not created; the buyer may retry with another method.
- Seller cancels before shipment: full refund to the buyer; the seller's cancellation count increases.
- Buyer cancels before shipment: full refund minus any non-refundable payment fee, shown before confirming.
- Carrier problem: a shipment held for more than 5 days triggers a support task.

---

## F-12 Local pickup

**Trigger:** Seller and buyer agree on pickup (no escrow, or escrow with pickup confirmation). [US-08.04]

**Steps:**
1. Both agree on a time and place in chat. The exact address is shared in the conversation only after the agreement.
2. At pickup, the seller can confirm handover in the app. Confirmation starts the escrow release rule if escrow was used.
3. If there is no handover within the agreed window, the buyer can report it.

**Safety:** the flow shows the safe-handover guidance (US-06.10) when a pickup is confirmed.

---

## F-13 Dispute and refund (R2)

**Trigger:** The buyer reports that the item is not as described, damaged, missing, or not delivered, within the protection window (14 days after delivery). [US-07.08, US-07.06]

**Steps:**
1. The buyer selects the reason and describes the problem.
2. The buyer uploads evidence: up to 10 photos or a video, plus any messages.
3. Funds are frozen. The seller has 3 business days to respond and to offer a resolution (refund, partial refund, return, or replacement).
4. If the seller accepts, the refund is processed to the buyer's original method.
5. If the seller does not respond or disagrees, M1 reviews within 5 business days. M1 may ask for more evidence once.
6. The decision is recorded with reasons. Either side may appeal once, to M2, within 7 days, with new evidence only.
7. The seller's dispute rate is updated and may affect their listing limits and fees.

**Returns:** B2C orders may carry a 14-day withdrawal right under consumer law. The return flow is handled as in US-08.08. Private C2C sales follow the stated seller policy and mandatory law.

---

## F-14 Reviews

**Trigger:** A completed order or completed handover. [US-06.01]

**Steps:**
1. Both sides are invited to review within 14 days.
2. A review contains a rating (1 to 5) and optional text (up to 500 characters). Reviews cannot include contact details or links.
3. Reviews publish after both sides submit, or after 14 days, whichever is first.
4. Each side may reply once.
5. A review can be reported. Reviews with confirmed manipulation are removed.

**Eligibility:** reviewer must be L1 or above, and must have a completed transaction with the reviewed party.

---

## F-15 Auction creation (R3)

**Trigger:** A verified seller chooses "Start auction" on an auction-eligible leaf. [US-09.01, US-09.06, US-09.13]

**Steps:**
1. The seller creates the listing as in F-06 and selects "Auction".
2. The seller sets: starting price, optional reserve (hidden), optional buy-now price, duration (1, 3, 5, 7, or 10 days), start time (now or scheduled up to 14 days ahead), bid increment table (default), and buyer's premium (shown from the business rules).
3. For watches and high-value items (above the authentication threshold), the seller submits authentication information. An M1 reviewer checks it before the auction goes live.
4. The seller accepts the auction terms (version recorded).
5. The auction goes live at the start time. The listing shows the rules, the countdown, and the current price.

**Errors:** reserve lower than start price: rejected. Buy-now below the current price: rejected. Duration outside the allowed set: rejected. Category not auction-eligible: the option is hidden.

---

## F-16 Bidding and proxy bids (R3)

**Trigger:** An eligible bidder places a bid. [US-09.02, US-09.03, US-09.07, US-09.09]

**Steps:**
1. The bidder enters a maximum amount. The form shows the minimum acceptable next bid and the buyer's premium estimate.
2. The bid is accepted if it is at or above the minimum next bid and the auction is open.
3. The system applies proxy rules: it bids on the bidder's behalf only as far as needed to lead, up to the maximum. The displayed current price follows the proxy result.
4. Other bidders who are outbid receive a notification within 10 seconds.
5. The bidder can see their current status: leading, outbid, or reached maximum.

**Anti-sniping:** a bid placed in the final 2 minutes extends the auction by 2 minutes, up to 10 extensions. The countdown resets and the extension is shown in the bid history.

**Bidder requirements:** L1 for auctions below the low-value threshold; L2 above it. Bidding is blocked for the seller and for accounts linked to the seller (US-09.08).

**Errors:** bid below minimum: the message states the minimum. Auction closed: the message says the auction has ended. Concurrent bid conflict: the system retries the server-side check and never silently drops a bid; if a bid cannot be accepted, the user sees the reason.

---

## F-17 Auction close and payment (R3)

**Trigger:** The scheduled end time is reached. [US-09.05, US-09.06, US-09.14]

**Steps:**
1. The closing job runs at the end time and determines the outcome: a winner (highest proxy bid at or above the reserve), reserve not met, or no bids.
2. **Winner:** the winner is notified. The order is created in `awaiting_payment` with a 48-hour window. The buyer pays through escrow (F-11, with the buyer's premium added).
3. **Reserve not met:** the seller can offer the highest bidder a second chance (F-18). If the seller takes no action within 24 hours, the auction ends.
4. **No bids:** the auction ends. The seller can relist.
5. **Missed payment:** if the winner does not pay within 48 hours, the order is cancelled, the winner receives a strike, and the seller may offer the item to the next-highest bidder within 24 hours.

**Done when:** the outcome is recorded once, with an audit event, and both sides see the same result.

---

## F-18 Second chance after reserve not met (R3)

**Trigger:** Reserve not met at auction close. [US-09.14]

**Steps:**
1. The seller sees the highest bid and may offer the item to that bidder at that price, valid 24 hours.
2. If accepted, an order is created in `awaiting_payment` with the usual window.
3. If declined or expired, the auction ends.

---

## F-19 Request for quote (RFQ) (R4)

**Trigger:** A business member wants to source goods or services. [US-10.05]

**Steps:**
1. The buyer creates an RFQ with requirements: category, quantity, specification, delivery location, delivery date, and deadline.
2. The system shows the RFQ to up to 20 matching L3 sellers in the same category, with the buyer's company name visible.
3. Sellers reply with price, availability, and terms before the deadline. Replies are visible to the buyer only.
4. The buyer compares replies and accepts one. Acceptance creates an order with the agreed terms.
5. Unaccepted RFQs close at the deadline. The buyer can close early.

---

## F-20 Sealed tender (R4)

**Trigger:** A business seller offers a lot by tender. [US-10.06]

**Steps:**
1. The seller publishes a tender with lot details, minimum price (optional, hidden), deadline, and award rules.
2. L3 buyers submit sealed bids before the deadline. Bids are hidden from everyone, including the seller, until the deadline.
3. At the deadline, the highest bid at or above the minimum is the provisional winner. The seller accepts or rejects.
4. Losing bidders are notified that they were not selected, without the winning price.

---

## F-21 Report content or a user

**Trigger:** Any signed-in or guest visitor selects "Report" on a listing, message, review, profile, or auction. [US-05.05, US-06.02]

**Steps:**
1. The visitor selects a reason category: scam, fake or misleading, prohibited item, stolen, harassment, spam, other.
2. The visitor adds an optional description (up to 500 characters).
3. The report is recorded and the reporter sees a confirmation.
4. Severity is assigned by reason and by the reported party's history. High severity (scam with payment, weapons, child safety, stolen goods) goes to the top of the queue with a 24-hour target.
5. The reporter is told the outcome in general terms ("We reviewed this and took action" or "We reviewed this and found no breach of our rules").

---

## F-22 Moderation review

**Trigger:** A listing is flagged by rules, a report reaches threshold, or a manual check is requested. [US-06.03, US-13.01]

**Steps:**
1. The case appears in the queue ordered by severity and age.
2. The moderator opens the case: listing or account, evidence, reporter notes, history.
3. The moderator chooses an action: approve, edit required, remove, restrict, suspend, or escalate to M2.
4. Each action requires a reason code and an internal note. Personal data is shown only if the case requires it and is logged.
5. The affected user receives a notice with the reason, the rule, and the appeal route.

**Targets:** high severity 24 hours; standard 3 business days.

---

## F-23 Appeal

**Trigger:** A user disagrees with a removal, restriction, or suspension. [US-06.04]

**Steps:**
1. The user submits an appeal from the notice within 30 days, with an optional explanation (up to 1,000 characters).
2. A different moderator from the original decision reviews the case within 7 days.
3. The decision is upheld, reversed, or changed. The user is notified with the outcome and reasons.
4. A second appeal is possible only to M2 and only with new information.

---

## F-24 Data export and account deletion

**Trigger:** The user requests a copy of their data or deletion of their account. [US-01.08]

**Export steps:**
1. The user requests an export.
2. The system prepares a JSON archive within 30 days (normally within minutes) covering profile, listings, messages sent and received, orders, reviews, and consent records.
3. The archive link is sent by email and expires after 7 days.

**Deletion steps:**
1. The user confirms deletion and sees what will be removed and what will be kept.
2. A 30-day cooldown starts. The user can cancel by signing in.
3. After the cooldown, the account is anonymised: name, contact details, and identity links are removed; listings are removed; messages are anonymised in the other party's view; reviews remain as anonymous with the rating.
4. Financial records are kept for the period required by law, with access restricted to finance staff.

---

## F-25 Promotion purchase (R2)

**Trigger:** A seller wants more visibility. [US-11.02]

**Steps:**
1. The seller chooses a promotion type (highlight, top of category, or featured), duration, budget, and targeting.
2. The price and maximum spend are shown before payment.
3. Payment through the same provider as escrow. The promotion becomes active when payment succeeds.
4. Promoted results are labelled "Promoted" and show advertiser information as required.

---

## F-26 Payout onboarding (R2)

**Trigger:** A seller with completed sales requests a payout. [US-07.03, US-15.04]

**Steps:**
1. The seller enters an IBAN. It is validated for format and checked for the account holder name matching the verified identity or company.
2. For sellers above the reporting threshold, trader and tax information is collected (see `technical/07-security-privacy.md`).
3. Payouts are scheduled weekly, or on demand above the minimum.
4. Each payout appears in the seller's dashboard with a reference.

---

## F-27 Business storefront (R4)

**Trigger:** A company wants a public storefront. [US-10.08]

**Steps:**
1. The company owner enables the storefront. The page shows the company name, verification badges, categories, active listings, and reviews from completed orders.
2. Contact is via chat only. No phone or email is published unless the company chooses to show them and the trader rules require it.
3. The storefront has its own URL and is indexed when it meets the minimum content rule (five active listings).
