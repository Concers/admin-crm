// =============================================================================
// Advanced analytics (Aşama 2): ABC, dead stock, customer profitability,
// cost-center distribution, cash-flow projection. Pure read queries over the
// existing data — no schema changes required.
// =============================================================================

import { prisma } from "./prisma.js";
import { weightedAveragePurchaseCost } from "./calculations.js";

/**
 * ABC analysis — rank products by revenue contribution and classify:
 *   A = products making up the first 80% of cumulative revenue,
 *   B = next 15% (up to 95%), C = the rest.
 */
export async function getAbcAnalysis() {
  const [products, sales] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true } }),
    prisma.sale.findMany({ select: { productId: true, totalAmount: true, quantity: true } }),
  ]);

  const byProduct = products.map((p) => {
    const rows = sales.filter((s) => s.productId === p.id);
    const revenue = rows.reduce((sum, s) => sum + s.totalAmount, 0);
    const quantity = rows.reduce((sum, s) => sum + s.quantity, 0);
    return { product: p.name, revenue, quantity };
  });

  const total = byProduct.reduce((sum, r) => sum + r.revenue, 0);
  const ranked = byProduct
    .filter((r) => r.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  let cumulative = 0;
  return ranked.map((r) => {
    cumulative += r.revenue;
    const cumulativePct = total > 0 ? (cumulative / total) * 100 : 0;
    const revenuePct = total > 0 ? (r.revenue / total) * 100 : 0;
    const cls = cumulativePct <= 80 ? "A" : cumulativePct <= 95 ? "B" : "C";
    return { ...r, revenuePct, cumulativePct, class: cls };
  });
}

/**
 * Dead-stock analysis — products holding stock but with no sale in the last
 * `days` days (default 90). Value = remaining stock × weighted-avg purchase cost.
 */
export async function getDeadStock(days = 90, asOf: Date = new Date()) {
  const [products, purchases, sales, movements] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, unit: true } }),
    prisma.purchase.findMany({ select: { productId: true, quantity: true, unitPrice: true } }),
    prisma.sale.findMany({ select: { productId: true, quantity: true, date: true } }),
    prisma.stockMovement.findMany({ select: { productId: true, type: true, quantity: true } }),
  ]);

  const cutoff = asOf.getTime() - days * 86_400_000;

  return products
    .map((p) => {
      const prc = purchases.filter((x) => x.productId === p.id);
      const sld = sales.filter((x) => x.productId === p.id);
      const purchased = prc.reduce((s, x) => s + x.quantity, 0);
      const sold = sld.reduce((s, x) => s + x.quantity, 0);
      const adj = movements
        .filter((m) => m.productId === p.id)
        .reduce((s, m) => s + (m.type === "IN" ? m.quantity : m.type === "ADJUSTMENT" ? m.quantity : -m.quantity), 0);
      const stock = purchased - sold + adj;

      const lastSale = sld.reduce<Date | null>((max, x) => {
        const d = new Date(x.date);
        return !max || d > max ? d : max;
      }, null);

      const idleDays = lastSale ? Math.floor((asOf.getTime() - lastSale.getTime()) / 86_400_000) : null;
      const value = stock * weightedAveragePurchaseCost(prc);
      return { product: p.name, unit: p.unit, stock, lastSale, idleDays, value };
    })
    .filter((r) => r.stock > 0 && (r.lastSale === null || r.lastSale.getTime() < cutoff))
    .sort((a, b) => b.value - a.value);
}

