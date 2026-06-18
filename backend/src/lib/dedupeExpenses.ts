import type { Expense, PrismaClient } from "@prisma/client";

function strictFingerprint(
  e: Pick<Expense, "date" | "category" | "totalAmount" | "paidAmount" | "scope">,
) {
  const day = e.date.toISOString().slice(0, 10);
  return `${day}|${e.scope}|${e.category}|${e.totalAmount}|${e.paidAmount}`;
}

function looseFingerprint(
  e: Pick<Expense, "category" | "totalAmount" | "paidAmount" | "scope">,
) {
  return `${e.scope}|${e.category}|${e.totalAmount}|${e.paidAmount}`;
}

/**
 * Remove legacy duplicate expenses (excelRow = null) when an Excel-row
 * version exists. Uses loose matching (category + amounts) because older
 * imports stored dates 1 day off. Truly manual rows that don't mirror an
 * Excel line are kept.
 */
export async function dedupeLegacyExpenses(prisma: PrismaClient): Promise<number> {
  const [fromExcel, legacy] = await Promise.all([
    prisma.expense.findMany({
      where: { excelRow: { not: null } },
      select: {
        date: true,
        category: true,
        totalAmount: true,
        paidAmount: true,
        scope: true,
      },
    }),
    prisma.expense.findMany({
      where: { excelRow: null },
      select: {
        id: true,
        date: true,
        category: true,
        totalAmount: true,
        paidAmount: true,
        scope: true,
      },
    }),
  ]);

  if (fromExcel.length === 0 || legacy.length === 0) return 0;

  const strictKeys = new Set(fromExcel.map(strictFingerprint));
  const looseKeys = new Set(fromExcel.map(looseFingerprint));

  const toDelete = legacy
    .filter(
      (e) => strictKeys.has(strictFingerprint(e)) || looseKeys.has(looseFingerprint(e)),
    )
    .map((e) => e.id);

  if (toDelete.length === 0) return 0;

  await prisma.expense.deleteMany({ where: { id: { in: toDelete } } });
  return toDelete.length;
}
