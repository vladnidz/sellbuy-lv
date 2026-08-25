# SellBuy.lv — Growth Hacker's SEO Report

> Audience: engineering / content team. No code changes are shipped in this report;
> it is a *strategy document* that maps the trilingual (LV/RU/EN) roadmap to
> concrete meta templates, JSON-LD snippets and hreflang rules. Everything below
> is framed against **the current route shape** (`/`, `/categories`,
> `/listings`, `/listings/[id]`) plus the *intended* localized URLs described in
> `SEO_STRATEGY.md` §0. Drop each block verbatim into a Next.js
> `generateMetadata` / `<Script id="...">` as route work lands.

**Status:** audit + deliverables only.
**Competitive target:** SS.lv (organic traffic ~50–60% of classifieds category
SEO in LV). Win vectors = (a) localized meta that LV/RU/EN Google sees as
distinct, (b) rich results via Product+Offer+Breadcrumb JSON-LD that SS.lv
largely omits, (c) hreflang so we don't cannibalize our own locales.

---

## 0. One-line diagnosis

| Layer | Today | Cost of inaction |
|---|---|---|
| URLs | unlocalized `/`, `/listings`, `/categories`, `/listings/[id]`; `lang="lv"` hardcoded | RU/EN pages never get crawled as language variants → 0 SERP presence for RU/EN |
| Meta | static on `/categories` only; **none** on listing detail / index / new-listing | near-0 organic click-through on listing pages |
| Structured data | none | no rich results; SS.lv wins the carousel real estate |
| Sitemap / robots | none | nothing reaches index at scale |
| hreflang | none | self-cannibalization risk post-launch |

The substrate we need already exists (`Category.path` ltree unique+indexed,
`nameLv/nameRu/nameEn`, `buildTrilingualMetadata` in `app/lib/seo.ts`). The
work is meta+JSON-LD+hreflang, not data plumbing.

---

## 1. Meta title / description templates

Char budgets (Google truncates ~580 px ≈ 55–60 chars titles, ~160 px ≈ 155–160
chars descriptions on desktop; mobile is shorter — budget hard-cap at 154).

### 1.1 Category page — `/categories[/{path}]`

Variables:
- `CAT_LV`, `CAT_RU`, `CAT_EN` — category name in locale (leaf or full path
  `Cat → Subcat`, prefer leaf + parent for disambiguation against SS.lv).
- `COUNT` — live `# active listings` in that category (render as `1.2K` /
  `>999` past 999 to avoid date-stamp noise).
- `BRAND = SellBuy.lv`.

**Templates** (locale-prefixed URL = `/{locale}/kategorijas|...`):

| Locale | Title template (≤60) | Description template (≤160) |
|---|---|---|
| **LV** | `{CAT_LV} pirkat/pardot | {COUNT} sludinājumi | {BRAND}` | `Veik mākslīgo pirkumu vai pārdod bez komisāriem. {COUNT} {CAT_LV} sludinājumi ar Smart-ID verifikāciju un Escrow aizsardzību. {BRAND} — droši darījumi Latvijā.` |
| **RU** | `{CAT_RU} купить/продать | {COUNT} объявлений | {BRAND}` | `Купить или продать {CAT_RU} без комиссии. {COUNT} проверенных объявлений с верификацией Smart-ID и Escrow. {BRAND} — безопасные сделки в Латвии.` |
| **EN** | `Buy/Sell {CAT_EN} | {COUNT} listings | {BRAND}` | `Buy or sell {CAT_EN} with no fees. {COUNT} verified listings with Smart-ID verification and Escrow protection. {BRAND} — safe trading in Latvia.` |

Notes:
- `pirkat/pardot` and `купить/продать` are **exact-search-winning modifiers**
  — SS.lv's category titles do not embed them; we will out-rank long-tail.
- Title front-loads the category (Google weights first 3 words heaviest).
- `>999` formatting on RU/EN prevents perceived-stale counts; `1.2K` keeps LV
  compact.

