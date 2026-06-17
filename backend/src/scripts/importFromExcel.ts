// =============================================================================
// One-off data migration: Kadim Naturel Excel workbook  ->  ERP database
//
//   npm run db:import            (uses EXCEL_SOURCE_PATH from .env)
//   npm run db:import -- <path>  (override the workbook path)
//
// Why this script exists
// ----------------------
// The previous importer assumed every sheet started in column A, but the
// workbook actually leaves column A empty and starts real data in column B.
// That off-by-one shifted dates into product names, products into suppliers,
// and money into VAT fields — corrupting all 81 purchases and 222 sales. This
// rewrite reads each sheet with the verified column map below and recomputes
// (or carries over) the cost & profitability figures cleanly.
//
// The script is idempotent: it wipes the transactional/master tables and
// rebuilds them from the workbook, so it can be re-run safely.
// =============================================================================

import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type * as XLSXType from "xlsx";
import { PartnerType, ExpenseScope, PrismaClient } from "@prisma/client";

// The xlsx ESM build omits filesystem helpers (readFile); load the CommonJS
// build via createRequire so the full API (readFile, utils) is available.
const require = createRequire(import.meta.url);
const XLSX: typeof XLSXType = require("xlsx");
import {
  calcAmortisation,
  calcPurchaseTotals,
  calcSaleCosting,
  parseDate,
  toNumber,
  weightedAveragePurchaseCost,
} from "../lib/calculations.js";

const prisma = new PrismaClient();

// --- Workbook layout constants ----------------------------------------------
// Every data sheet leaves column A (index 0) blank; headers live on row index 2
// and data begins on row index 3. TANIMLAMA is laid out differently (see below).
const DATA_START_ROW = 3;

