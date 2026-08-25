# SellBuy.lv — SEO & Meta Strategy (Trilingual LV/RU/EN)

**Scope:** category pages, listings index (`/listings`), listing detail (`/listings/[id]`), new-listing form.
**Status:** strategy document only — no code changes.

---

## 0. Current state (audit summary)

| Area | Today | Gap |
|---|---|---|
| Routing | Unlocalized routes (`/`, `/listings`, `/categories`, `/new-listing`) with `lang="lv"` hardcoded in root layout | No RU/EN crawlable URLs at all |
| Metadata | Static `metadata` exports on `/categories`; none on `/listings/[id]`, `/new-listing`; no `generateMetadata` anywhere | Listing pages have zero meta; no OG tags |
| Structured data | None | No Product/Offer/Breadcrumb JSON-LD → no rich results vs SS.lv |
| Sitemap | None | Nothing submitted to search engines |
| Category data model | `Category.path` (ltree, unique, GiST-indexed) + `nameLv/nameRu/nameEn` + JSONB `attributes` | Perfect substrate for canonical category URLs and per-language slugs |

**Recommended URL architecture (prerequisite for everything below):**

```
https://sellbuy.lv/lv/kategorijas/transports/auto-pardosana   ← LV = default, x-default
https://sellbuy.lv/ru/kategorii/transports/prodazha-avto      ← transliterated/localized slug
https://sellbuy.lv/en/categories/vehicles/car-sales
```

Implementation note: Next.js App Router `[locale]` segment (`app/[locale]/...`) with middleware redirect from legacy unlocalized URLs → `/lv/...` (301). Keep the existing ltree path as the *identifier*; derive per-language URL slugs from a slug map or from `nameLv/nameRu/nameEn` transliterated to ASCII. Never expose raw UUIDs in URLs — use `path` (ltree) segments joined by `/`.

---

## 1. Meta templates per route

### Char-length budgets

| Element | Budget | Hard cap | Notes |
|---|---|---|---|
| Title tag | 45–60 chars | 65 (~580px) | Brand suffix ` | SellBuy.lv` costs 13 chars — reserve it |
| Meta description | 120–158 chars | 165 (~920px) | Front-load category keyword + city/price hooks |
| H1 | ≤ 70 chars | — | May differ from title |
| OG title / description | same as title/description budgets | — | Reuse values |

### Route templates (placeholders in `{}`)

#### 1.1 Home `/[locale]`

| Lang | Title template | Example |
|---|---|---|
| LV | `Sludinājumi Latvijā — pērc un pārdod droši \| SellBuy.lv` | (58 ch) |
| RU | `Объявления в Латвии — покупай и продавай безопасно \| SellBuy.lv` | (62 ch → drop brand if >65) |
| EN | `Classifieds in Latvia — Buy & Sell Safely \| SellBuy.lv` | (54 ch) |

Descriptions (≤158):
- **LV:** `Vairāk nekā {N} sludinājumi Latvijā: transports, nekustamie īpašumi, elektronika. Smart-ID verifikācija, Escrow aizsardzība, Omniva/DPD piegāde.` (~146)
- **RU:** `Более {N} объявлений в Латвии: транспорт, недвижимость, электроника. Верификация Smart-ID, защита Escrow, доставка Omniva/DPD.` (~126)
- **EN:** `{N}+ listings across Latvia: vehicles, real estate, electronics. Smart-ID verification, Escrow protection, Omniva/DPD delivery.` (~128)

#### 1.2 Category hub `/[locale]/kategorijas` (current `/categories`)

- **LV title:** `Kategorijas — sludinājumi pēc tēmām | SellBuy.lv`
- **RU title:** `Категории — объявления по темам | SellBuy.lv`
- **EN title:** `Categories — Browse All Listings | SellBuy.lv`
- Descriptions mirror home pattern but lead with "visas kategorijas / все категории / all categories" + top 4 category names localized.

#### 1.3 Category page `/[locale]/…/{category-path}` ⭐ priority

