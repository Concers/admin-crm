import { PrismaClient } from "@prisma/client";
import { parseInvoiceNoFromNotes } from "../lib/expenseInvoice.js";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.expense.findMany({
    select: { id: true, notes: true, invoiceNo: true },
  });

  let updated = 0;
  for (const row of rows) {
    const parsed = parseInvoiceNoFromNotes(row.notes);
    if (!parsed) continue;
    if (row.invoiceNo === parsed) continue;
    await prisma.expense.update({
      where: { id: row.id },
      data: { invoiceNo: parsed },
    });
    updated++;
  }

  console.log(`Fatura no → ${updated} kayıt güncellendi (${rows.length} toplam).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
