# SellBuy.lv v2 — Feature Backlog

> Cross-references each feature to the owning agent context and deliverable files on disk. Updated with specifications extracted from `docs/` (Full Feature Specifications, Functional Specs, Architecture & Integration Guides).

---

## Completed Items ✅

| Feature | Cycle | Agent Context | Deliverable File(s) |
|---|---|---|---|
| Category taxonomy API (`/api/categories`, `/api/categories/tree`) + ltree + JSONB attribute schema | 2026-08-25 | agency/backend | `app/api/categories/route.ts`, `app/api/categories/tree/route.ts` |
| Unique constraint on `Category.path` | 2026-08-24 | agency/backend | `prisma/schema.prisma` |
| Listing model: `description` + `images` fields | 2026-08-24 | agency/backend | `prisma/schema.prisma`, `app/api/listings/route.ts` |
| `/new-listing` page wired to live category tree | 2026-08-25 | agency/frontend | `app/new-listing/page.tsx` |
| `/about` page (shadcn/ui) | 2026-08-25 | agency/frontend | `app/about/page.tsx` |
| Listing detail page `/listings/[id]` | 2026-08-24 | agency/frontend | `app/listings/[id]/page.tsx` |
| i18n support (7 languages: LV/RU/EN/LT/ET/DE/PL) + Theme Toggle | 2026-09-28 | agency/frontend | `app/lib/i18n.ts`, `components/navbar.tsx` |
| User Profile API (`/api/users/[id]`) with rating aggregation | 2026-09-28 | agency/backend | `app/api/users/[id]/route.ts`, `app/profile/[id]/page.tsx` |
| React 19 render purity & TypeScript build fixes | 2026-09-29 | agency/qa | `app/profile/[id]/page.tsx`, `app/api/auth/me/route.ts` |
| GitHub CI & Pre-commit verification gate | 2026-09-29 | agency/devops | `.git/hooks/pre-commit`, `.github/workflows/ci.yml` |
| Seller Ratings & Feedback API (`/api/ratings`) + Rating Form & UI | 2026-09-29 | agency/backend | `app/api/ratings/route.ts`, `components/rating-form.tsx`, `components/listing-ratings-section.tsx`, `__tests__/api-ratings.test.ts` |
| Multi-Image Drag & Drop Upload | 2026-09-30 | agency/frontend | `components/image-uploader.tsx`, `app/new-listing/page.tsx`, `__tests__/image-uploader.test.tsx` |
| AI Listing Assist Endpoint (`/api/listings/ai-assist`) | 2026-10-01 | agency/ai | `app/api/listings/ai-assist/route.ts`, `__tests__/api-ai-assist.test.ts` |
| AI Listing Autofill Endpoint (`/api/ai/listing-autofill`) | 2026-10-02 | agency/ai | `app/api/ai/listing-autofill/route.ts`, `__tests__/api-ai-autofill.test.ts` |

---

## Production Roadmap Backlog (Extracted from `docs/` Specs) 🚀

| Priority | Feature | Specs Source | Agent Context | Target Deliverable File(s) | Notes |
|---|---|---|---|---|---|
| **P0** | **Listing Chat Initiation** | `docs/functional/chat.md` | agency/fullstack | `app/listings/[id]/page.tsx`, `app/api/chats/route.ts`, `components/chat-initiate-button.tsx` | ✅ Completed 2026-09-30. "Sazināties ar pārdevēju" button creates/opens chat with listing context prefilled. |
| **P1** | **Multi-Image Drag & Drop Upload** | `docs/specifications/SellBuy-lv-Full-Feature-Specifications.md` | agency/frontend | `components/image-uploader.tsx`, `app/new-listing/page.tsx` | ✅ Completed 2026-10-03. Interactive photo uploader with preview, drag reordering, validation, and 9 passing tests. |
| **P1** | **Postgres Full-Text Search (FTS)** | `docs/specifications/SellBuy-lv-Full-Feature-Specifications.md` | agency/backend | `app/api/listings/route.ts`, `app/listings/page.tsx` | Trigram & tsvector search across title, description, and city with ltree filtering. |
| **P1** | **User Verification & Trust Badges** | `docs/integrations/smart-id.md` | agency/frontend | `components/verification-badge.tsx`, `app/profile/[id]/page.tsx` | Smart-ID / eParaksts / phone verification badges for user trust & C2C safety. |
| **P2** | **Omniva / DPD Locker Delivery Integration** | `docs/integrations/logistics.md` | agency/integrations | `components/delivery-picker.tsx`, `app/api/delivery/route.ts` | Terminal selection widget for Omniva/DPD parcel lockers in Latvia. |
| **P2** | **AI Listing Assist Endpoint** | `docs/specifications/SellBuy-lv-Full-Feature-Specifications.md` | agency/ai | `app/api/listings/ai-assist/route.ts` | ✅ Completed 2026-10-01. Automated category suggestion, title cleanup, price benchmark, and scam detection for sellers. |
