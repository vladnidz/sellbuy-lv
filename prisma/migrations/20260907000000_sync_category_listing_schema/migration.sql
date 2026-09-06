-- Category: drop the now-unindexed GIN index, add the unique index the
-- schema's @unique on `path` requires.
DROP INDEX IF EXISTS "Category_attributes_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "Category_path_key" ON "Category"("path");

-- Listing: same pattern, plus the two new columns.
DROP INDEX IF EXISTS "Listing_attributes_gin_idx";
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}';
