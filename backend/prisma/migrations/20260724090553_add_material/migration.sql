-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subType" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'OWN',
    "model" TEXT,
    "color" TEXT,
    "size" TEXT,
    "material" TEXT,
    "unitPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "usageAreas" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MaterialPartnerLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaterialPartnerLink_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialPartnerLink_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialPriceBreak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "minQty" REAL NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaterialPriceBreak_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Material_category_idx" ON "Material"("category");

-- CreateIndex
CREATE INDEX "Material_subType_idx" ON "Material"("subType");

-- CreateIndex
CREATE INDEX "MaterialPartnerLink_materialId_idx" ON "MaterialPartnerLink"("materialId");

-- CreateIndex
CREATE INDEX "MaterialPartnerLink_partnerId_idx" ON "MaterialPartnerLink"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialPartnerLink_materialId_partnerId_role_key" ON "MaterialPartnerLink"("materialId", "partnerId", "role");

-- CreateIndex
CREATE INDEX "MaterialPriceBreak_materialId_idx" ON "MaterialPriceBreak"("materialId");
