-- Finans modülleri: bütçe hedefleri, çek/senet, maliyet geçmişi

-- CreateTable BudgetTarget
CREATE TABLE "BudgetTarget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "category" TEXT,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "BudgetTarget_year_month_metric_category_key" ON "BudgetTarget"("year", "month", "metric", "category");
CREATE INDEX "BudgetTarget_year_month_idx" ON "BudgetTarget"("year", "month");

-- CreateTable PaymentInstrument
CREATE TABLE "PaymentInstrument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "accountId" INTEGER,
    "number" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PORTFOLIO',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentInstrument_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentInstrument_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PaymentInstrument_dueDate_idx" ON "PaymentInstrument"("dueDate");
CREATE INDEX "PaymentInstrument_status_idx" ON "PaymentInstrument"("status");
CREATE INDEX "PaymentInstrument_partnerId_idx" ON "PaymentInstrument"("partnerId");

-- CreateTable ProductCostHistory
CREATE TABLE "ProductCostHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseUnitCost" REAL NOT NULL,
    "productionUnitCost" REAL NOT NULL,
    "overheadUnitCost" REAL NOT NULL,
    "totalUnitCost" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceEntity" TEXT,
    "sourceId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "ProductCostHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProductCostHistory_productId_recordedAt_idx" ON "ProductCostHistory"("productId", "recordedAt");