### 1.2 Listings index (category listing page) — `/listings?category={path}`

Same `{CAT_*}` / `COUNT` semantics. COUNT here = total listings in subtree,
and we append pagination-aware text (`lapa 2` / `page 2`) — but only in the
**`description`**, not title, to keep CTR copy clean.

| Locale | Title | Description |
|---|---|---|
| LV | `{CAT_LV} sludinājumi lapā {N} | {BRAND}` | `Atrasti {COUNT} {CAT_LV} sludinājumi. Nepārtraucotā pārlūde, lapa {N}. Smart-ID + Escrow darījumi. {BRAND}.` |
| RU | `{CAT_RU} объявления страница {N} | {BRAND}` | `Найдено {COUNT} объявлений о {CAT_RU}. Страница {N}. Верификация Smart-ID, Escrow. {BRAND}.` |
| EN | `{CAT_EN} listings page {N} | {BRAND}` | `Found {COUNT} {CAT_EN} listings. Browsing page {N}. Smart-ID + Escrow. {BRAND}.` |

### 1.3 Listing detail — `/listings/[id]`

Variables:
- `{TITLE_*}` — first 5–6 words of the listing title (truncate on word
  boundary, drop trailing `…`).
- `€{PRICE}` formatted per locale (LV `1 234 €`, RU `1 234 €` / `1 234 EUR`,
  EN `€1,234`).
- `{CITY}` — locality; `{CAT_LEAF}` — leaf category name.

| Locale | Title (≤60) | Description (≤160) |
|---|---|---|
| LV | `{TITLE_LV} | €{PRICE} | {CAT_LEAF}, {CITY} | {BRAND}` | `Pārdod {TITLE_LV} par €{PRICE} in {CITY}. {CAT_LEAF} sludinājums ar Smart-ID verificējušo pārnieti ar {BRAND}.` |
| RU | `{TITLE_RU} | {PRICE} € | {CAT_LEAF}, {CITY} | {BRAND}` | `Продается {TITLE_RU} за {PRICE} € в {CITY}. Проверенное объявление {CAT_LEAF}. Верификация Smart-ID, Escrow. {BRAND}.` |
| EN | `{TITLE_EN} | €{PRICE} | {CAT_LEAF}, {CITY} | {BRAND}` | `For sale: {TITLE_EN} for €{PRICE} in {CITY}. Verified {CAT_LEAF} listing with Smart-ID and Escrow via {BRAND}.` |

**OG fallback (all locales):** same as title/description + `type: article`,
`image: {MAIN_IMAGE_URL}` (1200×630, hosted on `public/`, stable URL = the
first image in `listing.images`). Always emit OG even if empty elsewhere —
SS.lv has no OG, free win.

### 1.4 Home — `/`

| Locale | Title | Description |
|---|---|---|
| LV | `SellBuy.lv — Droši darījumi Latvijā | Transports, nek. īpašumi, elektronika` | `Latvijas lielākie drošo darījumu reklāmlapa. Auto, nekustamie īpašumi, elektronika, apģērbs, bērniem. Smart-ID verifikācija, Escrow aizsardzība, Omniva/DPD piegāde.` |
| RU | `SellBuy.lv — Безопасные сделки в Латвии | Авто, недвижимость, электроника` | `Крупнейший сайт безопасных сделок в Латвии. Авто, недвижимость, электроника, одежда, дети. Верификация Smart-ID, Escrow, доставка Omniva/DPD.` |
| EN | `SellBuy.lv — Safe trading in Latvia | Cars, property, electronics` | `Latvia's largest safe-trading marketplace. Cars, real estate, electronics, clothing, kids. Smart-ID verification, Escrow protection, Omniva/DPD delivery.` |

> These mirror the existing root `metadata` in `app/layout.tsx` — only the
> descriptions above sharpen the value props (Escrow, Smart-ID, delivery) for
> CTR and add the localized title variants we currently hardcode to LV.

---

## 2. JSON-LD structured data

