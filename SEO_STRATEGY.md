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
