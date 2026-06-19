// =============================================================================
// Report routes — read-only analytical endpoints.
// =============================================================================

import { Router } from "express";
import { asyncHandler } from "../lib/http.js";
import { requireRole } from "../lib/auth.js";
import {
  getCustomerReceivableList,
  getCustomerStatement,
  getDashboardStats,
  getExpenseReport,
  getGelirGiderDateBounds,
  getGelirGiderReport,
  getIncomeExpenseReport,
  getIncomeStatement,
  getLowStockReport,
  getProductReport,
  getReceivableAging,
  getStockLedger,
  getStockReport,
  getSupplierDebtList,
  getSupplierStatement,
  getVatDeclaration,
} from "../lib/reports.js";
import {
  getAbcAnalysis,
  getCashFlowProjection,
  getCostCenterReport,
  getCustomerProfitability,
  getDeadStock,
  getSalesRepPerformance,
} from "../lib/analytics.js";

export const reportsRouter = Router();

// Dashboard headline is available to any authenticated role.
reportsRouter.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const raw = req.query.months ? Number(req.query.months) : 6;
    const months = [3, 6, 9, 12].includes(raw) ? raw : 6;
    res.json(await getDashboardStats(months));
  }),
);

// Stock is also visible to the warehouse manager (spec D); it must be declared
// before the admin-only blanket guard below.
reportsRouter.get(
  "/reports/stock",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (_req, res) => res.json(await getStockReport())),
);

// Stock ledger + low-stock warning are also warehouse-visible (declared before
// the admin-only blanket guard).
reportsRouter.get(
  "/reports/low-stock",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (_req, res) => res.json(await getLowStockReport())),
);

reportsRouter.get(
  "/reports/stock-ledger",
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  asyncHandler(async (req, res) => {
    const name = typeof req.query.name === "string" ? req.query.name : "";
    res.json(await getStockLedger(name));
  }),
);

// Every other financial report is admin-only.
reportsRouter.use("/reports", requireRole("ADMIN"));

reportsRouter.get(
  "/reports/aging",
  asyncHandler(async (_req, res) => res.json(await getReceivableAging())),
);

reportsRouter.get(
  "/reports/vat",
  asyncHandler(async (req, res) => {
    const bounds = await getGelirGiderDateBounds();
    const fallback = bounds ? new Date(bounds.max) : new Date();
    const month = req.query.month ? Number(req.query.month) : fallback.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : fallback.getFullYear();
    res.json(await getVatDeclaration(month, year));
  }),
);

reportsRouter.get(
  "/reports/income-statement",
  asyncHandler(async (req, res) => {
    const bounds = await getGelirGiderDateBounds();
    const fallbackStart = bounds ? new Date(bounds.min) : new Date(new Date().getFullYear(), 0, 1);
    const fallbackEnd = bounds ? new Date(bounds.max) : new Date();
    const start = req.query.start ? new Date(String(req.query.start)) : fallbackStart;
    const end = req.query.end ? new Date(String(req.query.end)) : fallbackEnd;
    res.json(await getIncomeStatement(start, end));
  }),
);

// --- Aşama 2 advanced analytics (admin-only, via the blanket guard above) ---
reportsRouter.get(
  "/reports/abc",
  asyncHandler(async (_req, res) => res.json(await getAbcAnalysis())),
);

reportsRouter.get(
  "/reports/dead-stock",
  asyncHandler(async (req, res) => {
    const days = req.query.days ? Number(req.query.days) : 90;
    res.json(await getDeadStock(days));
  }),
);

reportsRouter.get(
  "/reports/customer-profitability",
  asyncHandler(async (_req, res) => res.json(await getCustomerProfitability())),
);

reportsRouter.get(
  "/reports/sales-rep-performance",
  asyncHandler(async (req, res) => {
    const start = req.query.start ? new Date(String(req.query.start)) : undefined;
    const end = req.query.end ? new Date(String(req.query.end)) : undefined;
    res.json(await getSalesRepPerformance(start, end));
  }),
);

reportsRouter.get(
  "/reports/cost-center",
  asyncHandler(async (req, res) => {
    const start = req.query.start ? new Date(String(req.query.start)) : new Date(new Date().getFullYear(), 0, 1);
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();
    res.json(await getCostCenterReport(start, end));
  }),
);

reportsRouter.get(
  "/reports/cash-flow-projection",
  asyncHandler(async (req, res) => {
    const months = req.query.months ? Number(req.query.months) : 6;
    res.json(await getCashFlowProjection(months));
  }),
);

reportsRouter.get(
  "/reports/supplier-debt",
  asyncHandler(async (_req, res) => res.json(await getSupplierDebtList())),
);

reportsRouter.get(
  "/reports/customer-receivable",
  asyncHandler(async (_req, res) => res.json(await getCustomerReceivableList())),
);

reportsRouter.get(
  "/reports/expenses",
  asyncHandler(async (req, res) => {
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    res.json(await getExpenseReport(month, year));
  }),
);

reportsRouter.get(
  "/reports/gelir-gider/bounds",
  asyncHandler(async (_req, res) => {
    res.json(await getGelirGiderDateBounds());
  }),
);

reportsRouter.get(
  "/reports/gelir-gider",
  asyncHandler(async (req, res) => {
    const bounds = await getGelirGiderDateBounds();
    const fallbackStart = bounds ? new Date(bounds.min) : new Date(new Date().getFullYear(), 0, 1);
    const fallbackEnd = bounds ? new Date(bounds.max) : new Date();
    const start = req.query.start ? new Date(String(req.query.start)) : fallbackStart;
    const end = req.query.end ? new Date(String(req.query.end)) : fallbackEnd;
    res.json(await getGelirGiderReport(start, end));
  }),
);

reportsRouter.get(
  "/reports/income-expense",
  asyncHandler(async (req, res) => {
    const start = req.query.start ? new Date(String(req.query.start)) : new Date(new Date().getFullYear(), 0, 1);
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();
    res.json(await getIncomeExpenseReport(start, end));
  }),
);

reportsRouter.get(
  "/reports/customer",
  asyncHandler(async (req, res) => {
    const name = typeof req.query.name === "string" ? req.query.name : "";
    res.json(await getCustomerStatement(name));
  }),
);

reportsRouter.get(
  "/reports/supplier",
  asyncHandler(async (req, res) => {
    const name = typeof req.query.name === "string" ? req.query.name : "";
    res.json(await getSupplierStatement(name));
  }),
);

reportsRouter.get(
  "/reports/product",
  asyncHandler(async (req, res) => {
    const name = typeof req.query.name === "string" ? req.query.name : undefined;
    res.json(await getProductReport(name));
  }),
);
