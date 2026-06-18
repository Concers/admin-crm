// =============================================================================
// Live sale costing engine (maliyet & kârlılık motoru)
//
// Faithfully replicates the original Excel formulas for a sale's unit cost so a
// sale entered today is costed like the historical ones:
//
//   purchaseUnitCost  (M)  weighted-average of the product's purchase history
//                          (the workbook used a fragile shelf-code XLOOKUP; a
//                          weighted average is the robust modern equivalent)
//   productionUnitCost(N)  Σ product-specific expenses (ÜRÜN_GİDERLERİ for this
//                          product) ÷ total quantity ever sold of the product
//   overheadUnitCost  (O)  Σ monthly share of general overheads active on the
//                          sale date ÷ total quantity sold in that month
//   totalUnitCost     (P)  = M + N + O
//   profitMargin      (Q)  = (unitPrice − P) / P × 100
// =============================================================================

import type { PrismaClient } from "@prisma/client";
import { weightedAveragePurchaseCost } from "./calculations.js";

export interface SaleCostBreakdown {
  purchaseUnitCost: number;
  productionUnitCost: number;
  overheadUnitCost: number;
  totalUnitCost: number;
  profitMargin: number | null;
}

/**
 * Compute the full unit-cost breakdown for a (prospective) sale of `quantity`
 * units of `productId` on `date`, priced at `unitPrice`. Aggregates reflect
 * current database state plus the sale being entered, mirroring the live
 * recalculation the spreadsheet performed.
 */
export async function computeSaleCosts(
  prisma: PrismaClient,
  params: { productId: number; date: Date; quantity: number; unitPrice: number },
): Promise<SaleCostBreakdown> {
  const { productId, date, quantity, unitPrice } = params;
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const [purchases, productExpenses, productSalesQty, overheadExpenses, monthSalesQty] =
    await Promise.all([
      // M — purchase history for weighted-average cost.
      prisma.purchase.findMany({ where: { productId }, select: { unitPrice: true, quantity: true } }),
      // N numerator — product-specific expenses for this product.
      prisma.expense.aggregate({
        where: { scope: "PRODUCT", productId },
        _sum: { totalAmount: true },
      }),
      // N denominator — total quantity ever sold of this product.
      prisma.sale.aggregate({ where: { productId }, _sum: { quantity: true } }),
      // O numerator — monthly share of general overheads active on the sale date.
      prisma.expense.aggregate({
        where: { scope: "GENERAL", startDate: { lte: date }, endDate: { gte: date } },
        _sum: { monthlyShare: true },
      }),
      // O denominator — total quantity sold in the sale's month/year.
      prisma.sale.aggregate({
        where: { periodMonth: month, periodYear: year },
        _sum: { quantity: true },
      }),
    ]);

  const purchaseUnitCost = weightedAveragePurchaseCost(purchases);

  // Include the sale being entered in the denominators (the workbook recomputed
  // over the full sheet, so the new row participates in its own allocation).
  const totalProductQty = (productSalesQty._sum.quantity ?? 0) + quantity;
  const productionUnitCost =
    totalProductQty > 0 ? (productExpenses._sum.totalAmount ?? 0) / totalProductQty : 0;

  const totalMonthQty = (monthSalesQty._sum.quantity ?? 0) + quantity;
  const overheadUnitCost =
    totalMonthQty > 0 ? (overheadExpenses._sum.monthlyShare ?? 0) / totalMonthQty : 0;

  const totalUnitCost = purchaseUnitCost + productionUnitCost + overheadUnitCost;
  const profitMargin =
    totalUnitCost > 0 && unitPrice > 0 ? ((unitPrice - totalUnitCost) / totalUnitCost) * 100 : null;

  return { purchaseUnitCost, productionUnitCost, overheadUnitCost, totalUnitCost, profitMargin };
}

