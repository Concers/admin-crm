// =============================================================================
// Reporting queries (cari ekstreler, borç/alacak, stok, gelir-gider…)
//
// Ported from the original frontend `src/lib/reports.ts` and rewritten against
// the canonical English ERP schema. These power the read-only report endpoints.
// =============================================================================

import { prisma } from "./prisma.js";
import { getStockBreakdownMap } from "./costing.js";
import { sortExpensesByExcelRow } from "./calculations.js";

/** Dashboard headline figures + recent activity. */
export async function getDashboardStats() {
  const [expense, purchase, sale, partnerCount, productCount, recentSales, recentExpenses] =
    await Promise.all([
      prisma.expense.aggregate({ _sum: { totalAmount: true } }),
      prisma.purchase.aggregate({ _sum: { vatIncludedAmount: true } }),
      prisma.sale.aggregate({ _sum: { vatIncludedAmount: true } }),
      prisma.partner.count(),
      prisma.product.count(),
      prisma.sale.findMany({
        orderBy: { date: "desc" },
        take: 5,
        include: { product: true, customer: true },
      }),
      prisma.expense.findMany({
        orderBy: { date: "desc" },
        take: 5,
        include: { product: true, partner: true },
      }),
    ]);

  return {
    totalExpense: expense._sum.totalAmount ?? 0,
    totalPurchase: purchase._sum.vatIncludedAmount ?? 0,
    totalSale: sale._sum.vatIncludedAmount ?? 0,
    partnerCount,
    productCount,
    recentSales,
    recentExpenses,
  };
}

/**
 * Stock report — quantity purchased vs sold per product, with the true on-hand
 * level (includes manual movements, returns and production via the shared
 * stock engine so it matches the sale guard).
 */
export async function getStockReport() {
  const [products, stockMap] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    getStockBreakdownMap(prisma),
  ]);

  return products.map((product) => {
    const b = stockMap.get(product.id);
    return {
      product: product.name,
      shelf: product.shelfLocation ?? null,
      unit: product.unit,
      purchased: b?.purchased ?? 0,
      sold: b?.sold ?? 0,
      stock: b?.stock ?? 0,
    };
  });
}

/**
 * Unified current-account (cari hesap) balance per partner.
 *
 * In this B2B data the same firm can be both a customer and a supplier, so a
 * single net balance is computed across both roles:
 *
 *   receivable = sales to them − collections from them   (they owe us)
 *   payable    = purchases from them − (upfront + payments to them)  (we owe them)
 *   net        = receivable − payable
 *
 *   net > 0  → net receivable (alacak — they owe us)
 *   net < 0  → net payable    (borç — we owe them)
 */
export interface PartnerBalance {
  name: string;
  salesTotal: number;
  collected: number;
  receivable: number;
  purchaseTotal: number;
  paidToThem: number;
  payable: number;
  net: number;
}

export async function getPartnerBalances(): Promise<PartnerBalance[]> {
  const [partners, sales, purchases, cashflows] = await Promise.all([
    prisma.partner.findMany(),
    prisma.sale.findMany({ select: { customerId: true, vatIncludedAmount: true } }),
    prisma.purchase.findMany({ select: { supplierId: true, vatIncludedAmount: true, paidAmount: true } }),
    prisma.cashFlow.findMany({ select: { partnerId: true, type: true, amount: true } }),
  ]);

  return partners
    .map((p) => {
      const salesTotal = sales
        .filter((s) => s.customerId === p.id)
        .reduce((sum, s) => sum + s.vatIncludedAmount, 0);
      const collected = cashflows
        .filter((c) => c.partnerId === p.id && c.type === "COLLECTION")
        .reduce((sum, c) => sum + c.amount, 0);

      const purchaseTotal = purchases
        .filter((x) => x.supplierId === p.id)
        .reduce((sum, x) => sum + x.vatIncludedAmount, 0);
      const upfront = purchases
        .filter((x) => x.supplierId === p.id)
        .reduce((sum, x) => sum + x.paidAmount, 0);
      const payments = cashflows
        .filter((c) => c.partnerId === p.id && c.type === "PAYMENT")
        .reduce((sum, c) => sum + c.amount, 0);
      const paidToThem = upfront + payments;

      const receivable = salesTotal - collected;
      const payable = purchaseTotal - paidToThem;
      return {
        name: p.name,
        salesTotal,
        collected,
        receivable,
        purchaseTotal,
        paidToThem,
        payable,
        net: receivable - payable,
      };
    })
    .filter((b) => b.salesTotal > 0 || b.purchaseTotal > 0);
}