/** Customer profitability — revenue vs cost vs profit per customer. */
export async function getCustomerProfitability() {
  const [partners, sales] = await Promise.all([
    prisma.partner.findMany({ select: { id: true, name: true } }),
    prisma.sale.findMany({ select: { customerId: true, totalAmount: true, totalUnitCost: true, quantity: true } }),
  ]);

  return partners
    .map((p) => {
      const rows = sales.filter((s) => s.customerId === p.id);
      if (rows.length === 0) return null;
      const revenue = rows.reduce((sum, s) => sum + s.totalAmount, 0);
      const cost = rows.reduce((sum, s) => sum + (s.totalUnitCost ?? 0) * s.quantity, 0);
      const profit = revenue - cost;
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
      return { customer: p.name, revenue, cost, profit, marginPct };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.profit - a.profit);
}

/**
 * Sales-rep performance — revenue, cost, net profit and order count per rep,
 * over an optional date range. Sales are attributed via `salesRepId` (the user
 * who entered them); historical sales with no rep are grouped under "Atanmamış".
 */
export async function getSalesRepPerformance(start?: Date, end?: Date) {
  const dateFilter = start || end ? { date: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } } : {};
  const [users, sales] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
    prisma.sale.findMany({
      where: dateFilter,
      select: { salesRepId: true, totalAmount: true, vatIncludedAmount: true, totalUnitCost: true, quantity: true },
    }),
  ]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  const acc = new Map<number | "none", { rep: string; revenue: number; cost: number; profit: number; orders: number }>();
  for (const s of sales) {
    const key = s.salesRepId ?? "none";
    let row = acc.get(key);
    if (!row) {
      row = { rep: s.salesRepId ? nameById.get(s.salesRepId) ?? `#${s.salesRepId}` : "Atanmamış", revenue: 0, cost: 0, profit: 0, orders: 0 };
      acc.set(key, row);
    }
    row.revenue += s.totalAmount;
    row.cost += (s.totalUnitCost ?? 0) * s.quantity;
    row.orders += 1;
  }
  return [...acc.values()]
    .map((r) => ({ ...r, profit: r.revenue - r.cost, marginPct: r.revenue > 0 ? ((r.revenue - r.cost) / r.revenue) * 100 : 0 }))
    .sort((a, b) => b.profit - a.profit);
}

/**
 * Cost-center distribution — expenses grouped by category for a period, with a
 * comparison to the equal-length preceding period and a change %.
 */
export async function getCostCenterReport(start: Date, end: Date) {
  const spanMs = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - spanMs);
  const prevEnd = new Date(start.getTime());

  const [current, previous] = await Promise.all([
    prisma.expense.findMany({ where: { date: { gte: start, lte: end } }, select: { category: true, totalAmount: true } }),
    prisma.expense.findMany({ where: { date: { gte: prevStart, lt: prevEnd } }, select: { category: true, totalAmount: true } }),
  ]);

  const sumBy = (rows: { category: string; totalAmount: number }[]) => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.category, (map.get(r.category) ?? 0) + r.totalAmount);
    return map;
  };
  const cur = sumBy(current);
  const prev = sumBy(previous);
  const categories = new Set([...cur.keys(), ...prev.keys()]);

  return [...categories]
    .map((category) => {
      const current = cur.get(category) ?? 0;
      const previous = prev.get(category) ?? 0;
      const changePct = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
      return { category, current, previous, changePct };
    })
    .sort((a, b) => b.current - a.current);
}

/**
 * Cash-flow projection — expected inflows (unpaid sales) and outflows (unpaid
 * purchases + expenses) bucketed into the next `months` months by due date
 * (falling back to the document date when no due date is set).
 */
export async function getCashFlowProjection(months = 6, asOf: Date = new Date()) {
  const [sales, purchases, expenses] = await Promise.all([
    prisma.sale.findMany({ select: { date: true, dueDate: true, vatIncludedAmount: true, paidAmount: true } }),
    prisma.purchase.findMany({ select: { date: true, dueDate: true, vatIncludedAmount: true, paidAmount: true } }),
    prisma.expense.findMany({ select: { date: true, totalAmount: true, paidAmount: true } }),
  ]);

  // Build month buckets [{key:"YYYY-MM", inflow, outflow}] from asOf forward.
  const buckets: { key: string; label: string; inflow: number; outflow: number; net: number }[] = [];
  const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  for (let i = 0; i < months; i++) {
    const d = new Date(asOf.getFullYear(), asOf.getMonth() + i, 1);
    buckets.push({ key: keyOf(d), label: keyOf(d), inflow: 0, outflow: 0, net: 0 });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));

  const add = (when: Date, field: "inflow" | "outflow", amount: number) => {
    if (amount <= 0) return;
    const b = index.get(keyOf(when));
    if (b) b[field] += amount;
  };

  for (const s of sales) add(new Date(s.dueDate ?? s.date), "inflow", s.vatIncludedAmount - s.paidAmount);
  for (const p of purchases) add(new Date(p.dueDate ?? p.date), "outflow", p.vatIncludedAmount - p.paidAmount);
  for (const e of expenses) add(new Date(e.date), "outflow", e.totalAmount - e.paidAmount);

  let running = 0;
  return buckets.map((b) => {
    b.net = b.inflow - b.outflow;
    running += b.net;
    return { ...b, cumulative: running };
  });
}

