import { PrismaClient } from "@prisma/client";
import { calendarDateFromInstant } from "../lib/calculations.js";

const prisma = new PrismaClient();

async function normalizeDates<T extends { id: number; date: Date }>(
  update: (id: number, date: Date) => Promise<unknown>,
  rows: T[],
) {
  let fixed = 0;
  for (const row of rows) {
    const normalized = calendarDateFromInstant(row.date);
    if (normalized.getTime() !== row.date.getTime()) {
      await update(row.id, normalized);
      fixed++;
    }
  }
  return fixed;
}

async function main() {
  const [expenses, purchases, sales, cashFlows] = await Promise.all([
    prisma.expense.findMany({ select: { id: true, date: true } }),
    prisma.purchase.findMany({ select: { id: true, date: true } }),
    prisma.sale.findMany({ select: { id: true, date: true } }),
    prisma.cashFlow.findMany({ select: { id: true, date: true } }),
  ]);

  const e = await normalizeDates(
    (id, date) => prisma.expense.update({ where: { id }, data: { date } }),
    expenses,
  );
  const p = await normalizeDates(
    (id, date) => prisma.purchase.update({ where: { id }, data: { date } }),
    purchases,
  );
  const s = await normalizeDates(
    (id, date) => prisma.sale.update({ where: { id }, data: { date } }),
    sales,
  );
  const c = await normalizeDates(
    (id, date) => prisma.cashFlow.update({ where: { id }, data: { date } }),
    cashFlows,
  );

  console.log(`Normalized → expenses: ${e}, purchases: ${p}, sales: ${s}, cashflows: ${c}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
