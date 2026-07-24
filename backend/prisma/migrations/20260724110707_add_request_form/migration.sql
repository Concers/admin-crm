-- CreateTable
CREATE TABLE "RequestForm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "productionOrderId" INTEGER,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RequestForm_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RequestForm_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestFormLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "formId" INTEGER NOT NULL,
    "productId" INTEGER,
    "itemName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT,
    "note" TEXT,
    CONSTRAINT "RequestFormLine_formId_fkey" FOREIGN KEY ("formId") REFERENCES "RequestForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RequestForm_type_idx" ON "RequestForm"("type");

-- CreateIndex
CREATE INDEX "RequestForm_partnerId_idx" ON "RequestForm"("partnerId");

-- CreateIndex
CREATE INDEX "RequestForm_status_idx" ON "RequestForm"("status");

-- CreateIndex
CREATE INDEX "RequestFormLine_formId_idx" ON "RequestFormLine"("formId");