Let `{cat}` = localized category name, `{parent}` = parent name (omit if root), `{N}` = live listing count.

| Field | LV | RU | EN |
|---|---|---|---|
| Title | `{cat} — {N} sludinājumi Latvijā \| SellBuy.lv` | `{cat} — {N} объявлений в Латвии \| SellBuy.lv` | `{cat} — {N} Listings in Latvia \| SellBuy.lv` |
| Description | `Pērc un pārdod {cat}Latvijā. Jauni sludinājumi katru dienu, cena ar foto, droši darījumi ar Escrow. Skatīt {N} piedāvājumus.` | `Купи и продай {cat} в Латвии. Свежие объявления ежедневно, цены с фото, безопасные сделки через Escrow. Смотреть {N} предложений.` | `Buy and sell {cat} in Latvia. Fresh listings daily, prices with photos, safe Escrow deals. Browse {N} offers.` |

Rules:
- **Pluralize correctly per locale** (`sludinājums/sludinājumi`, `объявление/объявления/объявлений`) — build a small plural helper; Russian needs 3 forms.
- If `{N}` < 5, replace count with "jauni piedāvājumi katru dienu / новые предложения каждый день / new offers daily" (empty-count titles look spammy).
- Sub-categories append `{parent}` prefix when it adds search value: LV `Auto pārdošana — Transports — {N}…`.
- **H1** = plain `{cat}` (+ `{parent}`); keep title more marketing-flavored than H1.
- Unique intro copy: 2–3 sentences per category per language stored in a `descriptionLv/descriptionRu/descriptionEn` column on `Category` (see §4).

#### 1.4 Listings index `/[locale]/listings`

Canonical is the clean URL; any querystring combination is non-canonical (§4).
- **LV:** `Visi sludinājumi — meklē pēc cenas, kategorijas | SellBuy.lv` / desc: `Meklē starp {N} sludinājumiem Latvijā. Filtrē pēc cenas, kategorijas un atrašanās vietas. Droši darījumi ar Escrow.`
- **RU:** `Все объявления — поиск по цене и категории | SellBuy.lv` / `Ищи среди {N} объявлений в Латвии. Фильтруй по цене, категории и городу. Безопасные сделки с Escrow.`
- **EN:** `All Listings — Search by Price & Category | SellBuy.lv` / `Search {N} listings across Latvia. Filter by price, category and location. Safe deals with Escrow.`

#### 1.5 Listing detail `/[locale]/listings/{id}`

Use `{listing.title}` verbatim (user-generated). Templates:

| Lang | Title | Description |
|---|---|---|
| LV | `{title} — {price} € \| SellBuy.lv` | `{title}. Cena: {price} €. Kategorija: {cat}. {first 90 chars of description stripped of newlines}. Skatīt foto un sazināties ar pārdevēju.` |
| RU | `{title} — {price} € \| SellBuy.lv` | `{title}. Цена: {price} €. Категория: {cat}. {desc snippet}. Фото и связь с продавцом.` |
| EN | `{title} — €{price} \| SellBuy.lv` | `{title}. Price: €{price}. Category: {cat}. {desc snippet}. View photos and contact the seller.` |

Rules:
- Truncate description snippet at word boundary so total stays ≤158 chars.
- Truncate over-long user titles at ~50 chars before appending the fixed suffix.
- Add `robots: { index: true, follow: true }`, canonical self-URL, and OG tags (`og:type=product` via structured data instead — see §2).
- Expired/deleted listing → return real HTTP 404 (notFound() already does this) and remove from sitemap immediately.

#### 1.6 New-listing `/[locale]/new-listing`

Auth-gated utility page → **`noindex, follow`** in all languages.
- LV title (internal UX only): `Pievienot sludinājumu | SellBuy.lv`; RU: `Добавить объявление…`; EN: `Post a Listing…`.

---

## 2. Structured data (JSON-LD)

Render as `<script type="application/ld+json">` server-side in each page component.