/** Partners we have a net receivable from (alacak), largest first. */
export async function getCustomerReceivableList() {
  const balances = await getPartnerBalances();
  return balances.filter((b) => b.net > 0.01).sort((a, b) => b.net - a.net);
}

/** Partners we have a net debt to (borç); `debt` is the positive amount owed. */
export async function getSupplierDebtList() {
  const balances = await getPartnerBalances();
  return balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ ...b, debt: -b.net }))
    .sort((a, b) => b.debt - a.debt);
}

/** Expenses filtered by month and/or year, in Excel row order. */
export async function getExpenseReport(month?: number, year?: number) {
  const now = new Date();
  let where: { date?: { gte: Date; lt: Date } } = {};
  if (month && year) where = { date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } };
  else if (month) where = { date: { gte: new Date(now.getFullYear(), month - 1, 1), lt: new Date(now.getFullYear(), month, 1) } };
  else if (year) where = { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } };

  const rows = await prisma.expense.findMany({
    where,
    include: { product: true, partner: true },
  });
  return sortExpensesByExcelRow(rows);
}

/** Income vs expense over a date range, with the underlying rows. */
export async function getIncomeExpenseReport(start: Date, end: Date) {
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: start, lte: end } },
      include: { product: true, customer: true },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      include: { product: true, partner: true },
    }),
  ]);

  const income = sales.reduce((sum, s) => sum + s.vatIncludedAmount, 0);
  const expense = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  return { income, expense, profit: income - expense, sales, expenses: sortExpensesByExcelRow(expenses) };
}

export interface GelirGiderBreakdownItem {
  name: string;
  amount: number;
}

/** Kayıtlı işlemlerin en erken / en geç tarihi (varsayılan dönem filtresi için). */
export async function getGelirGiderDateBounds(): Promise<{ min: string; max: string } | null> {
  const [sale, purchase, expense] = await Promise.all([
    prisma.sale.aggregate({ _min: { date: true }, _max: { date: true } }),
    prisma.purchase.aggregate({ _min: { date: true }, _max: { date: true } }),
    prisma.expense.aggregate({ _min: { date: true }, _max: { date: true } }),
  ]);

  const all = [
    sale._min.date,
    sale._max.date,
    purchase._min.date,
    purchase._max.date,
    expense._min.date,
    expense._max.date,
  ].filter((d): d is Date => d != null);

  if (!all.length) return null;

  const min = new Date(Math.min(...all.map((d) => d.getTime())));
  const max = new Date(Math.max(...all.map((d) => d.getTime())));
  return { min: min.toISOString(), max: max.toISOString() };
}

/** Excel "Gelir_Gider Rapor" — KDV hariç satış, alım ve gider kırılımları. */
export async function getGelirGiderReport(start: Date, end: Date) {
  const [sales, purchases, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { date: { gte: start, lte: end } },
      include: { product: true },
    }),
    prisma.purchase.findMany({
      where: { date: { gte: start, lte: end } },
      include: { product: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      include: { product: true },
    }),
  ]);

  function sumBy<T>(
    rows: T[],
    keyFn: (row: T) => string,
    valFn: (row: T) => number,
  ): GelirGiderBreakdownItem[] {
    const map = new Map<string, number>();
    for (const row of rows) {
      const key = keyFn(row);
      map.set(key, (map.get(key) ?? 0) + valFn(row));
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "tr"));
  }

  const satisToplam = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const alimToplam = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const productExpenses = expenses.filter((e) => e.scope === "PRODUCT" && e.productId);
  const generalExpenses = expenses.filter((e) => e.scope === "GENERAL");
  const urunGiderleri = productExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const genelGiderler = generalExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const karZarar = satisToplam - alimToplam - urunGiderleri - genelGiderler;

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    satisToplam,
    alimToplam,
    urunGiderleri,
    genelGiderler,
    karZarar,
    satisKalemleri: sumBy(sales, (s) => s.product.name, (s) => s.totalAmount),
    alimKalemleri: sumBy(purchases, (p) => p.product.name, (p) => p.totalAmount),
    urunGiderKalemleri: sumBy(
      productExpenses,
      (e) => e.product!.name,
      (e) => e.totalAmount,
    ),
    genelGiderKalemleri: sumBy(generalExpenses, (e) => e.category, (e) => e.totalAmount),
  };
}