/** Read a single cell's value (Date | number | string) or null when empty. */
function cell(sheet: XLSXType.WorkSheet, row: number, col: number): unknown {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  const c = sheet[ref] as XLSXType.CellObject | undefined;
  return c?.v ?? null;
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function lastRow(sheet: XLSXType.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  return range.e.r;
}

// =============================================================================
// Lookup caches (name -> id) so transactions can resolve their relations and
// auto-create any partner/product referenced before it was formally defined.
// =============================================================================

const partnerIdByName = new Map<string, number>();
const productIdByName = new Map<string, number>();

// Placeholder partners for transactions whose counterparty is blank in the
// workbook. We keep the row (the amount is real) but flag it for later cleanup
// rather than silently dropping revenue/cost.
const UNDEFINED_CUSTOMER = "TANIMSIZ MÜŞTERİ";
const UNDEFINED_SUPPLIER = "TANIMSIZ TEDARİKÇİ";

async function ensurePartner(name: string, fallbackType: PartnerType): Promise<number | null> {
  const key = name.trim();
  if (!key) return null;
  const existing = partnerIdByName.get(key);
  if (existing) return existing;
  const created = await prisma.partner.create({ data: { name: key, type: fallbackType } });
  partnerIdByName.set(key, created.id);
  return created.id;
}

async function ensureProduct(name: string): Promise<number | null> {
  const key = name.trim();
  if (!key) return null;
  const existing = productIdByName.get(key);
  if (existing) return existing;
  const created = await prisma.product.create({ data: { name: key } });
  productIdByName.set(key, created.id);
  return created.id;
}

// =============================================================================
// 1. Reset — wipe in FK-safe order so the import is repeatable.
// =============================================================================

async function resetDatabase() {
  await prisma.cashFlow.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.productDevelopment.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.partner.deleteMany();
  partnerIdByName.clear();
  productIdByName.clear();
}

// =============================================================================
// 2. TANIMLAMA — master data (partners, products, expense categories)
//
// Layout (data rows from index 5):
//   B(1) partner type   C(2) partner name
//   E(4) product name
//   G(6) general expense category
//   I(8) product expense category
// =============================================================================

const PARTNER_TYPE_MAP: Record<string, PartnerType> = {
  "MÜŞTERİ": PartnerType.CUSTOMER,
  "TEDARİKÇİ": PartnerType.SUPPLIER,
  "HİZMET VEREN": PartnerType.SERVICE_PROVIDER,
  "EL PATRON": PartnerType.OWNER,
};

async function importDefinitions(wb: XLSXType.WorkBook) {
  const sheet = wb.Sheets["TANIMLAMA"];
  if (!sheet) throw new Error("TANIMLAMA sheet not found");
  const end = lastRow(sheet);

  let partners = 0;
  let products = 0;
  let categories = 0;

  for (let r = 5; r <= end; r++) {
    // Partner
    const partnerName = str(cell(sheet, r, 2));
    if (partnerName) {
      const rawType = str(cell(sheet, r, 1));
      const type = PARTNER_TYPE_MAP[rawType] ?? PartnerType.OTHER;
      if (!partnerIdByName.has(partnerName)) {
        const created = await prisma.partner.create({ data: { name: partnerName, type } });
        partnerIdByName.set(partnerName, created.id);
        partners++;
      }
    }

    // Product
    const productName = str(cell(sheet, r, 4));
    if (productName && !productIdByName.has(productName)) {
      const created = await prisma.product.create({ data: { name: productName } });
      productIdByName.set(productName, created.id);
      products++;
    }

    // Expense categories (general + product)
    const generalCat = str(cell(sheet, r, 6));
    if (generalCat) {
      await prisma.expenseCategory.upsert({
        where: { name_scope: { name: generalCat, scope: ExpenseScope.GENERAL } },
        update: {},
        create: { name: generalCat, scope: ExpenseScope.GENERAL },
      });
      categories++;
    }
    const productCat = str(cell(sheet, r, 8));
    if (productCat) {
      await prisma.expenseCategory.upsert({
        where: { name_scope: { name: productCat, scope: ExpenseScope.PRODUCT } },
        update: {},
        create: { name: productCat, scope: ExpenseScope.PRODUCT },
      });
      categories++;
    }
  }

  console.log(`  TANIMLAMA  → partners: ${partners}, products: ${products}, categories: ${categories}`);
}

// =============================================================================
// 3. Gider Girişi — expenses with amortisation
//
// Layout (data from index 3):
//   B(1) date  C(2) month name  D(3) year  E(4) scope (Genel_Giderler / ÜRÜN_GİDERLERİ)
//   F(5) category (gider türü)  G(6) duration months  H(7) product name
//   I(8) service provider/supplier  J(9) total  K(10) paid  L(11) notes
//   M(12) monthly share  N(13) start month  O(14) start year
//   P(15) end month  Q(16) end year  R(17) start date  S(18) end date
// =============================================================================

async function importExpenses(wb: XLSXType.WorkBook) {
  const sheet = wb.Sheets["Gider Girişi"];
  if (!sheet) throw new Error("Gider Girişi sheet not found");
  const end = lastRow(sheet);
  let count = 0;

  for (let r = DATA_START_ROW; r <= end; r++) {
    const date = parseDate(cell(sheet, r, 1));
    const total = toNumber(cell(sheet, r, 9));
    const category = str(cell(sheet, r, 5));
    // Skip blank rows: an expense needs at least a date and a category or amount.
    if (!date || (!category && total === 0)) continue;

    const scope =
      str(cell(sheet, r, 4)).toUpperCase().includes("ÜRÜN")
        ? ExpenseScope.PRODUCT
        : ExpenseScope.GENERAL;

    const productName = str(cell(sheet, r, 7));
    const providerName = str(cell(sheet, r, 8));
    const productId = productName ? await ensureProduct(productName) : null;
    const partnerId = providerName
      ? await ensurePartner(providerName, PartnerType.SERVICE_PROVIDER)
      : null;

    const paid = toNumber(cell(sheet, r, 10));
    const durationMonths = toNumber(cell(sheet, r, 6), 1);
    // Prefer the workbook's pre-computed window; recompute as a fallback.
    const amort = calcAmortisation({ date, durationMonths, paidAmount: paid });

    await prisma.expense.create({
      data: {
        date,
        scope,
        category: category || "Diğer",
        productId,
        partnerId,
        totalAmount: total,
        paidAmount: paid,
        notes: str(cell(sheet, r, 11)) || null,
        durationMonths: durationMonths || amort.durationMonths,
        monthlyShare: toNumber(cell(sheet, r, 12)) || amort.monthlyShare,
        startMonth: toNumber(cell(sheet, r, 13)) || amort.startMonth,
        startYear: toNumber(cell(sheet, r, 14)) || amort.startYear,
        endMonth: toNumber(cell(sheet, r, 15)) || amort.endMonth,
        endYear: toNumber(cell(sheet, r, 16)) || amort.endYear,
        startDate: parseDate(cell(sheet, r, 17)) ?? amort.startDate,
        endDate: parseDate(cell(sheet, r, 18)) ?? amort.endDate,
      },
    });
    count++;
  }

  console.log(`  Gider Girişi → ${count} expenses`);
}

// =============================================================================
// 4. Ürün Alım Giriş — purchases
//
// Layout (data from index 3):
//   B(1) date  C(2) product  D(3) supplier  E(4) unit price  F(5) quantity
//   G(6) total  H(7) vat rate  I(8) vat-included  J(9) paid  K(10) shelf  L(11) notes
// =============================================================================

async function importPurchases(wb: XLSXType.WorkBook) {
  const sheet = wb.Sheets["Ürün Alım Giriş"];
  if (!sheet) throw new Error("Ürün Alım Giriş sheet not found");
  const end = lastRow(sheet);
  let count = 0;

  for (let r = DATA_START_ROW; r <= end; r++) {
    const date = parseDate(cell(sheet, r, 1));
    const productName = str(cell(sheet, r, 2));
    const quantity = toNumber(cell(sheet, r, 5));
    if (!date || !productName || quantity === 0) continue;

    const productId = await ensureProduct(productName);
    const supplierName = str(cell(sheet, r, 3)) || UNDEFINED_SUPPLIER;
    const supplierId = await ensurePartner(supplierName, PartnerType.SUPPLIER);
    if (productId === null || supplierId === null) continue;

    const unitPrice = toNumber(cell(sheet, r, 4));
    const vatRate = toNumber(cell(sheet, r, 7), 0.2);
    const totals = calcPurchaseTotals({ unitPrice, quantity, vatRate });

    await prisma.purchase.create({
      data: {
        date,
        productId,
        supplierId,
        unitPrice,
        quantity,
        vatRate,
        // Trust the workbook's printed totals when present, else recompute.
        totalAmount: toNumber(cell(sheet, r, 6)) || totals.totalAmount,
        vatIncludedAmount: toNumber(cell(sheet, r, 8)) || totals.vatIncludedAmount,
        paidAmount: toNumber(cell(sheet, r, 9)),
        shelfLocation: str(cell(sheet, r, 10)) || null,
        notes: str(cell(sheet, r, 11)) || null,
      },
    });
    count++;
  }

  console.log(`  Ürün Alım Giriş → ${count} purchases`);
}

// =============================================================================
// 5. Ürün Satış Giriş — sales (with carried-over / recomputed costing)
//
// Layout (data from index 3):
//   B(1) date  C(2) product  D(3) customer (labelled TEDARİKÇİ — see schema note)
//   E(4) unit price  F(5) quantity  G(6) total  H(7) vat rate  I(8) vat-included
//   J(9) paid  K(10) shelf  L(11) notes
//   M(12) purchase unit cost  N(13) production unit cost  O(14) overhead unit cost
//   P(15) total unit cost  Q(16) profit %  R(17) month  S(18) year
// =============================================================================

async function importSales(wb: XLSXType.WorkBook) {
  const sheet = wb.Sheets["Ürün Satış Giriş"];
  if (!sheet) throw new Error("Ürün Satış Giriş sheet not found");
  const end = lastRow(sheet);

  // Purchase history per product → weighted-average cost fallback.
  const purchases = await prisma.purchase.findMany({
    select: { productId: true, unitPrice: true, quantity: true },
  });
  const purchasesByProduct = new Map<number, { unitPrice: number; quantity: number }[]>();
  for (const p of purchases) {
    const list = purchasesByProduct.get(p.productId) ?? [];
    list.push({ unitPrice: p.unitPrice, quantity: p.quantity });
    purchasesByProduct.set(p.productId, list);
  }

  let count = 0;
  for (let r = DATA_START_ROW; r <= end; r++) {
    const date = parseDate(cell(sheet, r, 1));
    const productName = str(cell(sheet, r, 2));
    const quantity = toNumber(cell(sheet, r, 5));
    if (!date || !productName || quantity === 0) continue;

    const productId = await ensureProduct(productName);
    const customerName = str(cell(sheet, r, 3)) || UNDEFINED_CUSTOMER;
    const customerId = await ensurePartner(customerName, PartnerType.CUSTOMER);
    if (productId === null || customerId === null) continue;

    const unitPrice = toNumber(cell(sheet, r, 4));
    const vatRate = toNumber(cell(sheet, r, 7), 0.2);

    // --- Costing ---------------------------------------------------------
    // Faithfulness rule: when the workbook already costed a sale (its TOTAL
    // UNIT COST column is filled) we preserve every historical figure exactly
    // as recorded, even component values of 0 — recomputing would diverge from
    // the books. Only when the workbook left a sale uncosted do we derive the
    // figures ourselves from purchase history + components, keeping the stored
    // row internally consistent (components sum to the total).
    const wbPurchaseUnitCost = toNumber(cell(sheet, r, 12)); // M
    const productionUnitCost = toNumber(cell(sheet, r, 13)); // N
    const overheadUnitCost = toNumber(cell(sheet, r, 14)); // O
    const hasWorkbookTotal = cell(sheet, r, 15) != null; // P

    let purchaseUnitCost: number;
    let totalUnitCost: number;
    let profitMargin: number | null;

    if (hasWorkbookTotal) {
      purchaseUnitCost = wbPurchaseUnitCost;
      totalUnitCost = toNumber(cell(sheet, r, 15));
      profitMargin =
        cell(sheet, r, 16) != null
          ? toNumber(cell(sheet, r, 16))
          : calcSaleCosting({ unitPrice, quantity, vatRate, purchaseUnitCost, productionUnitCost, overheadUnitCost }).profitMargin;
    } else {
      purchaseUnitCost =
        wbPurchaseUnitCost || weightedAveragePurchaseCost(purchasesByProduct.get(productId) ?? []);
      const costing = calcSaleCosting({ unitPrice, quantity, vatRate, purchaseUnitCost, productionUnitCost, overheadUnitCost });
      totalUnitCost = costing.totalUnitCost;
      profitMargin = costing.profitMargin;
    }

    const totals = calcSaleCosting({ unitPrice, quantity, vatRate });

    await prisma.sale.create({
      data: {
        date,
        productId,
        customerId,
        unitPrice,
        quantity,
        vatRate,
        totalAmount: toNumber(cell(sheet, r, 6)) || totals.totalAmount,
        vatIncludedAmount: toNumber(cell(sheet, r, 8)) || totals.vatIncludedAmount,
        paidAmount: toNumber(cell(sheet, r, 9)),
        shelfLocation: str(cell(sheet, r, 10)) || null,
        notes: str(cell(sheet, r, 11)) || null,
        purchaseUnitCost,
        productionUnitCost,
        overheadUnitCost,
        totalUnitCost,
        profitMargin,
        periodMonth: toNumber(cell(sheet, r, 17)) || date.getMonth() + 1,
        periodYear: toNumber(cell(sheet, r, 18)) || date.getFullYear(),
      },
    });
    count++;
  }

  console.log(`  Ürün Satış Giriş → ${count} sales`);
}

// =============================================================================
// 6. Tedarikçi Ödeme / Müşteri Tahsilat — cash flows
//
// Both sheets share the layout (data from index 3):
//   B(1) date  C(2) partner name  D(3) amount  E(4) notes
// =============================================================================

async function importCashFlows(
  wb: XLSXType.WorkBook,
  sheetName: string,
  type: "PAYMENT" | "COLLECTION",
  fallbackType: PartnerType,
) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return;
  const end = lastRow(sheet);
  let count = 0;

  for (let r = DATA_START_ROW; r <= end; r++) {
    const date = parseDate(cell(sheet, r, 1));
    const partnerName = str(cell(sheet, r, 2));
    const amount = toNumber(cell(sheet, r, 3));
    if (!date || !partnerName || amount === 0) continue;

    const partnerId = await ensurePartner(partnerName, fallbackType);
    if (partnerId === null) continue;

    await prisma.cashFlow.create({
      data: { date, partnerId, type, amount, notes: str(cell(sheet, r, 4)) || null },
    });
    count++;
  }

  console.log(`  ${sheetName} → ${count} ${type.toLowerCase()}s`);
}

