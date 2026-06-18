-- 29cc090 added these Expense columns to schema.prisma without a migration.
-- They are additive & nullable; excelRow is UNIQUE but all existing rows are
-- NULL (SQLite allows multiple NULLs in a unique index), so this is safe.

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "invoiceNo" TEXT;
ALTER TABLE "Expense" ADD COLUMN "excelRow" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "excelMonthLabel" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_excelRow_key" ON "Expense"("excelRow");
