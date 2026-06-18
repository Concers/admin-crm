/**
 * Yalnızca "Yeni Ürün takip" sayfasını yeniden içe aktarır.
 *   npx tsx src/scripts/importProductDevelopments.ts
 */
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type * as XLSXType from "xlsx";
import { PrismaClient } from "@prisma/client";
import {
  legacyFieldsFromAttributes,
  readDevAttributes,
  URUN_TAKIP_FIRST_COL,
} from "../lib/productDevelopmentImport.js";

const require = createRequire(import.meta.url);
const XLSX: typeof XLSXType = require("xlsx");
const prisma = new PrismaClient();

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function cell(sheet: XLSXType.WorkSheet, row: number, col: number): unknown {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  return sheet[ref]?.v ?? null;
}

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const backendRoot = path.resolve(__dirname, "..", "..");
  const filePath = path.resolve(backendRoot, process.env.EXCEL_SOURCE_PATH ?? "../Kadim Naturel dosyasının kopyası.xlsx");

  console.log(`Reading: ${filePath}`);
  const wb = XLSX.readFile(filePath, { cellDates: false });
  const sheet = wb.Sheets["Yeni Ürün takip"];
  if (!sheet) throw new Error("Yeni Ürün takip sheet not found");

  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  const productIdByName = new Map(products.map((p) => [p.name, p.id]));

  await prisma.productDevelopment.deleteMany();

  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  let count = 0;

  for (let c = URUN_TAKIP_FIRST_COL; c <= range.e.c; c++) {
    const productName = str(cell(sheet, 0, c));
    if (!productName) continue;

    const attributes = readDevAttributes(sheet, c, cell);
    const legacy = legacyFieldsFromAttributes(attributes, productName, {
      startDate: cell(sheet, 1, c),
      supplier: cell(sheet, 2, c),
      quantity: cell(sheet, 3, c),
    });

    await prisma.productDevelopment.create({
      data: {
        ...legacy,
        productId: productIdByName.get(productName) ?? null,
        attributes,
      },
    });
    count++;
  }

  console.log(`Yeni Ürün takip → ${count} kayıt içe aktarıldı.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