### 2.1 Listing detail — `Product` + `Offer`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{listing.title}",
  "description": "{truncated listing.description}",
  "image": ["{images[0]}", "{images[1]}"],
  "sku": "{listing.id}",
  "category": "Transports > Auto pārdošana",
  "brand": { "@type": "Brand", "name": "{parsed from title, optional}" },
  "offers": {
    "@type": "Offer",
    "url": "https://sellbuy.lv/lv/listings/{id}",
    "priceCurrency": "EUR",
    "price": "{listing.price}",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Person",
      "name": "{author.name}"
    },
    "priceValidUntil": "{createdAt + 30d, ISO date}"
  }
}
```

Notes:
- `itemCondition`: map to `NewCondition`/`UsedCondition` once condition exists as a category attribute (JSONB `attributes` already supports this).
- Omit `availability` until stock semantics exist, or always emit `InStock` for active listings.
- Do **not** add `Review`/`AggregateRating` — fabricated ratings violate Google guidelines.
- `seller`: use `Person` for private sellers; switch to `Organization` if dealer accounts are introduced.

### 2.2 BreadcrumbList — every category + listing page

Build from the ltree ancestor chain (`path` split on `.` gives hierarchy directly):

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Sākumlapa",        "item": "https://sellbuy.lv/lv/" },
    { "@type": "ListItem", "position": 2, "name": "Transports",       "item": "https://sellbuy.lv/lv/kategorijas/transports" },
    { "@type": "ListItem", "position": 3, "name": "Auto pārdošana",   "item": "https://sellbuy.lv/lv/kategorijas/transports/auto-pardosana" },
    { "@type": "ListItem", "position": 4, "name": "{listing.title}",  "item": "https://sellbuy.lv/lv/listings/{id}" }
  ]
}
```

Names come from the localized name (`nameLv/nameRu/nameEn` with fallback chain already implemented in `localize()`). Visible breadcrumb UI must match the JSON-LD 1:1.

### 2.3 Optional extras

- **ItemList** on category pages (positions 1..12 of first results page) — cheap win for carousel treatment.
- **WebSite + SearchAction** on home (sitelinks searchbox).
- Validate everything in Google Rich Results Test before deploy; monitor Search Console enhancements report.

---

## 3. Trilingual sitemap.xml plan

### Structure

One physical sitemap index + three child sitemaps (or one sitemap with xhtml:link alternates if total URLs stay under 50k — start simple):

```
https://sellbuy.lv/sitemap.xml                 ← sitemapindex
https://sellbuy.lv/sitemaps/sitemap-lv.xml
https://sellbuy.lv/sitemaps/sitemap-ru.xml
https://sellbuy.lv/sitemaps/sitemap-en.xml
```

Each child lists that locale's URLs with `<xhtml:link rel="alternate" hreflang>` triples pointing at sibling locales, e.g.:

```xml
<url>
  <loc>https://sellbuy.lv/lv/kategorijas/transports</loc>
  <xhtml:link rel="alternate" hreflang="lv" href="https://sellbuy.lv/lv/kategorijas/transports"/>
  <xhtml:link rel="alternate" hreflang="ru" href="https://sellbuy.lv/ru/kategorii/transports"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://sellbuy.lv/en/categories/vehicles"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://sellbuy.lv/lv/kategorijas/transports"/>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
```

Also emit matching `<link rel="alternate" hreflang>` tags in each page's `<head>` (Next.js `alternates.languages`) — sitemap alternates are a supplement, not a substitute.

### What goes in

| URL type | Include? | lastmod / changefreq / priority |
|---|---|---|
| Home ×3 | yes | lastmod = latest listing createdAt; daily; 1.0 |
| Category pages ×3 (all ltree depths) | yes — even thin ones, they're the SEO backbone | weekly; 0.8 (leaf cats with listings) / 0.6 (empty parents) |
| Active listings ×3 | yes | lastmod = createdAt (or bump on edit); hourly→daily by age; 0.7 |
| `/listings` index ×3 | yes | daily; 0.6 |
| `/new-listing`, `/about`, API routes, auth pages | **no** | — |
| Deleted/expired listings | remove within 24h | — |