/** Monthly budget targets vs actual sales and expenses for a calendar year. */
export async function getBudgetVarianceReport(year: number) {
  const [targets, sales, expenses] = await Promise.all([
    prisma.budgetTarget.findMany({ where: { year } }),
    prisma.sale.findMany({
      where: { date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59, 999) } },
      select: { date: true, totalAmount: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59, 999) } },
      select: { date: true, totalAmount: true, category: true },
    }),
  ]);

  const targetMap = (metric: string, month: number, category?: string | null) =>
    targets.find((t) => t.metric === metric && t.month === month && (t.category ?? null) === (category ?? null))?.amount ?? null;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthRows = months.map((month) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const inMonth = <T,>(rows: T[], getDate: (r: T) => Date) =>
      rows.filter((r) => {
        const t = getDate(r).getTime();
        return t >= start.getTime() && t <= end.getTime();
      });

    const salesActual = inMonth(sales, (s) => new Date(s.date)).reduce((sum, s) => sum + s.totalAmount, 0);
    const expenseActual = inMonth(expenses, (e) => new Date(e.date)).reduce((sum, e) => sum + e.totalAmount, 0);
    const salesTarget = targetMap("SALES_REVENUE", month);
    const expenseTarget = targetMap("EXPENSE_TOTAL", month);

    const categories = new Set([
      ...targets.filter((t) => t.metric === "EXPENSE_CATEGORY" && t.month === month).map((t) => t.category!),
      ...inMonth(expenses, (e) => new Date(e.date)).map((e) => e.category),
    ]);

    const categoryRows = [...categories].map((category) => {
      const actual = inMonth(expenses, (e) => new Date(e.date))
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.totalAmount, 0);
      const target = targetMap("EXPENSE_CATEGORY", month, category);
      return {
        category,
        target,
        actual,
        variance: target != null ? actual - target : null,
        variancePct: target != null && target > 0 ? ((actual - target) / target) * 100 : null,
      };
    });

    return {
      month,
      sales: {
        target: salesTarget,
        actual: salesActual,
        variance: salesTarget != null ? salesActual - salesTarget : null,
        variancePct: salesTarget != null && salesTarget > 0 ? ((salesActual - salesTarget) / salesTarget) * 100 : null,
      },
      expenses: {
        target: expenseTarget,
        actual: expenseActual,
        variance: expenseTarget != null ? expenseActual - expenseTarget : null,
        variancePct: expenseTarget != null && expenseTarget > 0 ? ((expenseActual - expenseTarget) / expenseTarget) * 100 : null,
      },
      categories: categoryRows.sort((a, b) => b.actual - a.actual),
    };
  });

  const totals = {
    salesTarget: monthRows.reduce((s, m) => s + (m.sales.target ?? 0), 0),
    salesActual: monthRows.reduce((s, m) => s + m.sales.actual, 0),
    expenseTarget: monthRows.reduce((s, m) => s + (m.expenses.target ?? 0), 0),
    expenseActual: monthRows.reduce((s, m) => s + m.expenses.actual, 0),
  };

  return {
    year,
    months: monthRows,
    totals: {
      ...totals,
      salesVariance: totals.salesActual - totals.salesTarget,
      expenseVariance: totals.expenseActual - totals.expenseTarget,
    },
  };
}

export interface FxRateMap {
  [code: string]: number;
}

