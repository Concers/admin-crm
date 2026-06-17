// =============================================================================
// Backend API client
//
// The frontend owns no database. Every read/write goes through the backend ERP
// REST API via these typed helpers. Used from Server Components and Server
// Actions (server-to-server fetch), so requests are always uncached/fresh.
// =============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

type Json = Record<string, unknown>;

/** Attach the session token (httpOnly cookie) as a Bearer header. */
async function authHeaders(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get("token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  // An expired/invalid session (e.g. after a JWT_SECRET change) → send the user
  // to login instead of crashing the page with a raw fetch error.
  if (res.status === 401) redirect("/login?expired=1");
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiSend<T>(method: "POST" | "PUT" | "DELETE", path: string, body?: Json): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(await authHeaders()),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Oturum süresi doldu. Lütfen yeniden giriş yapın.");
  if (!res.ok) {
    // Surface the backend's human-readable message (e.g. stock errors) so the
    // UI can show something meaningful instead of a bare status code.
    let message = `${method} ${path} failed: ${res.status}`;
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      if (err.message || err.error) message = err.message ?? err.error!;
    } catch {
      /* non-JSON body */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

// --- Shared types ------------------------------------------------------------
export type PartnerType = "CUSTOMER" | "SUPPLIER" | "SERVICE_PROVIDER" | "OWNER" | "OTHER";
export type ExpenseScope = "GENERAL" | "PRODUCT";
export type CashFlowType = "PAYMENT" | "COLLECTION";

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface Product {
  id: number;
  name: string;
  category?: string | null;
  shelfLocation?: string | null;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  scope: ExpenseScope;
}

export interface Sale {
  id: number;
  date: string;
  unitPrice: number;
  quantity: number;
  vatRate: number;
  totalAmount: number;
  vatIncludedAmount: number;
  paidAmount: number;
  purchaseUnitCost: number | null;
  productionUnitCost: number | null;
  overheadUnitCost: number | null;
  totalUnitCost: number | null;
  profitMargin: number | null;
  notes: string | null;
  product: Product;
  customer: Partner;
}

export interface Purchase {
  id: number;
  date: string;
  unitPrice: number;
  quantity: number;
  vatRate: number;
  totalAmount: number;
  vatIncludedAmount: number;
  paidAmount: number;
  shelfLocation: string | null;
  notes: string | null;
  product: Product;
  supplier: Partner;
}

export interface Expense {
  id: number;
  date: string;
  scope: ExpenseScope;
  category: string;
  totalAmount: number;
  paidAmount: number;
  durationMonths: number | null;
  monthlyShare: number | null;
  notes: string | null;
  product?: Product | null;
  partner?: Partner | null;
}

export interface CashFlow {
  id: number;
  date: string;
  type: CashFlowType;
  amount: number;
  notes: string | null;
  partner: Partner;
}

export interface ProductDevelopment {
  id: number;
  productName: string;
  startDate: string | null;
  supplierName: string | null;
  orderQuantity: number | null;
  productClass: string | null;
  notes: string | null;
}

// --- Master data -------------------------------------------------------------
export const getPartners = (type?: PartnerType) =>
  apiGet<Partner[]>(`/partners${type ? `?type=${type}` : ""}`);
export const createPartner = (body: Json) => apiSend<Partner>("POST", "/partners", body);
export const updatePartner = (id: number, body: Json) => apiSend<Partner>("PUT", `/partners/${id}`, body);
export const deletePartner = (id: number) => apiSend("DELETE", `/partners/${id}`);

export const getProducts = () => apiGet<Product[]>("/products");
export const createProduct = (body: Json) => apiSend<Product>("POST", "/products", body);
export const updateProduct = (id: number, body: Json) => apiSend<Product>("PUT", `/products/${id}`, body);
export const deleteProduct = (id: number) => apiSend("DELETE", `/products/${id}`);

export const getExpenseCategories = (scope?: ExpenseScope) =>
  apiGet<ExpenseCategory[]>(`/expense-categories${scope ? `?scope=${scope}` : ""}`);
export const createExpenseCategory = (body: Json) => apiSend<ExpenseCategory>("POST", "/expense-categories", body);
export const updateExpenseCategory = (id: number, body: Json) => apiSend<ExpenseCategory>("PUT", `/expense-categories/${id}`, body);
export const deleteExpenseCategory = (id: number) => apiSend("DELETE", `/expense-categories/${id}`);

export const getProductDevelopments = () => apiGet<ProductDevelopment[]>("/product-developments");

// --- Transactions ------------------------------------------------------------
export const getSales = () => apiGet<Sale[]>("/sales");
export const createSale = (body: Json) => apiSend<Sale>("POST", "/sales", body);
export const deleteSale = (id: number) => apiSend("DELETE", `/sales/${id}`);

export const getPurchases = () => apiGet<Purchase[]>("/purchases");
export const createPurchase = (body: Json) => apiSend<Purchase>("POST", "/purchases", body);
export const deletePurchase = (id: number) => apiSend("DELETE", `/purchases/${id}`);

export const createExpense = (body: Json) => apiSend<Expense>("POST", "/expenses", body);
export const deleteExpense = (id: number) => apiSend("DELETE", `/expenses/${id}`);

export const getCashFlows = (type?: CashFlowType) =>
  apiGet<CashFlow[]>(`/cashflows${type ? `?type=${type}` : ""}`);
export const createCashFlow = (body: Json) => apiSend<CashFlow>("POST", "/cashflows", body);

// --- Reports -----------------------------------------------------------------
export interface DashboardStats {
  totalExpense: number;
  totalPurchase: number;
  totalSale: number;
  partnerCount: number;
  productCount: number;
  recentSales: Sale[];
  recentExpenses: Expense[];
}
export const getDashboard = () => apiGet<DashboardStats>("/dashboard");

export interface StockRow { product: string; purchased: number; sold: number; stock: number }
export const getStockReport = () => apiGet<StockRow[]>("/reports/stock");

/** Unified current-account balance per partner (net across customer & supplier roles). */
export interface PartnerBalance {
  name: string;
  salesTotal: number;
  collected: number;
  receivable: number;
  purchaseTotal: number;
  paidToThem: number;
  payable: number;
  net: number; // >0 net receivable (alacak), <0 net payable (borç)
}
export const getSupplierDebtList = () =>
  apiGet<(PartnerBalance & { debt: number })[]>("/reports/supplier-debt");
export const getCustomerReceivableList = () => apiGet<PartnerBalance[]>("/reports/customer-receivable");

export const getExpenseReport = (month?: number, year?: number) => {
  const qs = new URLSearchParams();
  if (month) qs.set("month", String(month));
  if (year) qs.set("year", String(year));
  return apiGet<Expense[]>(`/reports/expenses${qs.toString() ? `?${qs}` : ""}`);
};

export interface IncomeExpenseReport { income: number; expense: number; profit: number; sales: Sale[]; expenses: Expense[] }
export const getIncomeExpenseReport = (start?: string, end?: string) => {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  return apiGet<IncomeExpenseReport>(`/reports/income-expense${qs.toString() ? `?${qs}` : ""}`);
};

export interface CustomerStatement {
  sales: Sale[];
  collections: CashFlow[];
  saleTotal: number;
  vatIncludedTotal: number;
  collected: number;
  receivable: number;
}
export const getCustomerStatement = (name: string) =>
  apiGet<CustomerStatement>(`/reports/customer?name=${encodeURIComponent(name)}`);

export interface SupplierStatement {
  purchases: Purchase[];
  payments: CashFlow[];
  purchaseTotal: number;
  upfront: number;
  paid: number;
  debt: number;
}
export const getSupplierStatement = (name: string) =>
  apiGet<SupplierStatement>(`/reports/supplier?name=${encodeURIComponent(name)}`);

export interface ProductReport { sales: Sale[]; purchases: Purchase[]; saleAmount: number; purchaseAmount: number; profit: number }
export const getProductReport = (name?: string) =>
  apiGet<ProductReport>(`/reports/product${name ? `?name=${encodeURIComponent(name)}` : ""}`);

// =============================================================================
// Phase 1-4 build-out endpoints (reports, admin, inventory, documents).
// =============================================================================

// --- Auth extras -------------------------------------------------------------
export const changePassword = (currentPassword: string, newPassword: string) =>
  apiSend("POST", "/auth/change-password", { currentPassword, newPassword });

// --- New reports -------------------------------------------------------------
export interface AgingRow { name: string; d0_30: number; d31_60: number; d61_90: number; d90plus: number; total: number }
export const getAgingReport = () => apiGet<AgingRow[]>("/reports/aging");

export interface VatDeclaration { outputVat: number; inputVat: number; payableVat: number; period: { month: number | null; year: number } }
export const getVatDeclaration = (month?: number, year?: number) => {
  const qs = new URLSearchParams();
  if (month) qs.set("month", String(month));
  if (year) qs.set("year", String(year));
  return apiGet<VatDeclaration>(`/reports/vat${qs.toString() ? `?${qs}` : ""}`);
};

export interface IncomeStatement { revenue: number; cogs: number; grossProfit: number; operatingExpenses: number; netProfit: number }
export const getIncomeStatement = (start?: string, end?: string) => {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  return apiGet<IncomeStatement>(`/reports/income-statement${qs.toString() ? `?${qs}` : ""}`);
};

export interface LowStockRow { product: string; stock: number; minStock: number; unit: string }
export const getLowStockReport = () => apiGet<LowStockRow[]>("/reports/low-stock");

export interface StockLedgerEntry { date: string; type: string; in: number; out: number; reason: string | null; balance: number }
export interface StockLedger { product: string; movements: StockLedgerEntry[]; balance: number }
export const getStockLedger = (name: string) => apiGet<StockLedger>(`/reports/stock-ledger?name=${encodeURIComponent(name)}`);

// --- Users & audit -----------------------------------------------------------
export interface AppUser { id: number; name: string; email: string; role: "ADMIN" | "SALES_REP" | "WAREHOUSE_MANAGER"; isActive: boolean; createdAt: string }
export const getUsers = () => apiGet<AppUser[]>("/users");
export const createUser = (body: Json) => apiSend("POST", "/users", body);
export const updateUser = (id: number, body: Json) => apiSend("PUT", `/users/${id}`, body);
export const deleteUser = (id: number) => apiSend("DELETE", `/users/${id}`);

export interface AuditLog { id: number; action: string; entityName: string; entityId: number | null; details: string | null; createdAt: string; user: { name: string; email: string; role: string } | null }
export const getAuditLogs = (limit = 100) => apiGet<AuditLog[]>(`/audit-logs?limit=${limit}`);

// --- Accounts & warehouses ---------------------------------------------------
export interface Account { id: number; name: string; type: "CASH" | "BANK"; currency: string; openingBalance: number }
export interface AccountBalance { id: number; name: string; type: string; balance: number }
export const getAccounts = () => apiGet<Account[]>("/accounts");
export const getAccountBalances = () => apiGet<AccountBalance[]>("/accounts/balances");
export const createAccount = (body: Json) => apiSend("POST", "/accounts", body);
export const deleteAccount = (id: number) => apiSend("DELETE", `/accounts/${id}`);

export interface Warehouse { id: number; name: string; location: string | null }
export const getWarehouses = () => apiGet<Warehouse[]>("/warehouses");
export const createWarehouse = (body: Json) => apiSend("POST", "/warehouses", body);
export const deleteWarehouse = (id: number) => apiSend("DELETE", `/warehouses/${id}`);

// --- Stock movements ---------------------------------------------------------
export interface StockMovement { id: number; date: string; type: string; quantity: number; reason: string | null; product: Product; warehouse: Warehouse | null }
export const getStockMovements = () => apiGet<StockMovement[]>("/stock-movements");
export const createStockMovement = (body: Json) => apiSend("POST", "/stock-movements", body);

// --- Documents: orders / quotes / invoices (line-item) -----------------------
export interface DocLine { id?: number; productId: number; quantity: number; unitPrice: number; vatRate?: number; lineTotal?: number }
export interface OrderDoc { id: number; docType: "SALES" | "PURCHASE"; partnerId: number; date: string; status: string; totalAmount: number; vatIncludedAmount: number; notes: string | null; lines: DocLine[] }
export const getOrders = () => apiGet<OrderDoc[]>("/orders");
export const createOrder = (body: Json) => apiSend("POST", "/orders", body);
export const updateOrder = (id: number, body: Json) => apiSend("PUT", `/orders/${id}`, body);
export const deleteOrder = (id: number) => apiSend("DELETE", `/orders/${id}`);

export interface QuoteDoc { id: number; partnerId: number; date: string; validUntil: string | null; status: string; totalAmount: number; vatIncludedAmount: number; notes: string | null; lines: DocLine[] }
export const getQuotes = () => apiGet<QuoteDoc[]>("/quotes");
export const createQuote = (body: Json) => apiSend("POST", "/quotes", body);
export const deleteQuote = (id: number) => apiSend("DELETE", `/quotes/${id}`);

export interface InvoiceDoc { id: number; docType: "SALES" | "PURCHASE"; partnerId: number; number: string | null; date: string; dueDate: string | null; status: string; totalAmount: number; vatIncludedAmount: number; notes: string | null; lines: DocLine[] }
export const getInvoices = () => apiGet<InvoiceDoc[]>("/invoices");
export const createInvoice = (body: Json) => apiSend("POST", "/invoices", body);
export const deleteInvoice = (id: number) => apiSend("DELETE", `/invoices/${id}`);

// --- Documents: simple ones --------------------------------------------------
export const getReturns = () => apiGet<Record<string, unknown>[]>("/returns");
export const createReturn = (body: Json) => apiSend("POST", "/returns", body);
export const getBoms = () => apiGet<Record<string, unknown>[]>("/boms");
export const createBom = (body: Json) => apiSend("POST", "/boms", body);
export const getProductionOrders = () => apiGet<Record<string, unknown>[]>("/production-orders");
export const createProductionOrder = (body: Json) => apiSend("POST", "/production-orders", body);
export const getPriceLists = () => apiGet<Record<string, unknown>[]>("/price-lists");
export const createPriceList = (body: Json) => apiSend("POST", "/price-lists", body);
export const getDiscounts = () => apiGet<Record<string, unknown>[]>("/discounts");
export const createDiscount = (body: Json) => apiSend("POST", "/discounts", body);

// =============================================================================
// Aşama 2 advanced analytics
// =============================================================================
export interface AbcRow { product: string; revenue: number; quantity: number; revenuePct: number; cumulativePct: number; class: "A" | "B" | "C" }
export const getAbcAnalysis = () => apiGet<AbcRow[]>("/reports/abc");

export interface DeadStockRow { product: string; unit: string; stock: number; lastSale: string | null; idleDays: number | null; value: number }
export const getDeadStock = (days = 90) => apiGet<DeadStockRow[]>(`/reports/dead-stock?days=${days}`);

export interface CustomerProfitRow { customer: string; revenue: number; cost: number; profit: number; marginPct: number }
export const getCustomerProfitability = () => apiGet<CustomerProfitRow[]>("/reports/customer-profitability");

export interface CostCenterRow { category: string; current: number; previous: number; changePct: number }
export const getCostCenter = (start?: string, end?: string) => {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  return apiGet<CostCenterRow[]>(`/reports/cost-center${qs.toString() ? `?${qs}` : ""}`);
};

export interface CashFlowRow { key: string; label: string; inflow: number; outflow: number; net: number; cumulative: number }
export const getCashFlowProjection = (months = 6) => apiGet<CashFlowRow[]>(`/reports/cash-flow-projection?months=${months}`);

// --- Transaction updates (edit forms) ----------------------------------------
export const updateSale = (id: number, body: Json) => apiSend<Sale>("PUT", `/sales/${id}`, body);
export const updatePurchase = (id: number, body: Json) => apiSend<Purchase>("PUT", `/purchases/${id}`, body);
export const updateExpense = (id: number, body: Json) => apiSend<Expense>("PUT", `/expenses/${id}`, body);
export const updateCashFlow = (id: number, body: Json) => apiSend<CashFlow>("PUT", `/cashflows/${id}`, body);

// --- Reconciliation (kısmi ödeme / fatura mutabakatı) ------------------------
export interface ReconInvoice { id: number; docType: "SALES" | "PURCHASE"; number: string | null; date: string; dueDate: string | null; status: string; total: number; allocated: number; balance: number }
export interface ReconCashFlow { id: number; type: CashFlowType; date: string; amount: number; allocated: number; unallocated: number; notes: string | null }
export interface ReconAllocation { id: number; invoiceId: number; cashFlowId: number; amount: number }
export interface Reconciliation { invoices: ReconInvoice[]; cashFlows: ReconCashFlow[]; allocations: ReconAllocation[] }
export const getReconciliation = (partnerId: number) => apiGet<Reconciliation>(`/reconciliation?partnerId=${partnerId}`);
export const allocatePayment = (body: Json) => apiSend("POST", "/reconciliation/allocate", body);
export const deleteAllocation = (id: number) => apiSend("DELETE", `/reconciliation/allocate/${id}`);

export interface ReconSummaryRow { name: string; invoiced: number; allocated: number; open: number }
export const getReconciliationSummary = () => apiGet<ReconSummaryRow[]>("/reconciliation/summary");
