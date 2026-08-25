-- Add `city` text column and `attributes` JSONB column to Listing
-- along with a GIN index to enable attribute-driven filtering.
-- Safe, additive, non-destructive migration.

ALTER TABLE "Listing"
ADD COLUMN "city" TEXT,
ADD COLUMN "attributes" JSONB;

-- GIN index on JSONB attributes for fast containment / key lookups.
CREATE INDEX "Listing_attributes_gin_idx" ON "Listing" USING GIN ("attributes");

-- Allow `city` to be NULL (listings created before this migration, or
-- listings where the city is unknown). No NOT NULL constraint enforced.
