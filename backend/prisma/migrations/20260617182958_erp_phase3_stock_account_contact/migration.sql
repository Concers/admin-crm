-- CreateTable
CREATE TABLE "Contact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partnerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contact_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "openingBalance" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" INTEGER NOT NULL,
    "warehouseId" INTEGER,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashFlow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "accountId" INTEGER,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CashFlow_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CashFlow_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CashFlow" ("amount", "createdAt", "date", "id", "notes", "partnerId", "type", "updatedAt") SELECT "amount", "createdAt", "date", "id", "notes", "partnerId", "type", "updatedAt" FROM "CashFlow";
DROP TABLE "CashFlow";
ALTER TABLE "new_CashFlow" RENAME TO "CashFlow";
CREATE INDEX "CashFlow_date_idx" ON "CashFlow"("date");
CREATE INDEX "CashFlow_partnerId_idx" ON "CashFlow"("partnerId");
CREATE INDEX "CashFlow_accountId_idx" ON "CashFlow"("accountId");
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "shelfLocation" TEXT,
    "barcode" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'adet',
    "minStock" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "id", "isActive", "name", "shelfLocation", "updatedAt") SELECT "category", "createdAt", "id", "isActive", "name", "shelfLocation", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");
CREATE TABLE "new_Purchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "productId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "vatRate" REAL NOT NULL DEFAULT 0.2,
    "totalAmount" REAL NOT NULL,
    "vatIncludedAmount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "shelfLocation" TEXT,
    "dueDate" DATETIME,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "exchangeRate" REAL NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Purchase" ("createdAt", "date", "id", "notes", "paidAmount", "productId", "quantity", "shelfLocation", "supplierId", "totalAmount", "unitPrice", "updatedAt", "vatIncludedAmount", "vatRate") SELECT "createdAt", "date", "id", "notes", "paidAmount", "productId", "quantity", "shelfLocation", "supplierId", "totalAmount", "unitPrice", "updatedAt", "vatIncludedAmount", "vatRate" FROM "Purchase";
DROP TABLE "Purchase";
ALTER TABLE "new_Purchase" RENAME TO "Purchase";
CREATE INDEX "Purchase_date_idx" ON "Purchase"("date");
CREATE INDEX "Purchase_productId_idx" ON "Purchase"("productId");
CREATE INDEX "Purchase_supplierId_idx" ON "Purchase"("supplierId");
CREATE TABLE "new_Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "productId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "vatRate" REAL NOT NULL DEFAULT 0.2,
    "totalAmount" REAL NOT NULL,
    "vatIncludedAmount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "shelfLocation" TEXT,
    "dueDate" DATETIME,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "exchangeRate" REAL NOT NULL DEFAULT 1,
    "notes" TEXT,
    "purchaseUnitCost" REAL,
    "productionUnitCost" REAL,
    "overheadUnitCost" REAL,
    "totalUnitCost" REAL,
    "profitMargin" REAL,
    "periodMonth" INTEGER,
    "periodYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("createdAt", "customerId", "date", "id", "notes", "overheadUnitCost", "paidAmount", "periodMonth", "periodYear", "productId", "productionUnitCost", "profitMargin", "purchaseUnitCost", "quantity", "shelfLocation", "totalAmount", "totalUnitCost", "unitPrice", "updatedAt", "vatIncludedAmount", "vatRate") SELECT "createdAt", "customerId", "date", "id", "notes", "overheadUnitCost", "paidAmount", "periodMonth", "periodYear", "productId", "productionUnitCost", "profitMargin", "purchaseUnitCost", "quantity", "shelfLocation", "totalAmount", "totalUnitCost", "unitPrice", "updatedAt", "vatIncludedAmount", "vatRate" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE INDEX "Sale_date_idx" ON "Sale"("date");
CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Contact_partnerId_idx" ON "Contact"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_key" ON "Account"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");

-- CreateIndex
CREATE INDEX "StockMovement_date_idx" ON "StockMovement"("date");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");