### Canonical strategy

- Every page emits self-referencing canonical in its own language (`alternates.canonical`).
- Cross-language versions are **not** duplicates — they're alternates via hreflang, never canonicalized to each other.
- Querystring variants (`?q=&sort=&page=`) canonical to the clean base URL (§4). Paginated pages (`?page=2`) self-canonical as unique URLs and appear in sitemap only for categories (page 1 only is fine initially).
- Legacy unlocalized URLs (`/listings/x`) → 301 to `/lv/listings/x`; keep redirects ≥ 12 months.
- Generate sitemap dynamically via Next.js `sitemap.ts` route reading Prisma; cache/revalidate hourly. Submit via robots.txt + Search Console (also IndexNow ping on listing create/delete for Bing/Yandex — relevant given the RU audience).

---

## 4. Category page SEO deep-dive ⭐

### 4.1 Unique descriptions per category

- Add `descriptionLv/descriptionRu/descriptionEn` text columns to `Category`. Render 150–300 words below the listing grid ("about this category" block).
- Content formula per category: what's sold here · popular sub-categories (linked, internal linking juice) · how buying/selling works on SellBuy (Escrow, Smart-ID, delivery) · city links (Riga, Daugavpils, Liepāja…) as secondary internal-link layer.
- Never machine-translate blindly — RU copy should target RU search phrasing (`купить бу телефон Рига`, not literal translations of LV keywords).
- Empty categories (< 3 listings): still indexable but show sub-category links prominently so crawlers reach deeper pages.

### 4.2 Faceted filter SEO

Current filter params: `q, category, minPrice, maxPrice, sort, page, priceRange`. Policy:

| Parameter combo | Treatment |
|---|---|
| Clean category URL (no params) | index, canonical, in sitemap |
| `sort=*`, `page=1`, default order | canonical → clean URL |
| `minPrice/maxPrice` alone | **noindex, follow** (candidate for future "indexable price facets" once traffic justifies it — SS.com-style facet landing pages are a phase-2 play) |
| `q=` (search) | noindex, follow |
| Any two or more params combined | noindex, follow + not in sitemap |
| `category=` param duplicating a real category path | 301 to that category's pretty URL instead of rendering |

Implementation: compute robots/canonical in `generateMetadata` from parsed `searchParams`. Keep filters crawlable-but-noindex (`follow`) so link equity flows through filter links to listings.

Pagination: use `rel` semantics via self-canonical unique URLs + visible numbered links (already present); ensure page ≥ 2 also gets `noindex` only if it's sort-filtered, otherwise leave indexable with self-canonical.

### 4.3 ltree-based canonicals

- `Category.path` (unique, GiST-indexed) is the single source of truth for hierarchy. URL slug = `path` labels mapped through per-language slug table; the **canonical URL must contain the full ancestor path**:
  - ✅ `/lv/kategorijas/transports/auto-pardosana`
  - ❌ `/lv/kategorijas/auto-pardosana` (orphan) — if served, canonical → full-path version.
- Ancestor lookup is free: `WHERE path @> 'transports.auto_pardosana'::ltree` powers both breadcrumbs and canonical validation in one query.
- Renamed/moved categories (path changes): keep a redirect table `(old_path, new_path)` → 301; update sitemap same day.
- One category per listing (`categoryId`) avoids duplicate-content across categories — good as-is.
- Internal linking: every category page links to children + siblings (siblings via shared parent query `path ~ 'transports.*'`) — mirrors SS.com's strongest asset.

---

## 5. Rollout priorities

