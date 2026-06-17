// =============================================================================
// Cost & profitability engine (maliyet & kârlılık motoru)
//
// Pure, side-effect-free helpers that replicate the Excel formulas. Used by both
// the one-off data migration and the live API so a sale entered today is costed
// exactly like a historical one.
// =============================================================================

export const MONTH_NAMES_TR = [
  "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
  "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK",
] as const;

/** 1-based month number → Turkish month name (as used in the workbook). */
export function monthNameTr(month: number): string {
  return MONTH_NAMES_TR[month - 1] ?? "";
}

/** Parse a spreadsheet/string/Date value into a Date, or null when invalid. */
export function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Coerce a spreadsheet cell into a finite number, falling back when blank/NaN. */
export function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

// -----------------------------------------------------------------------------
// Purchase totals
// -----------------------------------------------------------------------------

export interface PurchaseInput {
  unitPrice: number;
  quantity: number;
  vatRate: number;
}

export function calcPurchaseTotals(input: PurchaseInput) {
  const totalAmount = input.unitPrice * input.quantity;
  const vatIncludedAmount = totalAmount * (1 + input.vatRate);
  return { totalAmount, vatIncludedAmount };
}

// -----------------------------------------------------------------------------
// Expense amortisation (amortisman / tahakkuk)
// -----------------------------------------------------------------------------

export interface AmortisationInput {
  date: Date;
  /** Number of months the cost is spread across (gider periyodu). */
  durationMonths?: number | null;
  /** Amount actually paid up-front (peşin ödenen tutar). */
  paidAmount: number;
}

/**
 * Spread an expense evenly across its period and compute the start/end window,
 * matching the workbook's "AYLIK GİDER PAYI / BAŞLANGIÇ / BİTİŞ" columns.
 */
export function calcAmortisation(input: AmortisationInput) {
  const startMonth = input.date.getMonth() + 1;
  const startYear = input.date.getFullYear();
  const duration = input.durationMonths && input.durationMonths > 0 ? input.durationMonths : 1;
  const monthlyShare = input.paidAmount / duration;

  let endMonth = startMonth + duration - 1;
  let endYear = startYear;
  while (endMonth > 12) {
    endMonth -= 12;
    endYear += 1;
  }

  const startDate = new Date(startYear, startMonth - 1, 1);
  const endDate = new Date(endYear, endMonth, 0); // last day of the end month

  return { durationMonths: duration, monthlyShare, startMonth, startYear, endMonth, endYear, startDate, endDate };
}

// -----------------------------------------------------------------------------
// Sale costing & profitability
// -----------------------------------------------------------------------------

export interface SaleCostInput {
  unitPrice: number; // birim satış fiyatı
  quantity: number; // satış adeti
  vatRate: number;
  purchaseUnitCost?: number; // alım birim maliyeti
  productionUnitCost?: number; // üretim birim maliyeti
  overheadUnitCost?: number; // genel gider payı
}

export function calcSaleCosting(input: SaleCostInput) {
  const totalAmount = input.unitPrice * input.quantity;
  const vatIncludedAmount = totalAmount * (1 + input.vatRate);

  const totalUnitCost =
    (input.purchaseUnitCost ?? 0) + (input.productionUnitCost ?? 0) + (input.overheadUnitCost ?? 0);

  // Profit margin (%) relative to cost — matches the Excel "KAR %" column.
  const profitMargin =
    totalUnitCost > 0 && input.unitPrice > 0
      ? ((input.unitPrice - totalUnitCost) / totalUnitCost) * 100
      : null;

  return { totalAmount, vatIncludedAmount, totalUnitCost, profitMargin };
}

/**
 * Weighted-average purchase unit cost for a product across its purchase history
 * (Σ totalAmount / Σ quantity). Falls back to a simple average of unit prices
 * when quantities are missing, and 0 when there is no purchase history.
 */
export function weightedAveragePurchaseCost(
  purchases: { unitPrice: number; quantity: number }[],
): number {
  if (purchases.length === 0) return 0;
  const totalQty = purchases.reduce((sum, p) => sum + p.quantity, 0);
  if (totalQty > 0) {
    const totalCost = purchases.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
    return totalCost / totalQty;
  }
  return purchases.reduce((sum, p) => sum + p.unitPrice, 0) / purchases.length;
}
