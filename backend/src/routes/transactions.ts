// =============================================================================
// Transaction routes: sales, purchases, expenses, cash flows.
//
// Writes resolve partner/product by name (auto-creating when missing) and run
// the cost & amortisation engine so figures match the historical migration.
// Each entity supports list / detail / create / update / delete.
// =============================================================================

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId, resolvePartnerId, resolveProductId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import {
  calcAmortisation,
  calcPurchaseTotals,
  calcSaleCosting,
  parseDate,
  sortExpensesByExcelRow,
  toNumber,
} from "../lib/calculations.js";
import { computeSaleCosts, getProductStock } from "../lib/costing.js";
import { parseInvoiceNoFromNotes } from "../lib/expenseInvoice.js";
import { parseListQuery, dateRangeWhere, paginate } from "../lib/query.js";
import { assertPeriodOpen } from "../lib/periodLock.js";
import { recordProductCostSnapshot } from "../lib/costHistory.js";

/** Resolve a due date from an explicit dueDate or a payment-term in days. */
function resolveDueDate(body: Record<string, unknown>, date: Date): Date | null {
  const explicit = parseDate(body.dueDate);
  if (explicit) return explicit;
  const term = toNumber(body.termDays, 0);
  return term > 0 ? new Date(date.getTime() + term * 86400000) : null;
}

export const transactionsRouter = Router();

// -----------------------------------------------------------------------------
// Field-level RBAC: sales reps must not see cost/profit figures.
// -----------------------------------------------------------------------------
const SALE_COST_FIELDS = [
  "purchaseUnitCost",
  "productionUnitCost",
  "overheadUnitCost",
  "totalUnitCost",
  "profitMargin",
] as const;

function redactSale<T extends Record<string, unknown>>(sale: T, role?: string): T {
  if (role !== "SALES_REP") return sale;
  const copy = { ...sale };
  for (const f of SALE_COST_FIELDS) delete (copy as Record<string, unknown>)[f];
  return copy;
}

// =============================================================================
// Sales
// =============================================================================
transactionsRouter.get(
  "/sales",
  asyncHandler(async (req: AuthedRequest, res) => {
    const q = parseListQuery(req);
    const sales = await prisma.sale.findMany({
      where: {
        ...(dateRangeWhere(q) ? { date: dateRangeWhere(q) } : {}),
        ...(q.q
          ? { OR: [{ product: { name: { contains: q.q } } }, { customer: { name: { contains: q.q } } }] }
          : {}),
      },
      orderBy: { date: q.order },
      include: { product: true, customer: true },
    });
    res.json(paginate(sales, q, res).map((s) => redactSale(s, req.auth?.role)));
  }),
);

transactionsRouter.get(
  "/sales/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const sale = await prisma.sale.findUnique({ where: { id }, include: { product: true, customer: true } });
    if (!sale) return res.status(404).json({ error: "not_found" });
    res.json(redactSale(sale, req.auth?.role));
  }),
);

/** Resolve + cost a sale payload from a request body. Returns null on bad input. */
async function buildSaleData(body: Record<string, unknown>, saleId?: number) {
  const date = parseDate(body.date);
  const productName = String(body.productName ?? "").trim();
  const customerName = String(body.customerName ?? "").trim();
  const quantity = toNumber(body.quantity);
  if (!date || !productName || !customerName || quantity <= 0) return null;

  const productId = await resolveProductId(productName);
  const customerId = await resolvePartnerId(customerName, "CUSTOMER");
  if (productId === null || customerId === null) return null;

  const unitPrice = toNumber(body.unitPrice);
  const vatRate = toNumber(body.vatRate, 0.2);
  const totals = calcSaleCosting({ unitPrice, quantity, vatRate });
  const cost = await computeSaleCosts(prisma, { productId, date, quantity, unitPrice, saleId });

  return {
    date,
    productId,
    customerId,
    unitPrice,
    quantity,
    vatRate,
    totalAmount: totals.totalAmount,
    vatIncludedAmount: totals.vatIncludedAmount,
    paidAmount: toNumber(body.paidAmount),
    dueDate: resolveDueDate(body, date),
    shelfLocation: (body.shelfLocation as string) || null,
    notes: (body.notes as string) || null,
    currency: String(body.currency ?? "TRY").trim().toUpperCase() || "TRY",
    exchangeRate: toNumber(body.exchangeRate, 1),
    purchaseUnitCost: cost.purchaseUnitCost,
    productionUnitCost: cost.productionUnitCost,
    overheadUnitCost: cost.overheadUnitCost,
    totalUnitCost: cost.totalUnitCost,
    profitMargin: cost.profitMargin,
    periodMonth: date.getUTCMonth() + 1,
    periodYear: date.getUTCFullYear(),
  };
}