// =============================================================================
// 7. Yeni Ürün takip — new-product pipeline (TRANSPOSED layout)
//
// Attributes run down column A; each product occupies its own column (from M).
// =============================================================================

const DEV_ATTRIBUTE_ROWS: Record<string, number> = {
  productName: 0,
  startDate: 1,
  supplierName: 2,
  orderQuantity: 3,
  productClass: 4,
  isRawMaterial: 5,
  orderPlaced: 6,
  priceReceived: 7,
  sampleReceived: 8,
  sampleApproved: 9,
  productionBegun: 10,
  productionDone: 11,
  notes: 12,
};

function toBool(value: unknown): boolean | null {
  const s = str(value).toLowerCase();
  if (!s) return null;
  return ["evet", "yes", "true", "1", "x", "✓", "tamam", "ok"].includes(s);
}

async function importProductDevelopments(wb: XLSXType.WorkBook) {
  const sheet = wb.Sheets["Yeni Ürün takip"];
  if (!sheet) return;
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  let count = 0;

  // Product columns start after the label column; scan from B onward.
  for (let c = 1; c <= range.e.c; c++) {
    const productName = str(cell(sheet, DEV_ATTRIBUTE_ROWS.productName, c));
    if (!productName) continue;

    await prisma.productDevelopment.create({
      data: {
        productName,
        productId: productIdByName.get(productName) ?? null,
        startDate: parseDate(cell(sheet, DEV_ATTRIBUTE_ROWS.startDate, c)),
        supplierName: str(cell(sheet, DEV_ATTRIBUTE_ROWS.supplierName, c)) || null,
        orderQuantity: cell(sheet, DEV_ATTRIBUTE_ROWS.orderQuantity, c) != null
          ? toNumber(cell(sheet, DEV_ATTRIBUTE_ROWS.orderQuantity, c))
          : null,
        productClass: str(cell(sheet, DEV_ATTRIBUTE_ROWS.productClass, c)) || null,
        isRawMaterial: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.isRawMaterial, c)),
        orderPlaced: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.orderPlaced, c)),
        priceReceived: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.priceReceived, c)),
        sampleReceived: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.sampleReceived, c)),
        sampleApproved: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.sampleApproved, c)),
        productionBegun: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.productionBegun, c)),
        productionDone: toBool(cell(sheet, DEV_ATTRIBUTE_ROWS.productionDone, c)),
        notes: str(cell(sheet, DEV_ATTRIBUTE_ROWS.notes, c)) || null,
      },
    });
    count++;
  }

  console.log(`  Yeni Ürün takip → ${count} developments`);
}