/** Per-product stock, broken down by the source of each effect. */
export interface StockBreakdown {
  purchased: number; // Σ purchases
  sold: number; // Σ sales
  movements: number; // net manual stock movements (IN/OUT/WASTE/ADJUSTMENT)
  returns: number; // + sales returns, − purchase returns
  production: number; // + finished goods produced, − components consumed (DONE orders)
  stock: number; // net of all of the above
}

function emptyBreakdown(): StockBreakdown {
  return { purchased: 0, sold: 0, movements: 0, returns: 0, production: 0, stock: 0 };
}

/**
 * Single source of truth for product stock. Integrates every effect that moves
 * inventory so the sale guard, the stock report and the low-stock report all
 * agree:
 *   + purchases            − sales
 *   ± manual stock movements (IN/ADJUSTMENT +, OUT/WASTE −, TRANSFER nets to 0)
 *   + sales returns        − purchase returns
 *   + finished goods of DONE production orders
 *   − components those DONE orders consumed (resolved through their BOM)
 *
 * Returns a map keyed by productId so callers can render the whole catalogue in
 * a single pass; {@link getProductStock} reads one entry from it.
 */
export async function getStockBreakdownMap(
  prisma: PrismaClient,
): Promise<Map<number, StockBreakdown>> {
  const [purchases, sales, movements, returns, doneOrders] = await Promise.all([
    prisma.purchase.findMany({ select: { productId: true, quantity: true } }),
    prisma.sale.findMany({ select: { productId: true, quantity: true } }),
    prisma.stockMovement.findMany({ select: { productId: true, type: true, quantity: true } }),
    prisma.return.findMany({ select: { productId: true, type: true, quantity: true } }),
    prisma.productionOrder.findMany({
      where: { status: "DONE" },
      select: { productId: true, quantity: true, bomId: true },
    }),
  ]);

  // Resolve the components of every DONE order's BOM in one query.
  const bomIds = [...new Set(doneOrders.map((o) => o.bomId).filter((x): x is number => x != null))];
  const components = bomIds.length
    ? await prisma.bomComponent.findMany({
        where: { bomId: { in: bomIds } },
        select: { bomId: true, componentProductId: true, quantity: true },
      })
    : [];
  const compsByBom = new Map<number, { componentProductId: number; quantity: number }[]>();
  for (const c of components) {
    const arr = compsByBom.get(c.bomId) ?? [];
    arr.push({ componentProductId: c.componentProductId, quantity: c.quantity });
    compsByBom.set(c.bomId, arr);
  }

  const map = new Map<number, StockBreakdown>();
  const row = (pid: number): StockBreakdown => {
    let r = map.get(pid);
    if (!r) {
      r = emptyBreakdown();
      map.set(pid, r);
    }
    return r;
  };

  for (const p of purchases) row(p.productId).purchased += p.quantity;
  for (const s of sales) row(s.productId).sold += s.quantity;
  for (const m of movements) {
    const r = row(m.productId);
    if (m.type === "IN" || m.type === "ADJUSTMENT") r.movements += m.quantity; // ADJUSTMENT is signed
    else if (m.type === "OUT" || m.type === "WASTE") r.movements -= m.quantity;
    // TRANSFER nets to zero at the global (non-per-warehouse) level.
  }
  for (const ret of returns) {
    row(ret.productId).returns += ret.type === "SALES_RETURN" ? ret.quantity : -ret.quantity;
  }
  for (const o of doneOrders) {
    row(o.productId).production += o.quantity; // finished good produced
    if (o.bomId != null) {
      for (const c of compsByBom.get(o.bomId) ?? []) {
        row(c.componentProductId).production -= o.quantity * c.quantity; // component consumed
      }
    }
  }

  for (const r of map.values()) {
    r.stock = r.purchased - r.sold + r.movements + r.returns + r.production;
  }
  return map;
}

/**
 * Current stock level for a single product, integrating all effects.
 * Used by the negative-stock guard on sale entry.
 */
export async function getProductStock(prisma: PrismaClient, productId: number): Promise<number> {
  const map = await getStockBreakdownMap(prisma);
  return map.get(productId)?.stock ?? 0;
}
