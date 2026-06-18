-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "priceTier" TEXT;

-- AlterTable
ALTER TABLE "PriceList" ADD COLUMN "tier" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "salesRepId" INTEGER;

-- CreateTable
CREATE TABLE "PeriodLock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PeriodLock_year_idx" ON "PeriodLock"("year");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodLock_year_month_key" ON "PeriodLock"("year", "month");

-- CreateIndex
CREATE INDEX "PriceList_tier_idx" ON "PriceList"("tier");

-- CreateIndex
CREATE INDEX "Sale_salesRepId_idx" ON "Sale"("salesRepId");
