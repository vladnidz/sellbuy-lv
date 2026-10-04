-- Migration: Add trigram index for typo-tolerant search
-- Date: 2026-10-03
-- Description: Create GIN indexes on trigram variants of title, description, and city
--              to enable similarity-based search with pg_trgm extension

-- Ensure pg_trgm extension is enabled (already done in schema.prisma)

-- Create trigram index on title
CREATE INDEX IF NOT EXISTS "Listing_title_trgm_idx"
  ON "Listing" USING gin (title gin_trgm_ops);

-- Create trigram index on description
CREATE INDEX IF NOT EXISTS "Listing_description_trgm_idx"
  ON "Listing" USING gin (description gin_trgm_ops);

-- Create trigram index on city
CREATE INDEX IF NOT EXISTS "Listing_city_trgm_idx"
  ON "Listing" USING gin (city gin_trgm_ops);

-- Drop existing indexes (they're redundant with the new trigram indexes):
-- The old indexes @@index([title]) and @@index([description]) are basic btree indexes
-- which are NOT used by our similarity search. Keeping them is fine, but we can
-- drop them to reduce index size if desired.
-- DROP INDEX IF EXISTS "Listing_title_idx";
-- DROP INDEX IF EXISTS "Listing_description_idx";
-- The city index is still useful for exact city filters, so we keep it.

-- (Optional) For searches that combine city + trigram, a composite index could help:
-- CREATE INDEX IF NOT EXISTS "Listing_city_title_trgm_idx"
--   ON "Listing" USING gin (city, title gin_trgm_ops);