1. **P0:** `generateMetadata` for `/listings/[id]` (title/desc/canonical/OG) + Product JSON-LD — biggest traffic lever, listings are the long tail.
2. **P0:** Dynamic sitemap + robots.txt + Search Console/IndexNow setup.
3. **P1:** `[locale]` routing + hreflang alternates + 301s from legacy URLs.
4. **P1:** Category description columns + faceted-filter robots rules.
5. **P2:** BreadcrumbList everywhere, ItemList on categories, facet landing-page experiments, IndexNow automation.

---

## 6. Addendum — 2026-08-25: Category-page trilingual SEO + structured data for listings

Grounded in current codebase state:

- `app/categories/page.tsx` — static `metadata`, renders root + child categories with listing counts from Prisma; no locale segment yet.
- `app/listings/page.tsx` / `app/listings/[id]/page.tsx` — no `generateMetadata` anywhere.
- `app/api/categories/tree/route.ts` — returns nested tree with `{ id, path, names: {lv,ru,en}, children }`; single ordered ltree query over GiST index; supports `?root=` subtree param. This is the canonical source for hreflang alternates, breadcrumbs, and sitemaps.
- `prisma/schema.prisma` — `Category`: `nameLv/nameRu/nameEn` (nullable, fallback `name`), `path` (ltree, unique), `attributes` (JSONB); `Listing`: `title`, `description`, `price Decimal`, `images String[]`, one `categoryId`.

### 6.1 Hreflang & URL architecture for category pages

**URL pattern** (`app/[locale]/kategorijas/[...path]` catch-all mapped from ltree segments):

| Locale | Segment word | Example |
|---|---|---|
| LV (default, `x-default`) | `/lv/kategorijas/…` | `/lv/kategorijas/transports/auto-pardosana` |
| RU | `/ru/kategorii/…` | `/ru/kategorii/transport/prodazha-avto` |
| EN | `/en/categories/…` | `/en/categories/vehicles/car-sales` |

Slug derivation: per-segment slug map keyed by `(path_label, lang)` seeded initially by transliterating `nameLv/nameRu/nameEn` (ASCII-fold LV diacritics: `ā→a, ē→e, ī→i, ū→u, č→c, ģ→g, ķ→k, ļ→l, ņ→n, š→s, ž→z`). Store slugs as a DB table so renames don't break URLs; resolve incoming `[...path]` → ltree `path` via reverse lookup, then validate with `path @> full_path::ltree` before rendering (404 on mismatch).

Hreflang cluster per category page (Next.js `generateMetadata` → `alternates.languages`):

```
lv-LV → /lv/kategorijas/transports/auto-pardosana
ru    → /ru/kategorii/transport/prodazha-avto      (ru-RU not needed; ru targets all)
en    → /en/categories/vehicles/car-sales          (no en-LV; plain en)
x-default → LV URL
```

Rules:
- All three are self-canonical alternates — never canonicalize across languages.
- Emit identical cluster in `<html>` head links AND sitemap `<xhtml:link rel="alternate">` entries (both; Google treats either as sufficient but consistency catches errors).
- Legacy unlocalized URLs (`/categories`, `/listings`) → middleware 301 to `/lv/...`; keep ≥12 months.
- The `/api/categories/tree` endpoint is internal-only (`robots.txt: Disallow /api/`); UI must consume it server-side, never render API URLs as links.
- Root category hub gets its own 3-way hreflang cluster (`/lv/kategorijas`, `/ru/kategorii`, `/en/categories`).

### 6.2 Localized keyword targets vs ss.lv

ss.lv dominates generic queries ("auto", "dzīvokļi"). Win on long-tail modifiers where ss.lv's titles are thin (they use raw IDs and boilerplate titles).

Priority modifier patterns per language (attach to every leaf category):

| Modifier class | LV | RU | EN |
|---|---|---|---|
| Cheap/budget | lēti, lētākie | дешево, недорого | cheap |
| Under-price | zem X eur, līdz X eur | до X евро | under X eur |
| Used/new | lietoti, bez pārbaudes | б/у, новые | used |
| City | Rīgā, Rīgas rajonā | в Риге | in Riga |
| Urgency/private | no privātpersonas, steidzami | от частного лица, срочно | private sellers |
| Deal verbs | pērc un pārdod | купить, продать | buy and sell |

