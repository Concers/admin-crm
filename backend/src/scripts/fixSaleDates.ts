/**
 * One-off fix: Excel / eski içe aktarımda satış tarihleri 1 gün geride kalmış.
 * Tüm sale.date değerlerine +1 takvim günü ekler.
 *
 * Kullanım:
 *   npx tsx src/scripts/fixSaleDates.ts          # önizleme
 *   npx tsx src/scripts/fixSaleDates.ts --apply    # uygula
 */
import { PrismaClient } from "@prisma/client";
import { shiftCalendarDate } from "../lib/calculations.js";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

function fmt(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day}.${m}.${y}`;
}

async function main() {
  const rows = await prisma.sale.findMany({
    select: { id: true, date: true, dueDate: true },
    orderBy: { id: "asc" },
  });

  if (rows.length === 0) {
    console.log("Satış kaydı yok.");
    return;
  }

  console.log(apply ? "Uygulanıyor…" : "Önizleme (uygulamak için --apply):");
  let changed = 0;

  for (const row of rows) {
    const nextDate = shiftCalendarDate(row.date, 1);
    const nextDue = row.dueDate ? shiftCalendarDate(row.dueDate, 1) : null;

    if (row.id <= 5 || row.id === rows.length) {
      console.log(
        `  #${row.id}: ${fmt(row.date)} → ${fmt(nextDate)}` +
          (row.dueDate ? ` | vade ${fmt(row.dueDate)} → ${fmt(nextDue!)}` : ""),
      );
    } else if (row.id === 6) {
      console.log("  …");
    }

    if (apply) {
      await prisma.sale.update({
        where: { id: row.id },
        data: {
          date: nextDate,
          ...(nextDue ? { dueDate: nextDue } : {}),
        },
      });
    }
    changed++;
  }

  console.log(`\n${changed} satış kaydı ${apply ? "güncellendi" : "güncellenecek"}.`);
  if (!apply) {
    console.log("Onaylamak için: npm run db:fix-sale-dates -- --apply");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
