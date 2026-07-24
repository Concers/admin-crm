-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN "category" TEXT;

-- CreateTable
CREATE TABLE "ProductLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductPartnerLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductPartnerLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductPartnerLink_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "shelfLocation" TEXT,
    "barcode" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'adet',
    "minStock" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "productCode" TEXT,
    "sectors" TEXT,
    "gtipCode" TEXT,
    "hsCode" TEXT,
    "unCode" TEXT,
    "botanicalName" TEXT,
    "englishName" TEXT,
    "casNo" TEXT,
    "inciNo" TEXT,
    "origin" TEXT,
    "chemotype" TEXT,
    "genotype" TEXT,
    "variety" TEXT,
    "geoPopulation" TEXT,
    "plantPart" TEXT,
    "productionMethod" TEXT,
    "der" TEXT,
    "history" TEXT,
    "usageAreas" TEXT,
    "description" TEXT,
    "isBfm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("barcode", "category", "createdAt", "id", "isActive", "minStock", "name", "shelfLocation", "unit", "updatedAt") SELECT "barcode", "category", "createdAt", "id", "isActive", "minStock", "name", "shelfLocation", "unit", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProductLink_productId_idx" ON "ProductLink"("productId");

-- CreateIndex
CREATE INDEX "ProductPartnerLink_productId_idx" ON "ProductPartnerLink"("productId");

-- CreateIndex
CREATE INDEX "ProductPartnerLink_partnerId_idx" ON "ProductPartnerLink"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPartnerLink_productId_partnerId_role_key" ON "ProductPartnerLink"("productId", "partnerId", "role");
