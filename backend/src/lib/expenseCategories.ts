import { ExpenseScope, type PrismaClient } from "@prisma/client";

/** Column header labels that must not become expense categories. */
const SKIP_CATEGORY_NAMES = new Set([
  "ÜRÜN_GİDERLERİ",
  "GENEL_GİDERLERİ",
  "Genel_Giderler",
  "ÜRÜN GİDERLERİ",
]);

function isValidCategoryName(name: string) {
  if (!name || SKIP_CATEGORY_NAMES.has(name)) return false;
  const upper = name.toLocaleUpperCase("tr");
  if (upper.includes("ÜRÜN") && upper.includes("GİDER")) return false;
  return true;
}

/** Ensure every category used in expense rows exists in TANIMLAMA (expenseCategory). */
export async function syncExpenseCategoriesFromRecords(prisma: PrismaClient) {
  const scopes = [ExpenseScope.GENERAL, ExpenseScope.PRODUCT] as const;
  let added = 0;

  for (const scope of scopes) {
    const used = await prisma.expense.findMany({
      where: { scope },
      select: { category: true },
      distinct: ["category"],
    });

    for (const { category } of used) {
      const name = category?.trim();
      if (!name || !isValidCategoryName(name)) continue;

      const existing = await prisma.expenseCategory.findUnique({
        where: { name_scope: { name, scope } },
      });
      if (!existing) {
        await prisma.expenseCategory.create({ data: { name, scope } });
        added++;
      }
    }
  }

  return added;
}

export { isValidCategoryName };