transactionsRouter.post(
  "/sales",
  requireRole("ADMIN", "SALES_REP"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = req.body ?? {};
    const productId = await resolveProductId(String(body.productName ?? "").trim());
    if (productId !== null) {
      // Stock-safety guard.
      const quantity = toNumber(body.quantity);
      const stock = await getProductStock(prisma, productId);
      if (quantity > stock && body.allowNegativeStock !== true) {
        return res.status(409).json({
          error: "insufficient_stock",
          message: `Yetersiz stok: mevcut ${stock}, satılmak istenen ${quantity}.`,
          available: stock,
          requested: quantity,
        });
      }
    }

    const data = await buildSaleData(body);
    if (!data) return res.status(400).json({ error: "date, productName, customerName and quantity are required" });
    if (!(await assertPeriodOpen(res, data.date))) return;

    // Attribute the sale to the entering rep for performance reporting.
    const sale = await prisma.sale.create({ data: { ...data, salesRepId: req.auth?.userId ?? null } });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Sale", entityId: sale.id });
    res.status(201).json(redactSale(sale, req.auth?.role));
  }),
);

transactionsRouter.put(
  "/sales/:id",
  requireRole("ADMIN", "SALES_REP"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });

    const body = req.body ?? {};
    const data = await buildSaleData(body, id);
    if (!data) return res.status(400).json({ error: "date, productName, customerName and quantity are required" });
    if (!(await assertPeriodOpen(res, existing.date, data.date))) return;

    // Stock guard, adding back this sale's own current quantity to availability
    // (the existing row already deducted it from current stock).
    if (body.allowNegativeStock !== true) {
      const stock = await getProductStock(prisma, data.productId);
      const availableExcludingThis = stock + existing.quantity;
      if (data.quantity > availableExcludingThis) {
        return res.status(409).json({
          error: "insufficient_stock",
          message: `Yetersiz stok: mevcut ${availableExcludingThis}, satılmak istenen ${data.quantity}.`,
          available: availableExcludingThis,
          requested: data.quantity,
        });
      }
    }

    const sale = await prisma.sale.update({ where: { id }, data });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Sale", entityId: id });
    res.json(redactSale(sale, req.auth?.role));
  }),
);

transactionsRouter.delete(
  "/sales/:id",
  requireRole("ADMIN", "SALES_REP"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    if (!(await assertPeriodOpen(res, existing.date))) return;
    await prisma.sale.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Sale", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// Purchases
// =============================================================================
transactionsRouter.get(
  "/purchases",
  asyncHandler(async (req, res) => {
    const q = parseListQuery(req);
    const purchases = await prisma.purchase.findMany({
      where: {
        ...(dateRangeWhere(q) ? { date: dateRangeWhere(q) } : {}),
        ...(q.q
          ? { OR: [{ product: { name: { contains: q.q } } }, { supplier: { name: { contains: q.q } } }] }
          : {}),
      },
      orderBy: { date: q.order },
      include: { product: true, supplier: true },
    });
    res.json(paginate(purchases, q, res));
  }),
);

transactionsRouter.get(
  "/purchases/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const purchase = await prisma.purchase.findUnique({ where: { id }, include: { product: true, supplier: true } });
    if (!purchase) return res.status(404).json({ error: "not_found" });
    res.json(purchase);
  }),
);

async function buildPurchaseData(body: Record<string, unknown>) {
  const date = parseDate(body.date);
  const productName = String(body.productName ?? "").trim();
  const quantity = toNumber(body.quantity);
  if (!date || !productName || quantity <= 0) return null;

  const productId = await resolveProductId(productName);
  const supplierId = await resolvePartnerId(String(body.supplierName ?? "").trim() || "TANIMSIZ TEDARİKÇİ", "SUPPLIER");
  if (productId === null || supplierId === null) return null;

  const unitPrice = toNumber(body.unitPrice);
  const vatRate = toNumber(body.vatRate, 0.2);
  const totals = calcPurchaseTotals({ unitPrice, quantity, vatRate });

  return {
    date,
    productId,
    supplierId,
    unitPrice,
    quantity,
    vatRate,
    totalAmount: totals.totalAmount,
    vatIncludedAmount: totals.vatIncludedAmount,
    paidAmount: toNumber(body.paidAmount),
    dueDate: resolveDueDate(body, date),
    shelfLocation: (body.shelfLocation as string) || null,
    notes: (body.notes as string) || null,
    currency: String(body.currency ?? "TRY").trim().toUpperCase() || "TRY",
    exchangeRate: toNumber(body.exchangeRate, 1),
  };
}

