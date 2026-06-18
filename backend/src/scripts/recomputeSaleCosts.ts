/**
 * Satış maliyetlerini yeniden hesaplar (alım birim maliyeti dahil).
 * Excel içe aktarımında M sütunu boş/0 kaldığında tüm satışlarda alım maliyeti eksik kalır.
 *
 * Kullanım:
 *   npx tsx src/scripts/recomputeSaleCosts.ts          # önizleme
 *   npx tsx src/scripts/recomputeSaleCosts.ts --apply    # uygula
 */
import { PrismaClient } from "@prisma/client";
import { computeSaleCosts } from "../lib/costing.js";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toFixed(2);
}

async function main() {
  const sales = await prisma.sale.findMany({
    orderBy: [{ date: "asc" }, { id: "asc" }],
    select: {
      id: true,
      productId: true,
      date: true,
      quantity: true,
      unitPrice: true,
      purchaseUnitCost: true,
      productionUnitCost: true,
      overheadUnitCost: true,
      totalUnitCost: true,
      profitMargin: true,
      product: { select: { name: true } },
    },
  });

  if (sales.length === 0) {
    console.log("Satış kaydı yok.");
    return;
  }

  console.log(apply ? "Uygulanıyor…" : "Önizleme (uygulamak için --apply):");
  let changed = 0;

  for (const sale of sales) {
    const cost = await computeSaleCosts(prisma, {
      productId: sale.productId,
      date: sale.date,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      saleId: sale.id,
    });

    const purchaseChanged = (sale.purchaseUnitCost ?? 0) !== cost.purchaseUnitCost;
    const totalChanged =
      Math.abs((sale.totalUnitCost ?? 0) - cost.totalUnitCost) > 0.01 ||
      Math.abs((sale.productionUnitCost ?? 0) - cost.productionUnitCost) > 0.01 ||
      Math.abs((sale.overheadUnitCost ?? 0) - cost.overheadUnitCost) > 0.01;

    if (!purchaseChanged && !totalChanged) continue;

    if (changed < 5 || sale.id === sales[sales.length - 1]?.id) {
      console.log(
        `  #${sale.id} ${sale.product.name.slice(0, 40)}…\n` +
          `    alım: ${fmt(sale.purchaseUnitCost)} → ${fmt(cost.purchaseUnitCost)} | ` +
          `toplam birim: ${fmt(sale.totalUnitCost)} → ${fmt(cost.totalUnitCost)} | ` +
          `kâr %: ${fmt(sale.profitMargin)} → ${fmt(cost.profitMargin)}`,
      );
    } else if (changed === 5) {
      console.log("  …");
    }

    if (apply) {
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          purchaseUnitCost: cost.purchaseUnitCost,
          productionUnitCost: cost.productionUnitCost,
          overheadUnitCost: cost.overheadUnitCost,
          totalUnitCost: cost.totalUnitCost,
          profitMargin: cost.profitMargin,
        },
      });
    }
    changed++;
  }

  console.log(`\n${changed} satış kaydı ${apply ? "güncellendi" : "güncellenecek"}.`);
  if (!apply) {
    console.log("Onaylamak için: npm run db:recompute-sale-costs -- --apply");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
