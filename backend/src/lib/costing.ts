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

/**
 * Current stock level for a product:
 *   Σ purchased − Σ sold + net explicit stock movements (adjustments/waste).
 * Used by the negative-stock guard on sale entry and the stock report.
 */
export async function getProductStock(prisma: PrismaClient, productId: number): Promise<number> {
  const [purchased, sold, movements] = await Promise.all([
    prisma.purchase.aggregate({ where: { productId }, _sum: { quantity: true } }),
    prisma.sale.aggregate({ where: { productId }, _sum: { quantity: true } }),
    prisma.stockMovement.findMany({ where: { productId }, select: { type: true, quantity: true } }),
  ]);

  let adjustment = 0;
  for (const m of movements) {
    if (m.type === "IN") adjustment += m.quantity;
    else if (m.type === "OUT" || m.type === "WASTE") adjustment -= m.quantity;
    else if (m.type === "ADJUSTMENT") adjustment += m.quantity; // signed
    // TRANSFER nets to zero at the global (non-per-warehouse) level.
  }

  return (purchased._sum.quantity ?? 0) - (sold._sum.quantity ?? 0) + adjustment;
}
