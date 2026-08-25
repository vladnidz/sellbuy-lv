-- docker/initdb/01-ltree.sql
-- Runs automatically on first init of the pgdata volume (the official postgres
-- image executes everything in /docker-entrypoint-initdb.d/*.sql).
-- Belt-and-braces: ltree is also created idempotently by
-- prisma/migrations/20260817184448_init/migration.sql.
CREATE EXTENSION IF NOT EXISTS "ltree";