/** FX exposure and revaluation on open balances (booking rate vs current rate). */
export async function getFxVarianceReport(start: Date, end: Date, currentRates: FxRateMap) {
  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
        OR: [{ currency: { not: "TRY" } }, { exchangeRate: { not: 1 } }],
      },
      include: { customer: { select: { name: true } }, product: { select: { name: true } } },
    }),
    prisma.purchase.findMany({
      where: {
        date: { gte: start, lte: end },
        OR: [{ currency: { not: "TRY" } }, { exchangeRate: { not: 1 } }],
      },
      include: { supplier: { select: { name: true } }, product: { select: { name: true } } },
    }),
  ]);

  type FxRow = {
    id: number;
    date: string;
    kind: "SALE" | "PURCHASE";
    partner: string;
    product: string;
    currency: string;
    exchangeRate: number;
    tryAmount: number;
    foreignAmount: number;
    unpaidTry: number;
    unpaidForeign: number;
    currentRate: number | null;
    revaluationTry: number | null;
  };

  const rows: FxRow[] = [];

  const pushRow = (
    kind: "SALE" | "PURCHASE",
    id: number,
    date: Date,
    partner: string,
    product: string,
    currency: string,
    exchangeRate: number,
    tryAmount: number,
    unpaidTry: number,
  ) => {
    const rate = exchangeRate > 0 ? exchangeRate : 1;
    const foreignAmount = tryAmount / rate;
    const unpaidForeign = unpaidTry / rate;
    const currentRate = currency === "TRY" ? 1 : currentRates[currency] ?? null;
    let revaluationTry: number | null = null;
    if (currentRate != null && unpaidForeign > 0 && currency !== "TRY") {
      const atCurrent = unpaidForeign * currentRate;
      revaluationTry = kind === "SALE" ? atCurrent - unpaidTry : unpaidTry - atCurrent;
    }
    rows.push({
      id,
      date: date.toISOString().slice(0, 10),
      kind,
      partner,
      product,
      currency,
      exchangeRate: rate,
      tryAmount,
      foreignAmount,
      unpaidTry,
      unpaidForeign,
      currentRate,
      revaluationTry,
    });
  };

  for (const s of sales) {
    pushRow(
      "SALE",
      s.id,
      new Date(s.date),
      s.customer.name,
      s.product.name,
      s.currency,
      s.exchangeRate,
      s.vatIncludedAmount,
      Math.max(0, s.vatIncludedAmount - s.paidAmount),
    );
  }
  for (const p of purchases) {
    pushRow(
      "PURCHASE",
      p.id,
      new Date(p.date),
      p.supplier.name,
      p.product.name,
      p.currency,
      p.exchangeRate,
      p.vatIncludedAmount,
      Math.max(0, p.vatIncludedAmount - p.paidAmount),
    );
  }

  rows.sort((a, b) => b.date.localeCompare(a.date));

  const byCurrency = new Map<string, { exposureTry: number; revaluationTry: number; count: number }>();
  for (const r of rows) {
    if (r.currency === "TRY") continue;
    const cur = byCurrency.get(r.currency) ?? { exposureTry: 0, revaluationTry: 0, count: 0 };
    cur.exposureTry += r.unpaidTry;
    cur.revaluationTry += r.revaluationTry ?? 0;
    cur.count += 1;
    byCurrency.set(r.currency, cur);
  }

  return {
    rows,
    summary: [...byCurrency.entries()].map(([currency, v]) => ({
      currency,
      ...v,
      currentRate: currentRates[currency] ?? null,
    })),
    totals: {
      openTry: rows.reduce((s, r) => s + r.unpaidTry, 0),
      revaluationTry: rows.reduce((s, r) => s + (r.revaluationTry ?? 0), 0),
    },
  };
}

/** Product cost revision log for reporting. */
export async function getProductCostHistoryReport(params: {
  productId?: number;
  start?: Date;
  end?: Date;
  limit?: number;
}) {
  const where: { productId?: number; recordedAt?: { gte?: Date; lte?: Date } } = {};
  if (params.productId) where.productId = params.productId;
  if (params.start || params.end) {
    where.recordedAt = {};
    if (params.start) where.recordedAt.gte = params.start;
    if (params.end) where.recordedAt.lte = params.end;
  }

  return prisma.productCostHistory.findMany({
    where,
    orderBy: { recordedAt: "desc" },
    take: params.limit ?? 500,
    include: { product: { select: { name: true } } },
  });
}
