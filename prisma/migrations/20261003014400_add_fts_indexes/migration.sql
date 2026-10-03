-- Add pg_trgm extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add generated column for full text search on Listing
ALTER TABLE "Listing" ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(city, '')), 'C')
) STORED;

-- Add GIN index on search_vector
CREATE INDEX listing_search_idx ON "Listing" USING GIN (search_vector);

-- Add trigram indexes for LIKE/ILIKE on specific columns
CREATE INDEX listing_title_trgm_idx ON "Listing" USING GIN (title gin_trgm_ops);
CREATE INDEX listing_desc_trgm_idx ON "Listing" USING GIN (description gin_trgm_ops);
CREATE INDEX listing_city_trgm_idx ON "Listing" USING GIN (city gin_trgm_ops);
