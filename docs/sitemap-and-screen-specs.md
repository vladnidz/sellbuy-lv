# SellBuy.lv — Sitemap & Per-Screen UI/UX Specifications

Version: 1.0 · Release: R1–R3 · Architecture: Next.js 16 App Router
Design Tokens: Impeccable Design System (`impeccable`), Swiss Typography, High-Contrast Dark Modern Palette

---

## 1. Visual Sitemap

```
├── / (Homepage / Discovery)
│   ├── Hero Search & Category Quick Bar
│   ├── SellBuy Auto Trust Search Widget
│   ├── Flash Deals & Algorithmic Discovery Grid
│   └── Trust & Verification Metrics Bar
├── /categories (Interactive Catalog Explorer)
│   ├── Root Sectors Sticky Sidebar
│   └── 4-Level Subcategory & Technical Leaf Navigator
├── /listings (Search & Filter Results)
│   ├── Filter Bar (Category, Price Range, Location, Sort)
│   ├── Saved Search / Alert Modal Launcher
│   └── Responsive Listing Grid
├── /listings/[id] (Listing Detail View)
│   ├── Image Gallery & Lightbox
│   ├── Core Metadata & Seller Attribution
│   ├── SellBuy Vehicle Trust Verification Card (VIN/CSDD specs)
│   ├── Delivery Picker (Omniva / DPD Locker selector)
│   └── Chat Initiation & Escrow Purchase Triggers
├── /new-listing (Listing Creation Wizard)
│   ├── Step 1: Category & Technical Attributes
│   ├── Step 2: Multi-Image Drag & Drop Upload
│   └── Step 3: Pricing, Location, & Delivery Profile
├── /messages (Inbox & Active Conversations)
│   ├── Conversation List with Unread Badges
│   └── Live Thread View (Polling Sync, Quick Replies, Offer Cards)
├── /saved-searches (Search & Notification Management)
│   └── Saved Filters List, Alert Toggles, Direct Re-execution
└── /profile/[id] (Public & Private User Profile)
    ├── Trust Badges (Smart-ID, Phone, L1-L3)
    ├── Seller Review Breakdown & Aggregate Star Score
    └── Active / Sold Listings Showcase
```

---

## 2. Per-Screen Specifications

### SCREEN-01: Homepage (`app/home-content.tsx` & `app/page.tsx`)
- **Purpose**: Fast entry point combining SS.lv category speed with Temu-style discovery and verified vehicle search.
- **States**: Default, Authenticated, Search Active.
- **Key Actions**:
  - Direct search input with keyword submission.
  - Vehicle filter selector (Make, Model, Year, Price, Fuel).
  - Category pill jump to `/categories`.
- **Governing Stories**: `US-00.03`, `US-01.05`, `US-04.01`.

### SCREEN-02: Interactive Category Explorer (`app/categories/page.tsx`)
- **Purpose**: 4-level deep browse covering automotive, real estate, electronics, and goods.
- **Layout**: 2-Column Desktop layout (sticky root sectors on left, rich subcategories & leaves on right).
- **Key Actions**: Click root category to switch panel; click leaf chip to filter `/listings?category=...`.
- **Governing Stories**: `US-02.01`, `US-02.04`.

### SCREEN-03: Search & Browse (`app/listings/page.tsx` & `listings-client.tsx`)
- **Purpose**: Full listing discovery with diacritic-insensitive trigram search and attribute filtering.
- **Key Actions**:
  - Filter drawer toggle (Price min/max, city, category).
  - Bookmark button (`SaveSearchButton`) to persist query and set notification alerts.
  - Keyset pagination and multi-sort.
- **Governing Stories**: `US-04.01`, `US-04.02`, `US-04.04`.

### SCREEN-04: Listing Detail & Trust View (`app/listings/[id]/page.tsx`)
- **Purpose**: Complete item transparency, buyer protection verification, and transaction start.
- **Components**:
  - `VehicleVerificationCard`: Renders VIN, Latvian CSDD verification status, plate number, and technical specifications.
  - `DeliveryPicker`: Omniva/DPD locker terminal dropdown selector.
  - Chat Button: Initiates dedicated conversation thread for the listing.
- **Governing Stories**: `US-01.05`, `US-03.01`, `US-05.01`, `US-08.01`.

### SCREEN-05: Real-Time Messaging (`app/messages/page.tsx` & `app/messages/[id]/page.tsx`)
- **Purpose**: Fast negotiation and deal closing within 3-second delivery guarantee.
- **Capabilities**:
  - Latency-free polling message sync.
  - Quick reply chips in Latvian (`Vai prece vēl ir pieejama?`, `Kur var apskatīt?`, etc.).
  - Listing summary header with thumbnail, price, and partner profile link.
- **Governing Stories**: `US-05.01`, `US-05.02`, `US-05.03`.

### SCREEN-06: Saved Searches Dashboard (`app/saved-searches/page.tsx`)
- **Purpose**: Centralized dashboard to view, toggle alerts for, and delete saved queries.
- **Capabilities**:
  - Filter query tag pills.
  - Instant toggle for notifications.
  - Direct 1-click execution to `/listings`.
- **Governing Stories**: `US-04.04`.