transactionsRouter.post(
  "/purchases",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = await buildPurchaseData(req.body ?? {});
    if (!data) return res.status(400).json({ error: "date, productName and quantity are required" });
    if (!(await assertPeriodOpen(res, data.date))) return;
    const purchase = await prisma.purchase.create({ data });
    await recordProductCostSnapshot(prisma, purchase.productId, "NEW_PURCHASE", {
      sourceEntity: "Purchase",
      sourceId: purchase.id,
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Purchase", entityId: purchase.id });
    res.status(201).json(purchase);
  }),
);

transactionsRouter.put(
  "/purchases/:id",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existingPurchase = await prisma.purchase.findUnique({ where: { id } });
    if (!existingPurchase) return res.status(404).json({ error: "not_found" });
    const data = await buildPurchaseData(req.body ?? {});
    if (!data) return res.status(400).json({ error: "date, productName and quantity are required" });
    if (!(await assertPeriodOpen(res, existingPurchase.date, data.date))) return;
    const purchase = await prisma.purchase.update({ where: { id }, data });
    await recordProductCostSnapshot(prisma, purchase.productId, "PURCHASE_UPDATE", {
      sourceEntity: "Purchase",
      sourceId: id,
    });
    if (existingPurchase.productId !== purchase.productId) {
      await recordProductCostSnapshot(prisma, existingPurchase.productId, "PURCHASE_UPDATE", {
        sourceEntity: "Purchase",
        sourceId: id,
        notes: "Ürün değişti — eski ürün maliyeti",
      });
    }
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Purchase", entityId: id });
    res.json(purchase);
  }),
);

transactionsRouter.delete(
  "/purchases/:id",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existingPurchase = await prisma.purchase.findUnique({ where: { id } });
    if (!existingPurchase) return res.status(404).json({ error: "not_found" });
    if (!(await assertPeriodOpen(res, existingPurchase.date))) return;
    await prisma.purchase.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Purchase", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// Expenses
// =============================================================================
transactionsRouter.get(
  "/expenses",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const rows = await prisma.expense.findMany({ include: { product: true, partner: true } });
    res.json(sortExpensesByExcelRow(rows));
  }),
);

transactionsRouter.get(
  "/expenses/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const expense = await prisma.expense.findUnique({ where: { id }, include: { product: true, partner: true } });
    if (!expense) return res.status(404).json({ error: "not_found" });
    res.json(expense);
  }),
);

async function buildExpenseData(body: Record<string, unknown>) {
  const date = parseDate(body.date);
  if (!date) return null;

  const scope = String(body.scope ?? "").toUpperCase().includes("PRODUCT") ? "PRODUCT" : "GENERAL";
  const productId = body.productName ? await resolveProductId(String(body.productName)) : null;
  const partnerId = body.partnerName ? await resolvePartnerId(String(body.partnerName), "SERVICE_PROVIDER") : null;

  const paidAmount = toNumber(body.paidAmount);
  const durationMonths = toNumber(body.durationMonths, 1) || 1;
  const amort = calcAmortisation({ date, durationMonths, paidAmount });

  return {
    date,
    scope: scope as "GENERAL" | "PRODUCT",
    category: String(body.category ?? "Diğer").trim() || "Diğer",
    productId,
    partnerId,
    totalAmount: toNumber(body.totalAmount),
    paidAmount,
    notes: (body.notes as string) || null,
    invoiceNo: String(body.invoiceNo ?? "").trim() || parseInvoiceNoFromNotes((body.notes as string) || null),
    durationMonths: amort.durationMonths,
    monthlyShare: amort.monthlyShare,
    startMonth: amort.startMonth,
    startYear: amort.startYear,
    endMonth: amort.endMonth,
    endYear: amort.endYear,
    startDate: amort.startDate,
    endDate: amort.endDate,
  };
}

transactionsRouter.post(
  "/expenses",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = await buildExpenseData(req.body ?? {});
    if (!data) return res.status(400).json({ error: "date is required" });
    if (!(await assertPeriodOpen(res, data.date))) return;
    const expense = await prisma.expense.create({ data });
    if (expense.scope === "PRODUCT" && expense.productId) {
      await recordProductCostSnapshot(prisma, expense.productId, "PRODUCT_EXPENSE", {
        sourceEntity: "Expense",
        sourceId: expense.id,
      });
    }
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "Expense", entityId: expense.id });
    res.status(201).json(expense);
  }),
);