Category keyword examples (leaf-level intent):
- Auto pārdošana: `lietotas mašīnas Latvijā`, `auto Rīgā zem 5000 eur` / RU `купить авто в Латвии б/у` / EN `used cars Latvia`
- Dzīvokļi: `dzīvokļi Rīgā pārdod lēti`, `dzīvokļa izīrēšana Rīgā` / RU `купить квартиру в Риге недорого` / EN `apartments for sale Riga`
- Elektronika: `telefoni lēti`, `izlietoti telefoni Latvija` / RU `телефоны б/у Латвия купить`

Where to inject: title/description templates §1.3, category description block (§4.1), and H2 subheads on facet landing pages. Do NOT keyword-stuff category names themselves — keep nav labels clean; put modifiers in descriptive copy below the grid.

RU audience note: Yandex matters (~30% of RU-search share in LV). IndexNow ping (already planned) + Yandex Webmaster registration are P1, not P2.

### 6.3 Structured data (JSON-LD)

One `<script type="application/ld+json">` per type, injected server-side (RSC — safe, crawlers see it).

**Listing detail — `app/listings/[id]/page.tsx`** (`@graph` combining):

```jsonc
{
  "@context": "https://schema.org",
  "@graph": [{
    "@type": "Product",
    "name": "{listing.title}",
    "description": "{truncated 300ch}",
    "image": ["{listing.images[]}"],           // absolute URLs
    "category": "{category.nameEn path}",       // e.g. "Vehicles > Car Sales"
    "sku": "{listing.id}",
    "offers": {
      "@type": "Offer",
      "url": "https://sellbuy.lv/lv/listings/{id}",
      "priceCurrency": "EUR",
      "price": "{listing.price}",
      "availability": "https://schema.org/InStock",   // map listing status
      "itemCondition": "https://schema.org/NewCondition" // NewCondition | UsedCondition from attributes JSONB if present
    }
  }, {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"Transports","item":"/lv/kategorijas/transports"},
      {"@type":"ListItem","position":2,"name":"Auto pārdošana","item":"/lv/kategorijas/transports/auto-pardosana"},
      {"@type":"ListItem","position":3,"name":"{listing.title}","item":"/lv/listings/{id}"}
    ]
  }]
}
```

Notes:
- No `AggregateRating`/`review` until real reviews exist — fake or missing required fields trigger manual actions.
- Don't mark up seller personal info (no `seller` Person with name/email).
- Localized breadcrumb names from `/api/categories/tree`'s `names.{locale}` — build helper `buildBreadcrumbJsonLd(path, locale)` in `lib/seo/`.
- For vehicles/real estate later: extend Product with `Vehicle`/`RealEstateListing` subtypes driven off `attributes` JSONB keys — schema allows additional properties.

**Category pages — `app/categories/[...path]/page.tsx`**:

```jsonc
{
  "@type": "CollectionPage" + "BreadcrumbList",
  // mainEntity as ItemList of first N=20 listings:
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": "{N}",
    "itemListElement": [{ "@type":"ListItem","position":i,"url":"/lv/listings/{id}" }]
  }
}
```

Do NOT use `OfferCatalog` on category pages — Google's guidance favors ItemList for browse surfaces, and OfferCatalog requires an offer-per-child which we can't truthfully populate. Reserve `OfferCatalog` only for a future "top deals" widget that genuinely lists concrete Offers.

**Root hub `/[locale]/kategorijas`**: `CollectionPage` + top-level `BreadcrumbList` (single item) only. Keep light.

Validation gate: every JSON-LD template ships with a jest snapshot test (`__tests__/seo/jsonld.test.ts`) asserting required fields present + Rich Results Test passes on staging URLs before enabling in prod.

### 6.4 Programmatic SEO angles — long-tail Latvian

Latvia-specific long-tail that ss.lv underserves (their URLs are opaque `/msg/{id}.html`, zero content pages):

