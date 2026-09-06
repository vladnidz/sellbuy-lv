# SellBuy.lv — Full Technical & Functional Specification
*Every feature defined end-to-end: what it does, how it works, data model, edge cases, API shape, UI states. Status labels (Built/Partial/Planned) should be corrected against the live schema before this is trusted as ground truth — see the Documentation Gap Audit for why that check matters.*

---

## 0. Competitive matrix — what each platform has and misses

| Capability | SS.lv | Facebook Marketplace | eBay | OLX (template only — not live in LV) | prom.ua | SellBuy.lv target |
|---|---|---|---|---|---|---|
| Payment protection / escrow | ✗ | ✗ (outside US) | ✓ (managed payments) | ✓ (in its live markets) | ✓ (via own checkout) | ✓ — the core wedge |
| Visual/photo search | ✗ | ✗ | Partial | ✗ | ✗ | ✓ |
| AI listing assist (category/title/price) | ✗ | ✗ | Partial (price suggestions) | ✗ | ✗ | ✓ |
| Map/radius search | ✗ | Partial | ✗ | ✓ | N/A | ✓ |
| Native trilingual UI (LV/RU/EN) | ✗ (LV/RU only) | Auto-translate, imperfect | ✗ | N/A | ✗ (UA-focused) | ✓ |
| Business storefronts | Partial (dealer accounts) | ✗ | ✓ (stores) | Partial | ✓ (core model) | ✓ |
| Delivery/parcel-locker integration | ✗ | ✗ | Regional | ✓ | ✓ (Nova Poshta) | ✓ (Omniva/DPD via Montonio) |
| Seller ratings (C2C) | ✗ | Partial (profile history) | ✓ | ✓ | ✓ (for shops) | ✓ |
| ID/business verification | ✗ | ✗ | ✓ (business) | Partial | ✓ (registration check) | ✓ (DSA-driven) |
| Native mobile app quality | Weak | Strong | Strong | Strong | Moderate | Target: strong |
| Auction/bidding | ✗ | ✗ | ✓ | ✗ | ✗ | Not in MVP — evaluate for Phase 3 |
| Deep category taxonomy | ✓✓✓ (strongest in market) | ✗ (flat) | ✓ | Moderate | Moderate (own catalog structure) | ✓ (adopt SS.lv's depth) |

**Read from this table:** SS.lv's only real strength is category depth and reach — everything else is open. eBay is the only one of these with a fully proven trust+payment model, but it's not localized to Latvia. Nobody has the AI-assist layer yet.

---

## 1. Authentication & Registration

**User stories**
- As a new user, I need to register with email or phone so I can create listings.
- As a returning user, I need to log in quickly (including via social login) so friction doesn't cost a sale.
- As a buyer, I need to know a seller is real before I message them, so I need visible verification tiers.
- As a business, I need a separate registration path that collects legally-required trader information (DSA Article 30) before I can publish listings.

**Verification tiers (design this as tiers, not a single boolean)**
1. **Unverified** — email or phone confirmed only. Can browse, message, save, but listing creation may be capped or watermarked "unverified seller."
2. **Verified individual** — phone + selfie match, or Smart-ID/eParaksts. Unlocks full listing limits and a visible badge.
3. **Verified business** — company registration number checked against the Lursoft registry, plus the full DSA Article 30 dataset (name, address, phone, email, trade-register number, compliance self-certification) collected and stored before the first listing can go live.

**Data model**
```
User: id, email, phone, password_hash (nullable if OAuth-only),
      oauth_provider, oauth_id, role, verification_tier
      [unverified|verified_individual|verified_business],
      smart_id_verified_at, rating_avg, locale_pref, created_at,
      last_login_at

BusinessTraderInfo: user_id, company_name, registration_number,
      legal_address, contact_email, contact_phone,
      compliance_self_certified_at, lursoft_checked_at,
      lursoft_check_result
```

**Flow**
1. Sign-up: email/phone + password, or OAuth (Google/Apple/Facebook — Facebook login specifically lowers friction for users migrating off Facebook Marketplace).
2. Email/SMS verification code, 6-digit, 10-minute expiry, rate-limited (max 5 sends/hour/number to prevent SMS-bombing abuse).
3. Optional immediate upgrade path to "Verified individual" (Smart-ID/eParaksts flow) — surfaced contextually, e.g. right before a high-value listing goes live, not forced at signup (forcing it at signup kills conversion).
4. Business path is a distinct signup flow, not a checkbox on the individual one — collects the full trader dataset up front, blocks listing publication until `compliance_self_certified_at` is set.

**Edge cases**
- Phone number already registered under a different account → offer account recovery, don't silently merge.
- OAuth email collides with an existing password-based account → require password confirmation to link, never auto-merge.
- Business registration number fails the Lursoft check → allow signup but block listing publication with a clear "verification pending/failed" state, not a silent rejection.
- Session handling: JWT short-lived access token + refresh token; refresh token revocation list for logout-everywhere.

**API sketch**
```
POST /api/auth/register
POST /api/auth/register/business
POST /api/auth/verify-code
POST /api/auth/login
POST /api/auth/oauth/callback
POST /api/auth/refresh
POST /api/auth/logout-all
GET  /api/auth/me
```

---

## 2. Category Taxonomy & Browse

Covered in full depth in the companion `Category-Taxonomy.md` — summary of the contract this feature must satisfy:

- 12 top-level categories, ~100 second-level categories, verified against live SS.lv structure.
- Stored as `ltree` paths in Postgres (already implemented) — this is the right choice for ancestor/descendant queries and breadcrumb generation.
- **Reconciling "sub-sub-sub-categories" with the attribute-filter model**: the UI can and should *present* up to 4 levels in breadcrumbs and URLs (e.g. `Transports > Vieglie auto > BMW > 3 Series`) even though only the first 2–3 are real `Category` rows. Levels 3+ for high-cardinality dimensions (car brand/model, phone brand/model) are attribute filter values rendered as if they were category nodes — same URL structure, same breadcrumb, different backend representation. This gives users and SEO the deep-feeling navigation they expect from SS.lv without an unmaintainable node count.
- `attributes` JSONB column per listing (confirmed present in the live schema) holds the category-specific structured fields (brand, model, year, rooms, size, etc.) — the `Category.attribute_schema` should define which fields render for which category, and this needs to actually be documented per-category (currently isn't — add this to the P2 template rollout).

**Edge case worth documenting explicitly**: cross-listed leaf categories (e.g. "phone batteries" reachable from both Batteries and Phones→Accessories on the real SS.lv) — decide once whether SellBuy.lv listings get one primary category + optional secondary tags, or whether this cross-listing is dropped entirely for simplicity. Either is defensible; document the choice so it isn't silently reversed later.

---

## 3. Listings ("Items")

**User stories**
- As a seller, I need to create a listing with photos, a category, and category-specific details, so buyers can find and evaluate it.
- As a seller, I need to edit, relist, mark-sold, or delete a listing.
- As a buyer, I need a listing page with everything needed to decide without contacting the seller first.

**Data model** (matches the live schema's direction, filled out)
```
Listing: id, user_id, category_id, title, description, price,
      currency (EUR default), condition [new|like_new|used|for_parts],
      status [draft|active|sold|expired|removed],
      lat, lon, city, district, attributes (JSONB),
      view_count, favorite_count, created_at, updated_at,
      expires_at, boost_until

ListingImage: id, listing_id, url, sort_order, alt_text
```

**Lifecycle / state machine**
`draft → active → (sold | expired | removed)`. `active → active` on edit (don't reset `created_at`, do bump `updated_at` — sort-by-newest shouldn't be gameable by trivial edits). Expired listings should prompt a one-click relist, not force full re-entry.

**Edge cases**
- Price of €0 or missing — decide explicitly whether this means "free item" (legitimate, common in classifieds) or an invalid listing; don't let it default silently to one or the other.
- Category change after creation with attributes already filled — old attributes that don't fit the new category's schema need a defined fate (drop silently vs. warn the user).
- Image upload limits (count, size, format) and moderation on upload (see §10).
- Listing "bump"/relist frequency limits to prevent search-gaming via constant republishing.

**API sketch**
```
POST   /api/listings
GET    /api/listings/:id
PATCH  /api/listings/:id
DELETE /api/listings/:id
POST   /api/listings/:id/relist
POST   /api/listings/:id/mark-sold
GET    /api/categories/:id/listings   (paginated, filterable)
```

---

## 4. AI-Assisted Listing Creation

This is a genuine differentiator (nobody in the comparison table has it) and deserves its own precise spec rather than being folded into §3.

**User story**: As a seller, after I upload 3–5 photos, I want the system to suggest a category, a title, and a price range, so listing something takes under a minute instead of ten.

**How it should actually work**
1. **Category suggestion**: run an image classification pass against the photos (a lightweight vision model — doesn't need to be built from scratch; a pretrained image-classification model fine-tuned or prompted against SellBuy.lv's own category taxonomy is enough for v1) → return top-3 category matches, let the user pick or override. Never auto-select silently — always show the suggestion as a suggestion.
2. **Title suggestion**: once category + a couple of attribute fields are known (e.g. brand detected from image or user input), generate a title following a category-specific template (e.g. for cars: `"{brand} {model}, {year}, {mileage} km"`; for fashion: `"{brand} {item type}, size {size}, {condition}"`) rather than free-form generation — templated titles are more consistent, more SEO-friendly, and less likely to hallucinate a detail the photo doesn't support.
3. **Price benchmarking**: query active + recently-sold listings in the same category with similar attributes (same brand/model/year bucket, same district for real estate) → show a price range, not a single number, with a sample size ("based on 14 similar listings"). Suppress the suggestion entirely when sample size is too small to be meaningful (e.g. under 5) rather than showing a misleadingly precise number.
4. **Duplicate/scam pattern check** runs at the same time (see §10) — this is the fraud-prevention half of the same pipeline, not a separate feature.

**Edge cases**
- Low-confidence category suggestion (no class above some threshold) → don't force a guess, fall back to manual category picker with no pre-fill.
- Suggested title in the wrong language for the seller's locale — templates need per-locale versions (LV/RU/EN), not just translated after the fact.
- Price suggestion should visibly explain condition adjustment (a suggestion for "new" shouldn't be shown unmodified against a listing marked "used").

**Data model addition**
```
ListingAISuggestion: listing_id, suggested_category_id, suggested_title,
      suggested_price_min, suggested_price_max, sample_size,
      confidence_score, accepted (boolean), created_at
```
Storing whether a suggestion was accepted or overridden is what lets you actually measure and improve this feature later — don't skip it.

---

## 5. Search & Discovery

**User stories**
- As a buyer, I need full-text search across LV/RU/EN with typo tolerance.
- As a buyer, I need to filter by category-specific attributes and see results update without a page reload.
- As a buyer, I need a map view with radius search.
- As a buyer, I need to save a search and get alerted on new matches.

**How it works**
- Meilisearch (or equivalent) index synced from Postgres on listing create/update/delete — near-real-time, not a nightly batch (a listing that isn't searchable for hours is a dead listing).
- Facets derived from each category's `attribute_schema`, not hardcoded per category in the search layer — adding a new attribute to a category shouldn't require a search-service code change.
- Map search via PostGIS radius query (`ST_DWithin`), combined with the same facet filters, not a separate code path.
- Saved search = a stored, named filter set + `notify_enabled` boolean; a background job periodically diffs new matching listings against "last checked" and fires notifications (§9).

**Edge cases**
- Search relevance for LV/RU mixed queries (a Russian-speaking user searching a Latvian listing title) — this is the actual hard part of trilingual search; test it explicitly, don't assume the search engine handles cross-lingual matching for free.
- Empty result states need to suggest broadening filters, not just show "no results."
- Saved search matching a listing that's since sold/expired shouldn't still notify.

**API sketch**
```
GET  /api/search?q=&category=&filters=&lat=&lon=&radius=
POST /api/saved-searches
GET  /api/saved-searches
DELETE /api/saved-searches/:id
```

---

## 6. Chat / Messaging

**User stories**
- As a buyer, I need to message a seller about a specific listing without exposing my phone number until I choose to.
- As a seller, I need quick-reply templates for the questions I get on every listing.
- As either party, I need messages auto-translated if we don't share a language.

**Data model** (extend the existing Chat/Message models)
```
Conversation: id, listing_id, buyer_id, seller_id, created_at,
      last_message_at

Message: id, conversation_id, sender_id, body, translated_body,
      translated_lang, sent_at, read_at, message_type
      [text|quick_reply|system]
```

**Flow**
1. Buyer taps "Message seller" on a listing → creates or reuses the `Conversation` for that (listing, buyer, seller) triple.
2. Messages send over WebSocket for real-time delivery; fall back to polling if the socket drops.
3. Auto-translate runs server-side on send if sender/recipient locale differs, storing both the original and translated body (never translate-and-discard the original — disputes and moderation need the source text).
4. Quick-reply templates are per-seller, editable, and suggested contextually ("Is this still available?" gets a one-tap "Yes, still available" reply option).

**Edge cases**
- Blocked/reported users must not be able to open new conversations with the reporter, but existing conversation history should stay visible to the reporter for evidence.
- Listing sold/removed mid-conversation — conversation should stay accessible (for dispute/history) but show a clear "this listing is no longer active" banner.
- Message rate limiting to prevent spam (a new unverified account messaging 50 sellers in a minute is a spam signal, not normal use).

**API sketch**
```
POST /api/conversations           (listing_id, seller_id)
GET  /api/conversations
GET  /api/conversations/:id/messages
POST /api/conversations/:id/messages
WS   /ws/conversations/:id
```

---

## 7. Ratings, Reviews & Profiles

**Current known gap**: no `Rating` model exists in the live schema yet — this section is a build spec, not a description of something live. Do not let any other doc describe this as built until it actually is.

**User stories**
- As a buyer, after completing a transaction I need to rate the seller so future buyers can trust them.
- As any user, I need to see a seller's rating, review count, response rate, and "member since" before messaging or buying.

**Data model**
```
Rating: id, transaction_id (nullable — see eligibility note below),
      author_id, target_id, listing_id, score (1-5), comment,
      created_at

User (additions): rating_avg (denormalized, recomputed on new rating),
      rating_count, response_rate, avg_response_time_minutes
```

**Eligibility rule (decide this explicitly, don't leave it implicit)**: should rating require a completed escrow transaction (strong anti-abuse, but blocks ratings until payments/escrow ships), or just a confirmed chat interaction plus both parties marking the listing "completed" (weaker, but works before escrow exists)? Given escrow is Phase 2, launching ratings tied to chat-completion first and tightening the eligibility rule once escrow ships is the pragmatic sequencing — but write down which rule is live at any given time, since this exact ambiguity is what caused the profiles.md/ratings.md contradiction already found in this repo.

**Edge cases**
- One rating per (author, transaction) pair — prevent rating-spam from repeat interactions with the same person.
- Rating disputes/removal process for clearly retaliatory or abusive reviews — needs a moderation path, not just a report button that does nothing.
- New sellers with zero ratings shouldn't be visually penalized (no rating ≠ bad rating) — design the "no reviews yet" state deliberately.

---

## 8. Payments & Escrow

**User stories**
- As a buyer, I want to pay through the platform and know my money is protected until I confirm receipt.
- As a seller, I want funds released promptly once the buyer confirms, without excessive holds.
- As either party, I need a dispute path if something goes wrong.

**Flow**
1. Buyer initiates payment via Montonio (primary) / Stripe (card fallback) / Paysera (bank transfer).
2. Funds move into an escrow hold — either via the payment provider's native hold/capture flow, or a ledger table you fully reconcile if the provider doesn't support holding natively. Do not build ad-hoc balance tracking without a reconciliation job that verifies platform ledger totals against actual provider balances daily.
3. Delivery/handover happens (in person or via parcel locker).
4. Buyer confirms receipt within a defined window (e.g. 3 days after delivery confirmation, or 7 days after payment if no delivery tracking) → funds release to seller minus platform fee.
5. No confirmation and no dispute within the window → auto-release (don't let funds sit in limbo indefinitely).
6. Dispute raised → funds freeze, moves to a manual review queue.

**Data model**
```
Transaction: id, listing_id, buyer_id, seller_id, amount, currency,
      platform_fee, status [pending|escrow_held|released|refunded|disputed],
      payment_provider, payment_provider_ref, escrow_deadline,
      created_at, released_at

Dispute: id, transaction_id, raised_by, reason, status [open|resolved],
      resolution, created_at, resolved_at
```

**Edge cases**
- Partial refunds (item partially matches description) — decide if this is supported in v1 or full-refund-only initially.
- Currency: EUR-only simplifies this considerably; don't add multi-currency until there's an actual cross-border use case.
- Payment provider webhook failures/retries — escrow status must be reconciled against the provider's source of truth, not just trusted from a single webhook delivery.

---

## 9. Business Accounts & Storefronts

**User stories**
- As a business seller, I need a branded shop page distinct from my individual profile.
- As a business seller, I need to bulk-upload my inventory rather than creating listings one by one.
- As a business seller, I need analytics on views/contacts/conversion per listing.

**Data model**
```
BusinessProfile: user_id, shop_name, shop_slug, logo_url, banner_url,
      description, subscription_tier [free|pro|premium],
      subscription_expires_at

(Listing gains) business_profile_id (nullable)
```

**Flow**
- Free tier: capped listing count, no analytics, no boosted placement (mirrors prom.ua's proven free-tier wedge).
- Bulk upload via CSV/XML with a defined schema (map to `Category` + `attributes` JSONB) — validate and show per-row errors, don't fail the whole batch on one bad row.
- Analytics: views, favorites, contact-rate, and conversion-to-sale per listing, aggregated to a shop-level dashboard.

**Edge cases**
- A business account's individual-user history (if the same person had a personal account first) — decide whether these merge or stay separate; separate is simpler and avoids trust-signal confusion (a personal rating shouldn't transfer to imply business trustworthiness).

---

## 10. Moderation, Trust & Safety, Compliance

**User stories**
- As a platform, I need every business seller's trader info collected and verified before their listings go live (legal requirement, not optional).
- As a user, I need to report a listing or user and get a real response.
- As a moderator, I need a queue with enough context to act quickly.

**Flow**
- Automated pre-publish checks: prohibited-item keyword/image detection, duplicate-listing detection (reverse image hash comparison against recent listings), scam-phrase detection on description text.
- Flagged listings go to a moderation queue before going live; clean listings publish immediately (don't add friction to the 99% of legitimate listings).
- User reports create a `Report` record, trigger an SLA timer, and require a `statement_of_reasons` on any resulting removal (DSA requirement).

**Data model**
```
Report: id, target_type [listing|user], target_id, reporter_id,
      reason, status [open|actioned|dismissed], statement_of_reasons,
      created_at, resolved_at

ModerationFlag: id, listing_id, flag_type [prohibited_item|duplicate|
      scam_pattern], confidence, auto_actioned (boolean), created_at
```

**Compliance checklist tied to this feature** (from the legal brainstorm, now made concrete):
- [ ] Trader traceability data collected and verified before business listing publication (§1)
- [ ] Notice-and-action system for illegal content (this section)
- [ ] Statement of reasons on every content removal
- [ ] Internal complaints/appeal process for actioned reports
- [ ] No dark patterns in cancellation/refund/unsubscribe flows

---

## 11. Notifications

**User stories**
- As a user, I need to know immediately when I get a message, a saved-search match, or an offer response.
- As a user, I need to control which notifications come via push vs. email vs. neither.

**Data model**
```
NotificationPreference: user_id, channel [push|email], category
      [messages|saved_search|price_drop|offers|marketing], enabled

Notification: id, user_id, type, payload (JSONB), read_at, created_at
```

**Edge cases**
- Notification fatigue from saved searches on broad queries — consider batching ("12 new listings match your search" digest) rather than one push per new listing when volume is high.
- Marketing notifications must be opt-in by default, not opt-out (both good practice and DSA-adjacent — avoid dark-pattern consent flows).

---

## 12. Logistics & Delivery

**User stories**
- As a buyer, I want to choose a parcel locker at checkout instead of arranging pickup.
- As a seller, I want a shipping label generated automatically once a locker is chosen.

**Flow** — via Montonio's combined payment+delivery checkout: buyer selects Omniva/DPD locker at the same step as payment, seller receives a label to print/scan, tracking number attaches to the `Transaction` record automatically.

**Data model**
```
Shipment: id, transaction_id, carrier [omniva|dpd|other],
      locker_id, tracking_number, label_url, status
      [label_created|in_transit|delivered|returned], created_at
```

**Edge cases**
- Buyer confirms receipt but tracking still shows "in transit" — decide whether buyer confirmation or carrier delivery event is authoritative for releasing escrow (buyer confirmation should win — a buyer confirming early because they picked it up in person themselves is legitimate).