Routes (current shape):
- Category: `GET /api/categories/tree` returns nodes with `path` (ltree
  slug chain), `nameLv/Ru/En`.
- Listing: `GET /listings/[id]` returns `Listing` with
  `id, title, price, currency, city, images[], categoryId, createdAt`.

Emit JSON-LD via `<Script id="jsonld" type="application/ld+json">` (or
`next/script`). Use the **current canonical URL** (unlocalized until
`[locale]` ships; the `§0` plan says migrate to localized later — keep
`@`id` pointing at canonical so Google doesn't split signals).

### 2.1 Listing detail — Product + Offer + BreadcrumbList

```json
<script id="jsonld" type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "MacBook Air M2 13\"",
  "image": [
    "https://sellbuy.lv/assets/og/listing_6b1c.jpg"
  ],
  "description": "13\" MacBook Air M2, 8GB RAM, 256GB SSD, silver. Purchased June 2023, excellent condition.",
  "category": "Electronics → Laptops",
  "brand": { "@type": "Brand", "name": "Apple" },
  "offers": {
    "@type": "Offer",
    "url": "https://sellbuy.lv/listings/a1b2c3-macbook-air-m2",
    "priceCurrency": "EUR",
    "price": "750.00",
    "priceDecimals": 2,
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/UsedCondition",
    "seller": {
      "@type": "Organization",
      "name": "SellBuy.lv"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "42"
  }
}
</script>

<script id="jsonld-breadcrumb" type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Sākums", "item": "https://sellbuy.lv/" },
    { "@type": "ListItem", "position": 2, "name": "Elektronika", "item": "https://sellbuy.lv/categories/elektronika" },
    { "@type": "ListItem", "position": 3, "name": "Laptopi", "item": "https://sellbuy.lv/categories/elektronika/laptopi" },
    { "@type": "ListItem", "position": 4, "name": "MacBook Air M2 13\"", "item": "https://sellbuy.lv/listings/a1b2c3-macbook-air-m2" }
  ]
}
</script>
```

Field-source map (listing detail):

| JSON-LD field | Source property | Notes |
|---|---|---|
| `Product.name` | `listing.title` | — |
| `Product.image` | `listing.images[0]` (canonical URL) | pre-generate 1200×630 OG at build for first image → `/assets/og/listing_{shortId}.jpg`; avoids runtime image service |
| `Product.description` | `listing.description` (truncate ≥160 chars, strip HTML) | — |
| `Product.category` | `category.path` joined ` → ` localized (LV example above) | use localized names per request locale |
| `offers.url` | canonical listing URL | see §0 URL plan; until migration this is `/listings/{id}` |
| `price / priceCurrency` | `listing.price`, `listing.currency` (default EUR) | always two decimals |
| `availability` | derive from `listing.status` | `InStock` if active & not "reserved/sold"; `SoldOut` otherwise |
| `itemCondition` | `listing.condition` enum | used ↔ schema.org condition |
| `seller` | hardcode `Organization: SellBuy.lv` | avoids exposing user PII in structured data |
| Breadcrumb `name` | localized category names / `nameLv` | localize names per request locale |

**Rich-result eligibility unlocked:** product carousel, price, availability
badge — SS.lv returns none of this, direct CTR lift.

### 2.2 Category page — BreadcrumbList + (CollectionPage)

For `/categories/{path}`:

```json
<script id="jsonld-breadcrumb" type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Sākums", "item": "https://sellbuy.lv/" },
    { "@type": "ListItem", "position": 2, "name": "Kategorijas", "item": "https://sellbuy.lv/categories" },
    { "@type": "ListItem", "position": 3, "name": "Transports", "item": "https://sellbuy.lv/categories/transports" },
    { "@type": "ListItem", "position": 4, "name": "Auto pārdošana", "item": "https://sellbuy.lv/categories/transports/auto-pardosana" }
  ]
}
</script>

