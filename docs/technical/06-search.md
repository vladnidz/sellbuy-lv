# 06 — Search and indexing

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026 · Release: R1 (launch engine), R2 (ranking features)

## 1. Requirements

- Search across titles, descriptions, and attribute values, in Latvian, Russian, and English.
- Typo tolerance and diacritics insensitivity.
- Faceted filtering by category attributes, with counts.
- Sort: relevance, newest, price ascending and descending, distance, ending soonest (auctions), bump order.
- Keyset pagination with stable results.
- p95 under 300 ms at 500,000 active listings, with faceted filters.
- Index freshness: a published listing is searchable within 10 seconds; an expired or removed listing disappears within 60 seconds.
- Shareable URLs for any search state.

## 2. Engine choice

Launch: PostgreSQL 17 with a generated `tsvector` column per listing, GIN index, `pg_trgm` for typo tolerance, and filter columns via `ListingAttributeValue`.

Rationale: one datastore, transactional consistency with listing state, low operational cost. The known limit is faceted query cost at large scale.

Migration trigger: 500,000 active listings, or p95 above 300 ms for two weeks, or more than 50 facet queries per second at peak. Replacement: Meilisearch or OpenSearch behind the same `SearchService` interface, fed by the outbox (section 6).

## 3. Language processing

### 3.1 Normalisation function

Applied to indexed text and to queries:
1. Unicode NFC normalisation.
2. Lowercase (locale-independent, `lower()` with `C` collation for matching).
3. Latvian diacritics folding: `ā→a`, `č→c`, `ē→e`, `ģ→g`, `ī→i`, `ķ→k`, `ļ→l`, `ņ→n`, `š→s`, `ū→u`, `ž→z`. The unfolded and original forms are both indexed so that exact accent matches rank higher.
4. Russian-Latin transliteration for queries: a query typed in Latin letters that matches a Cyrillic title (for example `velosiped` matching `велосипед`) is matched through an alias table, not by automatic transliteration, to avoid false matches.
5. Stop words: a small list per language (LV, RU, EN) for function words. Keep numerals and units.
6. Unit normalisation: `gb`, `GB`, `Gb` map to `gb`; `cm`, `mm`; `kw` and `kW` to `kw`.

### 3.2 Dictionaries

PostgreSQL text search configurations:
- `sellbuy_lv` (simple dictionary with folding; Latvian Snowball stemmer if available in the build, otherwise simple).
- `sellbuy_ru` (Russian Snowball).
- `sellbuy_en` (English Snowball).

Each listing's `searchVector` concatenates weighted fields:
- Weight A: title, brand, model.
- Weight B: category aliases and attribute labels with values.
- Weight C: description.
- Weight D: location city and district.

### 3.3 Synonyms and aliases

- Category aliases (for example "velosipēds", "велосипед", "bike") are indexed on the category and added to the query when a category term is detected.
- Brand aliases (for example "iphone" to Apple iPhone) come from the brand catalogue.
- Synonyms are curated; the list is versioned and reviewed monthly from zero-result queries.

### 3.4 Typos

- `pg_trgm` similarity on titles with threshold 0.4 for suggestions and 0.3 for fallback matches.
- Suggestion shown when zero results and a close match exists ("Did you mean …").
- Automatic fallback only when the original query yields fewer than five results.

## 4. Query model

```ts
type SearchQuery = {
  text?: string;                 // free text
  categoryCode?: string;         // subtree match via ltree
  attributes?: Record<string, string | number | boolean | [number, number]>;
  priceMin?: number;             // minor units
  priceMax?: number;
  condition?: ListingCondition[];
  city?: string;
  district?: string;
  radiusKm?: number;             // requires geo point
  center?: { lat: number; lng: number }; // approximate, 500 m offset already applied
  priceType?: PriceType[];
  deliveryOptions?: string[];
  auctionOnly?: boolean;         // R3
  sort: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'distance' | 'ending_soonest' | 'bump';
  cursor?: string;               // keyset cursor
  limit: number;                 // default 24, max 100
  locale: 'lv' | 'ru' | 'en';
};
```

The same structure is used as the URL state. It is serialised with stable ordering of keys, so identical searches produce identical URLs.

## 5. SQL shape (illustrative)

```sql
SELECT l.id, l.title, l.price_amount, l.published_at, l.bumped_at, ...
FROM   "Listing" l
WHERE  l.status = 'ACTIVE'
  AND  l."categoryPath" <@ $categoryPath               -- ltree subtree
  AND  ($text IS NULL OR l."searchVector" @@ $tsquery)
  AND  ($priceMin IS NULL OR l."priceAmount" >= $priceMin)
  AND  EXISTS (                                          -- attribute filter
         SELECT 1 FROM "ListingAttributeValue" v
         WHERE v."listingId" = l.id
           AND v."attributeId" = $attr1
           AND v."valueOption" = $val1)
  AND  (l."publishedAt", l.id) < ($cursorPublishedAt, $cursorId)   -- keyset
ORDER  BY l."publishedAt" DESC, l.id DESC
LIMIT  $limit + 1;
```

