-- AddMissingCategoryI18nAndAttributes
-- Aligns the Category table with schema.prisma: trilingual name columns
-- (lv/ru/en) and the JSONB attribute-schema column used by listing forms.

ALTER TABLE "Category" ADD COLUMN "nameLv" TEXT;
ALTER TABLE "Category" ADD COLUMN "nameRu" TEXT;
ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Category" ADD COLUMN "attributes" JSONB;

CREATE INDEX "Category_attributes_idx" ON "Category" USING GIN ("attributes");