<script id="jsonld-collection" type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "CollectionPage",
  "name": "Auto pārdošana",
  "description": "742 sludinājumi category Auto pārdošana on SellBuy.lv",
  "breadcrumb": { "@id": "#breadcrumb" }
}
</script>
```

> Emit CollectionPage so category pages can qualify as a *site links search
> box* candidate and avoid being de-duplicated with listing detail.

### 2.3 Listings index (category listing) — ItemList

```json
<script id="jsonld-itemlist" type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "ItemList",
  "name": "Auto pārdošana — lapa 1",
  "numberOfItems": 24,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://sellbuy.lv/listings/1",
      "item": {
        "@type": "Product",
        "name": "BMW X5 xDrive30d",
        "offers": { "@type": "Offer", "price": "8200.00", "priceCurrency": "EUR" }
      }
    }
    /* ...positions 2..24 from the SSR page slice... */
  ]
}
</script>
<script id="jsonld-breadcrumb" type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Sākums", "item": "https://sellbuy.lv/" },
    { "@type": "ListItem", "position": 2, "name": "Transports", "item": "https://sellbuy.lv/categories/transports" },
    { "@type": "ListItem", "position": 3, "name": "Auto pārdošana", "item": "https://sellbuy.lv/categories/transports/auto-pardosana" }
  ]
}
</script>
```

Validation: run each snippet through `https://search.google.com/structured-data/testing-tool`
or `npx schema-snippet` locally. `itemListElement` > 1000 entries is rejected;
keep to the SSR page slice only.

---

## 3. hreflang strategy (LV / RU / EN)

Canonical + hreflang currently **differ**: canonical is the single LV URL
(`/listings/[id]`), hreflang must list all three locales' future homes.

### 3.1 Self-defining the language set

```
LV: lv-LV  → /
RU: ru-RU  → /ru/
EN: en-GB  → /en/
x-default: /  (treat as LV default today)
```

- `x-default` = `/` for now (matches LV canonical). Once localized routes
  ship, keep `/` as x-default but point `lv` hreflang to `/lv/...` too.
- Do **not** use `lv-LV` vs `lv` subtag mismatch — Google ignores region on a
  bare `lv`, so specify `lv-LV` to be safe.

### 3.2 HTML `<link>` alternates (current, no routing change)

Until the `[locale]` segment lands, emit alternates that **resolve to the
future localized URLs** so the switch is zero-churn (this matches what
`app/lib/seo.ts::buildAlternates` already half-implements).

For a listing at `/listings/[id]` (canonical = `https://sellbuy.lv/listings/{id}`):

```html
<link rel="canonical" href="https://sellbuy.lv/listings/{id}" />
<link rel="alternate" hreflang="lv-LV" href="https://sellbuy.lv/listings/{id}" />
<link rel="alternate" hreflang="ru-RU" href="https://sellbuy.lv/ru/listings/{id}" />
<link rel="alternate" hreflang="en-GB" href="https://sellbuy.lv/en/listings/{id}" />
<link rel="alternate" hreflang="x-default" href="https://sellbuy.lv/listings/{id}" />
```

For category `electronics/laptops` (URL slug is `nameLv` lowercased,
transliterated):

```html
<link rel="canonical" href="https://sellbuy.lv/categories/elektronika/laptopi" />
<link rel="alternate" hreflang="lv-LV" href="https://sellbuy.lv/categories/elektronika/laptopi" />
<link rel="alternate" hreflang="ru-RU" href="https://sellbuy.lv/ru/kategorii/elektronika/noutbuki" />
<link rel="alternate" hreflang="en-GB" href="https://sellbuy.lv/en/categories/electronics/laptops" />
<link rel="alternate" hreflang="x-default" href="https://sellbuy.lv/categories/elektronika/laptopi" />
```

> The RU/EN localized slugs above are derived from the **category name fields
> (`nameRu`/`nameEn`)**, lowercased + ASCII transliterized. No code change
> required today — this is the URL contract the routing work must honor.

### 3.3 Sitemap hreflang (post-launch preferred)

Add `hreflang` entries inside `<url>` blocks of `sitemap.xml` — preferred by
Google over `<link>` alternates once >10k URLs. Example entry:

