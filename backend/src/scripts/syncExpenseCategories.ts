import { PrismaClient } from "@prisma/client";
import { syncExpenseCategoriesFromRecords } from "../lib/expenseCategories.js";

const prisma = new PrismaClient();

async function main() {
  const added = await syncExpenseCategoriesFromRecords(prisma);
  const product = await prisma.expenseCategory.findMany({
    where: { scope: "PRODUCT" },
    orderBy: { name: "asc" },
  });
  console.log(`Synced ${added} missing expense category/categories.`);
  console.log("PRODUCT categories:", product.map((c) => c.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