transactionsRouter.put(
  "/expenses/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existingExpense = await prisma.expense.findUnique({ where: { id } });
    if (!existingExpense) return res.status(404).json({ error: "not_found" });
    const data = await buildExpenseData(req.body ?? {});
    if (!data) return res.status(400).json({ error: "date is required" });
    if (!(await assertPeriodOpen(res, existingExpense.date, data.date))) return;
    const expense = await prisma.expense.update({ where: { id }, data });
    if (expense.scope === "PRODUCT" && expense.productId) {
      await recordProductCostSnapshot(prisma, expense.productId, "PRODUCT_EXPENSE", {
        sourceEntity: "Expense",
        sourceId: id,
      });
    }
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "Expense", entityId: id });
    res.json(expense);
  }),
);

transactionsRouter.delete(
  "/expenses/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existingExpense = await prisma.expense.findUnique({ where: { id } });
    if (!existingExpense) return res.status(404).json({ error: "not_found" });
    if (!(await assertPeriodOpen(res, existingExpense.date))) return;
    await prisma.expense.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "Expense", entityId: id });
    res.status(204).end();
  }),
);

// =============================================================================
// Cash flows (payments to suppliers / collections from customers)
// =============================================================================
transactionsRouter.get(
  "/cashflows",
  asyncHandler(async (req, res) => {
    const type = req.query.type === "PAYMENT" || req.query.type === "COLLECTION" ? req.query.type : undefined;
    const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
    if (accountId !== undefined && !Number.isInteger(accountId)) {
      return res.status(400).json({ error: "invalid accountId" });
    }
    res.json(
      await prisma.cashFlow.findMany({
        where: {
          ...(type ? { type } : {}),
          ...(accountId !== undefined ? { accountId } : {}),
        },
        orderBy: { date: "desc" },
        include: { partner: true, account: true },
      }),
    );
  }),
);

transactionsRouter.get(
  "/cashflows/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const cashFlow = await prisma.cashFlow.findUnique({ where: { id }, include: { partner: true } });
    if (!cashFlow) return res.status(404).json({ error: "not_found" });
    res.json(cashFlow);
  }),
);

async function buildCashFlowData(body: Record<string, unknown>) {
  const date = parseDate(body.date);
  const partnerName = String(body.partnerName ?? "").trim();
  const amount = toNumber(body.amount);
  const type = body.type === "PAYMENT" || body.type === "COLLECTION" ? body.type : null;
  if (!date || !partnerName || amount <= 0 || !type) return null;

  const partnerId = await resolvePartnerId(partnerName, type === "PAYMENT" ? "SUPPLIER" : "CUSTOMER");
  if (partnerId === null) return null;
  const accountId = body.accountId != null && body.accountId !== "" ? Number(body.accountId) : null;
  return {
    date,
    partnerId,
    type: type as "PAYMENT" | "COLLECTION",
    amount,
    accountId: accountId && Number.isInteger(accountId) ? accountId : null,
    notes: (body.notes as string) || null,
  };
}

transactionsRouter.post(
  "/cashflows",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = await buildCashFlowData(req.body ?? {});
    if (!data) return res.status(400).json({ error: "date, partnerName, amount and type (PAYMENT|COLLECTION) are required" });
    if (!(await assertPeriodOpen(res, data.date))) return;
    const cashFlow = await prisma.cashFlow.create({ data });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "CashFlow", entityId: cashFlow.id });
    res.status(201).json(cashFlow);
  }),
);

transactionsRouter.put(
  "/cashflows/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existingFlow = await prisma.cashFlow.findUnique({ where: { id } });
    if (!existingFlow) return res.status(404).json({ error: "not_found" });
    const data = await buildCashFlowData(req.body ?? {});
    if (!data) return res.status(400).json({ error: "date, partnerName, amount and type (PAYMENT|COLLECTION) are required" });
    if (!(await assertPeriodOpen(res, existingFlow.date, data.date))) return;
    const cashFlow = await prisma.cashFlow.update({ where: { id }, data });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "CashFlow", entityId: id });
    res.json(cashFlow);
  }),
);

transactionsRouter.delete(
  "/cashflows/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existingFlow = await prisma.cashFlow.findUnique({ where: { id } });
    if (!existingFlow) return res.status(404).json({ error: "not_found" });
    if (!(await assertPeriodOpen(res, existingFlow.date))) return;
    await prisma.cashFlow.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "CashFlow", entityId: id });
    res.status(204).end();
  }),
);