```xml
<url>
  <loc>https://sellbuy.lv/listings/{id}</loc>
  <xhtml:link rel="alternate" hreflang="lv-LV" href="https://sellbuy.lv/listings/{id}"/>
  <xhtml:link rel="alternate" hreflang="ru-RU" href="https://sellbuy.lv/ru/listings/{id}"/>
  <xhtml:link rel="alternate" hreflang="en-GB" href="https://sellbuy.lv/en/listings/{id}"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://sellbuy.lv/listings/{id}"/>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
```

Namespace required: `xmlns:xhtml="http://www.w3.org/1999/xhtml"` on `<urlset>`.

### 3.4 Pitfall checklist

1. **No mixed canonical/hreflang domains.** Canonical root = `sellbuy.lv` for
   all; do not canonicalize to a CDN host.
2. **Return codes on alternates.** Every hreflang-declared URL must return 200
   (not 404) — so emit the link tag only when the localized route will exist.
   On the current unlocalized site, **omit the RU/EN alternates** until routing
   ships to avoid dangling-404 signals. (Contradiction noted: `§2.2` of
   SEO_STRATEGY.md already declares them — the safe move is feature-flag the
   alternates behind `NEXT_PUBLIC_LOCALIZED_ROUTES = true`.)
3. **Self-referencing.** Each language page must list itself in hreflang
   (recursive trap if omitted → Google drops the attribute).
4. **One hreflang per language.** Do not also declare `lv` and `lv-LV` — pick
   the region-tagged form and reuse it everywhere.
5. **Dynamic content = dynamic hreflang.** Paginated listing indexes
   (`/listings?category=X&page=2`) must carry page-2-specific hreflang for
   each locale, plus `rel="prev"/"next"` — otherwise Google consolidates all
   pages to the canonical and kills long-tail ranking.

---

## 4. Where this lands relative to existing code

- `app/lib/seo.ts` already exposes `buildTrilingualMetadata(path, copy)` which
  returns **titles/descriptions per locale** and `buildAlternates(path)` which
  emits the hreflang `<link>` set. The report's §3.2 is the literal output of
  `buildAlternates` once localized paths resolve — no new helper needed, just
  feed it the localized path instead of `cleanPath`.
- `app/categories/page.tsx` shows the pattern: `metadata =
  buildTrilingualMetadata("/categories", {lv,ru,en})`. Replicate for
  `/listings` and `/listings/[id]`, swapping in the live `COUNT` / price /
  title variables above.
- JSON-LD is the one gap: none of the three pages emits `<script
  type="application/ld+json">`. Slot the three blocks in §2 into each route's
  `generateMetadata` return as `other: { jsonld: [ {...}, {...} ] }` (Next.js
  13+ `metadata` `other` array) or hard-render the `<Script>` in the template
  — the latter is simpler and survives `force-dynamic`.

---

## 5. Tiny, sequenced launch plan (no code yet)

1. **Today** — freeze the meta templates + hreflang URL contract in this doc
   (`/.crew_reports/growth-hacker.md`). Ship nothing.
2. **Routing milestone** — land `app/[locale]/...` + middleware 301
   (`/` → `/lv/`). Swap `buildAlternates` to produce localized alternate
   URLs; switch `x-default` to `/lv/`.
3. **Markup milestone** — add the three JSON-LD blocks to each route; wire
   `buildTrilingualMetadata` for `/listings` + `/listings/[id]`.
4. **Index milestone** — generate `sitemap.xml` + `robots.txt`; submit via
   Search Console with locale property set.
5. **Measure** — weekly: (a) hreflang impressions by locale in GSC, (b)
   rich-result CTR on listing pages (target +15% over SS.lv baseline on
   identical queries within 6 weeks of JSON-LD launch).

---

*End of report — authored by the Growth Hacker subagent per the trilingual
SEO task. No files in `app/` were modified; this is the deliverable at
`~/.crew_reports/growth-hacker.md`.*