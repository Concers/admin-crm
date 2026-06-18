import { PrismaClient } from "@prisma/client";
import { dedupeLegacyExpenses } from "../lib/dedupeExpenses.js";

const prisma = new PrismaClient();

const before = await prisma.expense.count();
const removed = await dedupeLegacyExpenses(prisma);
const after = await prisma.expense.count();

console.log(`Before: ${before}, removed: ${removed}, after: ${after}`);
console.log(`  excelRow set: ${await prisma.expense.count({ where: { excelRow: { not: null } } })}`);
console.log(`  manual (excelRow null): ${await prisma.expense.count({ where: { excelRow: null } })}`);

await prisma.$disconnect();
