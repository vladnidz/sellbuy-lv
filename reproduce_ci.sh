#!/bin/bash
set -e
# Simulate the CI environment
docker run --rm -d --name test-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sellbuy_test -p 5432:5432 postgres:16-alpine
sleep 5
# Try to run prisma migrate
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sellbuy_test"
export SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sellbuy_shadow"
# Create shadow db
docker exec test-postgres psql -U postgres -c "CREATE DATABASE sellbuy_shadow;"
docker exec test-postgres psql -U postgres -d sellbuy_shadow -c "CREATE EXTENSION IF NOT EXISTS ltree;"

# Run the migration
npx prisma migrate dev --name reproduce_test
