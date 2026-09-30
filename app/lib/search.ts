import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Performs Postgres Full-Text Search (tsvector + trigram similarity fallback across title, description, city)
 * and returns a Prisma ListingWhereInput object.
 */
export async function getFtsListingWhere(query: string): Promise<Prisma.ListingWhereInput> {
  const trimmed = query.trim();
  if (!trimmed) return {};

  const searchTerms = trimmed
    .replace(/[^a-zA-Z0-9āčēģīķļņšūžĀČĒĢĪĶĻŅŠŪŽ\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join(' & ');

  if (searchTerms) {
    try {
      // 1. Postgres tsvector search across title (weight A), description (weight B), city (weight C)
      const ftsResults = await prisma.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
          SELECT id
          FROM "Listing"
          WHERE (
            setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
            setweight(to_tsvector('simple', coalesce(city, '')), 'C')
          ) @@ to_tsquery('simple', ${searchTerms + ':*'})
          LIMIT 100
        `
      );

      let ftsIds = ftsResults.map((r) => r.id);

      // 2. Trigram similarity search fallback if tsvector yielded 0 results
      if (ftsIds.length === 0) {
        try {
          const trigramResults = await prisma.$queryRaw<Array<{ id: string }>>(
            Prisma.sql`
              SELECT id
              FROM "Listing"
              WHERE (
                similarity(coalesce(title, ''), ${trimmed}) > 0.2 OR
                similarity(coalesce(description, ''), ${trimmed}) > 0.2 OR
                similarity(coalesce(city, ''), ${trimmed}) > 0.2
              )
              ORDER BY GREATEST(
                similarity(coalesce(title, ''), ${trimmed}),
                similarity(coalesce(description, ''), ${trimmed}),
                similarity(coalesce(city, ''), ${trimmed})
              ) DESC
              LIMIT 100
            `
          );
          ftsIds = trigramResults.map((r) => r.id);
        } catch {
          // pg_trgm extension might not be enabled in DB environment
        }
      }

      if (ftsIds.length > 0) {
        return { id: { in: ftsIds } };
      }
    } catch {
      // Raw SQL query failure fallback (e.g. unit test mocks or non-pg database)
    }
  }

  // Substring fallback across title, description, and city
  return {
    OR: [
      { title: { contains: trimmed, mode: 'insensitive' } },
      { description: { contains: trimmed, mode: 'insensitive' } },
      { city: { contains: trimmed, mode: 'insensitive' } },
    ],
  };
}