1. **City × category facets** — `/lv/kategorijas/{cat}/riga`, `/daugavpils`, `/liepaja`… Generate when `COUNT(listings WHERE city=X AND categoryId=Y) >= 15`. Unique intro paragraph templated: *"Sludinājumi kategorijā {cat} Rīgā — {N} aktīvi sludinājumi no privātpersonām un uzņēmumiem."* Start indexable; noindex any combo below threshold (thin-content risk).
2. **Price-band facets** — `zem 1000 eur`, `100–500 eur` per high-volume category (autos, phones). Same ≥15 threshold. These match the highest-intent queries ("auto zem 2000").
3. **Attribute-driven pages** — `attributes` JSONB already exists: generate `/lv/kategorijas/auto/marka-bmw`, `/dzivokli/istabas-2` from distinct attribute values × counts. This is the biggest surface area — thousands of legit pages vs ss.lv which does this only inside filters (non-indexable).
4. **LV/RU query-gap pages**: RU-speaking users search transliterated Latvian terms (`arenda Riga`, `kupit avto Latvija`) — capture via RU meta descriptions containing both Cyrillic and common transliterations once, naturally.
5. **Comparison/guide content** (phase 2): "Kā droši pirkt auto ar brīvroku režīmu Latvijā" style guides linking into categories — builds topical authority classifieds competitors lack entirely.

Guardrails: every programmatic page needs ≥1 unique sentence beyond template + live count; auto-noindex when listing count drops < 10; cap total programmatic URLs at ~3× organic listing count to stay out of crawl-budget trouble.

### 6.5 Prioritized implementation checklist (mapped to actual routes)

| # | Pri | Task | Route/file | Effort |
|---|---|---|---|---|
| 1 | P0 | `generateMetadata`: title/desc/canonical/OG from listing data | `app/listings/[id]/page.tsx` | S |
| 2 | P0 | Product+Breadcrumb JSON-LD `@graph` (§6.3) | `app/listings/[id]/page.tsx`, new `lib/seo/jsonld.ts` | M |
| 3 | P0 | Dynamic sitemap.ts incl. hreflang alternate entries; robots.txt disallowing `/api/` | `app/sitemap.ts`, `app/robots.ts` | M |
| 4 | P0 | Slug tables + resolver (ltree ↔ localized slug path); ASCII transliterator | new `lib/seo/slugs.ts`, migration | L |
| 5 | P1 | `[locale]` segment + middleware 301s legacy→`/lv/…`; `lang` attr dynamic | `middleware.ts`, move `app/*`→`app/[locale]/*` | L |
| 6 | P1 | `alternates.languages` (hreflang) in every page's `generateMetadata` | all page files | S |
| 7 | P1 | Category page `generateMetadata` w/ live `{N}` counts + CollectionPage/BreadcrumbList JSON-LD | `app/[locale]/kategorijas/[...path]/page.tsx` | M |
| 8 | P1 | Per-language category descriptions (§4.1 columns) rendered below grid | `prisma/schema.prisma`, category page | M |
| 9 | P1 | Yandex Webmaster + IndexNow ping on listing create/delete | `app/api/indexnow/route.ts` | S |
| 10 | P2 | Facet robots rules (`sort/q/minPrice` noindex) — see §4.2 | `generateMetadata` in category route | S |
| 11 | P2 | City × category programmatic pages (§6.4.1) w/ ≥15 threshold | new `app/[locale]/kategorijas/[...path]/[city]/page.tsx` | L |
| 12 | P2 | Attribute-value programmatic pages (§6.4.3) | same pattern | L |
| 13 | P2 | Redirect table for moved categories (`old_path→new_path` 301s) | new `CategoryRedirect` model | S |
| 14 | P2 | JSON-LD snapshot tests + Rich Results validation in CI | `__tests__/seo/` | S |

Dependency order: 4 → 5 → (6,7) ; 1–3 independent and shippable immediately.