/** Customer account statement (satışlar + tahsilatlar). */
export async function getCustomerStatement(name: string) {
  // Match by name regardless of type: in this B2B data the same firms act as
  // both supplier and customer, so customers aren't necessarily type=CUSTOMER.
  const customer = await prisma.partner.findFirst({ where: { name } });
  if (!customer) {
    return { sales: [], collections: [], saleTotal: 0, vatIncludedTotal: 0, collected: 0, receivable: 0 };
  }

  const [sales, collections] = await Promise.all([
    prisma.sale.findMany({ where: { customerId: customer.id }, include: { product: true }, orderBy: { date: "asc" } }),
    prisma.cashFlow.findMany({ where: { partnerId: customer.id, type: "COLLECTION" }, orderBy: { date: "asc" } }),
  ]);

  const saleTotal = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const vatIncludedTotal = sales.reduce((sum, s) => sum + s.vatIncludedAmount, 0);
  const collected = collections.reduce((sum, c) => sum + c.amount, 0);

  return { sales, collections, saleTotal, vatIncludedTotal, collected, receivable: vatIncludedTotal - collected };
}

/** Supplier account statement (alımlar + ödemeler). */
export async function getSupplierStatement(name: string) {
  const supplier = await prisma.partner.findFirst({
    where: { name, type: { in: ["SUPPLIER", "SERVICE_PROVIDER"] } },
  });
  if (!supplier) {
    return { purchases: [], payments: [], purchaseTotal: 0, upfront: 0, paid: 0, debt: 0 };
  }

  const [purchases, payments] = await Promise.all([
    prisma.purchase.findMany({ where: { supplierId: supplier.id }, include: { product: true }, orderBy: { date: "asc" } }),
    prisma.cashFlow.findMany({ where: { partnerId: supplier.id, type: "PAYMENT" }, orderBy: { date: "asc" } }),
  ]);

  const purchaseTotal = purchases.reduce((sum, p) => sum + p.vatIncludedAmount, 0);
  const upfront = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);

  return { purchases, payments, purchaseTotal, upfront, paid, debt: purchaseTotal - upfront - paid };
}

/** Product analysis — sales vs purchases and gross margin. */
export async function getProductReport(name?: string) {
  const product = name ? await prisma.product.findFirst({ where: { name } }) : null;
  const where = product ? { productId: product.id } : {};

  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({ where, include: { customer: true }, orderBy: { date: "asc" } }),
    prisma.purchase.findMany({ where, include: { supplier: true }, orderBy: { date: "asc" } }),
  ]);

  const saleAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const purchaseAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return { sales, purchases, saleAmount, purchaseAmount, profit: saleAmount - purchaseAmount };
}

// =============================================================================
// Phase 3 reports: aging, VAT declaration, income statement, stock ledger.
// =============================================================================

/**
 * Receivable aging (alacak yaşlandırma). For each customer, collections are
 * applied FIFO against the oldest sales; the remaining unpaid amount of each
 * sale is bucketed by its age relative to `asOf` (default: now).
 */
export async function getReceivableAging(asOf: Date = new Date()) {
  const [partners, sales, collections] = await Promise.all([
    prisma.partner.findMany(),
    prisma.sale.findMany({ select: { customerId: true, vatIncludedAmount: true, date: true }, orderBy: { date: "asc" } }),
    prisma.cashFlow.findMany({ where: { type: "COLLECTION" }, select: { partnerId: true, amount: true } }),
  ]);

  const rows = partners
    .map((p) => {
      const partnerSales = sales.filter((s) => s.customerId === p.id);
      if (partnerSales.length === 0) return null;
      let collected = collections.filter((c) => c.partnerId === p.id).reduce((sum, c) => sum + c.amount, 0);

      const buckets = { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
      for (const s of partnerSales) {
        let unpaid = s.vatIncludedAmount;
        if (collected > 0) {
          const applied = Math.min(collected, unpaid);
          unpaid -= applied;
          collected -= applied;
        }
        if (unpaid <= 0.01) continue;
        const ageDays = Math.floor((asOf.getTime() - new Date(s.date).getTime()) / 86_400_000);
        if (ageDays <= 30) buckets.d0_30 += unpaid;
        else if (ageDays <= 60) buckets.d31_60 += unpaid;
        else if (ageDays <= 90) buckets.d61_90 += unpaid;
        else buckets.d90plus += unpaid;
      }
      const total = buckets.d0_30 + buckets.d31_60 + buckets.d61_90 + buckets.d90plus;
      return { name: p.name, ...buckets, total };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null && r.total > 0.01)
    .sort((a, b) => b.total - a.total);

  return rows;
}

/** VAT declaration (KDV beyanı) for a period: output VAT − input VAT. */
function vatBreakdown(items: { totalAmount: number; vatIncludedAmount: number; vatRate: number }[]) {
  const map = new Map<number, { base: number; vat: number; count: number }>();
  for (const item of items) {
    const rate = item.vatRate;
    const entry = map.get(rate) ?? { base: 0, vat: 0, count: 0 };
    entry.base += item.totalAmount;
    entry.vat += item.vatIncludedAmount - item.totalAmount;
    entry.count += 1;
    map.set(rate, entry);
  }
  return [...map.entries()]
    .map(([rate, v]) => ({ rate, ...v }))
    .sort((a, b) => b.rate - a.rate);
}

export async function getVatDeclaration(month?: number, year?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const where = month
    ? { date: { gte: new Date(y, month - 1, 1), lt: new Date(y, month, 1) } }
    : { date: { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) } };

  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({ where, select: { totalAmount: true, vatIncludedAmount: true, vatRate: true } }),
    prisma.purchase.findMany({ where, select: { totalAmount: true, vatIncludedAmount: true, vatRate: true } }),
  ]);

  const salesBase = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const purchasesBase = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const outputVat = sales.reduce((sum, s) => sum + (s.vatIncludedAmount - s.totalAmount), 0);
  const inputVat = purchases.reduce((sum, p) => sum + (p.vatIncludedAmount - p.totalAmount), 0);
  return {
    outputVat,
    inputVat,
    payableVat: outputVat - inputVat,
    salesBase,
    purchasesBase,
    salesCount: sales.length,
    purchaseCount: purchases.length,
    outputByRate: vatBreakdown(sales),
    inputByRate: vatBreakdown(purchases),
    period: { month: month ?? null, year: y },
  };
}