// =============================================================================
// Orchestration
// =============================================================================

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const override = process.argv[2];
  const envPath = process.env.EXCEL_SOURCE_PATH;
  // Resolve relative to the backend root (two levels up from src/scripts).
  const backendRoot = path.resolve(__dirname, "..", "..");
  const filePath = override
    ? path.resolve(override)
    : envPath
      ? path.resolve(backendRoot, envPath)
      : path.resolve(backendRoot, "..", "Kadim Naturel dosyasının kopyası.xlsx");

  console.log(`Reading workbook: ${filePath}`);
  const wb = XLSX.readFile(filePath, { cellDates: true });

  console.log("Resetting database…");
  await resetDatabase();

  console.log("Importing…");
  await importDefinitions(wb);
  await importExpenses(wb);
  await importPurchases(wb);
  await importSales(wb);
  await importCashFlows(wb, "Tedarikçi Ödeme", "PAYMENT", PartnerType.SUPPLIER);
  await importCashFlows(wb, "Müşteri Tahsilat", "COLLECTION", PartnerType.CUSTOMER);
  await importProductDevelopments(wb);

  // Final tally.
  const [partners, products, purchases, sales, expenses, cashFlows, devs] = await Promise.all([
    prisma.partner.count(),
    prisma.product.count(),
    prisma.purchase.count(),
    prisma.sale.count(),
    prisma.expense.count(),
    prisma.cashFlow.count(),
    prisma.productDevelopment.count(),
  ]);

  console.log("\n=== Migration complete ===");
  console.table({ partners, products, purchases, sales, expenses, cashFlows, developments: devs });
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
