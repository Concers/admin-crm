-- 29cc090 added ProductDevelopment.attributes (Json) to schema.prisma without a
-- migration. Additive & nullable → safe.
ALTER TABLE "ProductDevelopment" ADD COLUMN "attributes" JSONB;