/** Income statement (gelir tablosu) for a period. */
export async function getIncomeStatement(start: Date, end: Date) {
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({ where: { date: { gte: start, lte: end } }, select: { totalAmount: true, totalUnitCost: true, quantity: true } }),
    prisma.expense.findMany({ where: { date: { gte: start, lte: end } }, select: { totalAmount: true } }),
  ]);

  const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const cogs = sales.reduce((sum, s) => sum + (s.totalUnitCost ?? 0) * s.quantity, 0);
  const grossProfit = revenue - cogs;
  const operatingExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const netProfit = grossProfit - operatingExpenses;
  return { revenue, cogs, grossProfit, operatingExpenses, netProfit };
}

/** Stock movement ledger for a product — purchases (IN), sales (OUT) and
 *  explicit movements, chronological, with a running balance. */
export async function getStockLedger(productName: string) {
  const product = await prisma.product.findFirst({ where: { name: productName } });
  if (!product) return { product: productName, movements: [], balance: 0 };

  const [purchases, sales, movements] = await Promise.all([
    prisma.purchase.findMany({ where: { productId: product.id }, select: { date: true, quantity: true } }),
    prisma.sale.findMany({ where: { productId: product.id }, select: { date: true, quantity: true } }),
    prisma.stockMovement.findMany({ where: { productId: product.id }, select: { date: true, type: true, quantity: true, reason: true } }),
  ]);

  type Entry = { date: Date; type: string; in: number; out: number; reason: string | null };
  const entries: Entry[] = [
    ...purchases.map((p) => ({ date: p.date, type: "ALIM", in: p.quantity, out: 0, reason: null })),
    ...sales.map((s) => ({ date: s.date, type: "SATIŞ", in: 0, out: s.quantity, reason: null })),
    ...movements.map((m) => {
      const adds = m.type === "IN" || (m.type === "ADJUSTMENT" && m.quantity >= 0);
      return { date: m.date, type: m.type, in: adds ? Math.abs(m.quantity) : 0, out: adds ? 0 : Math.abs(m.quantity), reason: m.reason };
    }),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let balance = 0;
  const withBalance = entries.map((e) => {
    balance += e.in - e.out;
    return { ...e, balance };
  });
  return { product: product.name, movements: withBalance, balance };
}

/** Products at or below their minimum stock level (düşük stok uyarısı). */
export async function getLowStockReport() {
  const [products, stockMap] = await Promise.all([
    prisma.product.findMany({ where: { minStock: { not: null } } }),
    getStockBreakdownMap(prisma),
  ]);

  return products
    .map((p) => ({
      product: p.name,
      stock: stockMap.get(p.id)?.stock ?? 0,
      minStock: p.minStock ?? 0,
      unit: p.unit,
    }))
    .filter((r) => r.stock <= r.minStock)
    .sort((a, b) => a.stock - b.stock);
}