Facet counts are computed per filter group with the other filters applied, using one grouped query per group. The total count uses an approximate count for result sets above 10,000 (the UI shows "10 000+").

## 6. Indexing pipeline

1. A listing change writes to the database and to `OutboxEvent` in the same transaction (`listing.published`, `listing.updated`, `listing.removed`, `listing.expired`).
2. The worker reads outbox events in order per listing and updates the search projection. At launch the projection is the same table (`searchVector` maintained by trigger). After migration, the projection is the external index.
3. Triggers maintain `searchVector` on insert and update of `title`, `description`, and attributes. Attribute changes update the vector through a worker job for batches, to keep trigger work small.
4. Expired listings: a scheduled job sets `status = EXPIRED` and the index drops them within 60 seconds.
5. Rebuild: a full rebuild job re-computes vectors in batches of 1,000 with a resumable cursor. Runs off-peak. Not needed for normal operation.
6. Drift check: hourly job compares active listing counts by category between the database and the search projection. Differences above 0.5% raise an alert.

## 7. Ranking

Relevance score is computed by PostgreSQL `ts_rank_cd` with weights, then adjusted in the application:

```
score = text_relevance
      + freshness_boost(publishedAt, bumpedAt)   // decays over 14 days
      + quality_boost(qualityScore)              // 0 to 0.2
      + seller_boost(sellerScore, verificationLevel) // small, capped
      + promotion_slot                           // labelled, separate section, not mixed into organic ranking
```

Rules:
- Paid promotions appear in a separate, labelled section. They do not change organic order.
- No ranking boost for reviews the seller paid for or incentivised.
- Freshness and bump are the main levers for private sellers. Limited to one bump per 24 hours.
- Ranking factors are described on the help page (P2B transparency).
- Changes to ranking weights go through A/B testing with guardrails (US-16.08).

Ranking weights are configuration values, not hard-coded. Each change is recorded in `PlatformSetting`.

## 8. Personalisation (R2)

- Opt-in. Off for guests.
- Signals: recent views (last 30 days), saved searches, favourites, category preferences. Stored per user, deletable.
- Use: home feed and "similar items" only. Organic search results are not personalised at launch.
- Explanation: each recommendation shows the reason.

## 9. Geographic search

- Stored location is an approximate point: the true seller location is randomised within about 500 m, and the randomisation is fixed per listing so repeated views agree.
- Radius filter uses PostGIS-style distance on the approximate point, or the `earthdistance` extension if PostGIS is not used.
- Map clustering: server-side grid clustering by zoom level; returns at most 500 points per request.
- City and district are the primary location filters; radius is secondary.

## 10. Autocomplete and suggestions

- Prefix search over category names, brand names, and recent popular queries, per locale.
- Returns at most 8 suggestions, grouped by type (category, brand, query).
- Cached for 10 minutes per locale and prefix length.
- Does not reveal private data or other users' searches.

## 11. Analytics events (search)

| Event | Fields |
|---|---|
| `search_performed` | locale, query length (not text), filter count, sort, result count bucket, latency bucket |
| `search_zero_results` | locale, normalised query (only if it is in the curated synonym review list, else hashed) |
| `search_result_clicked` | listing ID, position, result count bucket |
| `search_filter_applied` | filter key (not value) |

Raw query text is not sent to third-party analytics. Zero-result queries are stored internally for synonym review, with a retention of 90 days.

## 12. Testing

| Test | Type |
|---|---|
| Normalisation function | Unit with fixtures per language |
| Diacritics folding both directions | Unit |
| Typo suggestions | Unit with fixture dictionary |
| Facet counts equal filtered counts | Integration |
| Keyset pagination stability under inserts | Integration |
| Expiry removes listings within 60 seconds | Integration |
| p95 at 500,000 listings | Load test (staging, synthetic data) |
| Search URL round trip | E2E |
| Ranking guardrail (no promoted item in organic top 3) | Contract |

## 13. Operational notes

- Index size: estimate about 2 KB per listing (vector, filters, metadata). At 500,000 listings, about 1 GB with indexes, comfortably within a standard managed database.
- Vacuum: autovacuum tuned for the listings table (higher scale factor for frequent updates from bumps and expiry).
- Monitoring: query p50, p95, p99 per query type; index hit ratio; slow query log above 200 ms.
