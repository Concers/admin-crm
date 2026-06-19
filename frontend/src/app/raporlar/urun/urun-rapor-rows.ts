import type { Expense, Product, ProductReport, Purchase, Sale } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";
import { formatQty } from "../stok/stok-rows";
export type UrunListeRow = {
  ad: string;
  raf: string;
  satis: string;
  alim: string;
  digerMaliyet: string;
  kar: string;
  marj: string;
  satisAdet: string;
  _satis: number;
  _alim: number;
  _digerMaliyet: number;
  _kar: number;
  _marj: number;
  _satisQty: number;
};

export type UrunRaporTotals = {  saleAmount: number;
  purchaseAmount: number;
  expenseAmount: number;
  profit: number;
  marginPct: number;
  salesCount: number;
  purchaseCount: number;
  expenseCount: number;
  totalSaleQty: number;
  totalPurchaseQty: number;
  vatIncludedSales: number;
};

export type TrendDatum = { label: string; value: number };

function marginPct(profit: number, saleAmount: number) {
  if (saleAmount <= 0) return 0;
  return Math.round((profit / saleAmount) * 1000) / 10;
}

export function buildUrunRaporTotals(rapor: ProductReport): UrunRaporTotals {  const vatIncludedSales = rapor.sales.reduce((s, x) => s + x.vatIncludedAmount, 0);
  const totalSaleQty = rapor.sales.reduce((s, x) => s + x.quantity, 0);
  const totalPurchaseQty = rapor.purchases.reduce((s, x) => s + x.quantity, 0);

  return {
    saleAmount: rapor.saleAmount,
    purchaseAmount: rapor.purchaseAmount,
    expenseAmount: rapor.expenseAmount,
    profit: rapor.profit,
    marginPct: marginPct(rapor.profit, rapor.saleAmount),
    salesCount: rapor.sales.length,
    purchaseCount: rapor.purchases.length,
    expenseCount: rapor.expenses.length,
    totalSaleQty,
    totalPurchaseQty,
    vatIncludedSales,
  };
}

export function buildUrunListeRows(urunler: Product[], rapor: ProductReport): UrunListeRow[] {
  const saleMap = new Map<string, { amount: number; qty: number }>();
  const purchaseMap = new Map<string, { amount: number; qty: number }>();
  const expenseMap = new Map<string, number>();
  const byId = new Map(urunler.map((u) => [u.id, u.name]));

  function productKey(item: { product?: Product | null; productId?: number }) {
    return item.product?.name ?? (item.productId != null ? byId.get(item.productId) : undefined);
  }

  for (const s of rapor.sales) {
    const key = productKey(s as Sale & { productId?: number });
    if (!key) continue;
    const cur = saleMap.get(key) ?? { amount: 0, qty: 0 };
    saleMap.set(key, { amount: cur.amount + s.totalAmount, qty: cur.qty + s.quantity });
  }
  for (const p of rapor.purchases) {
    const key = productKey(p as Purchase & { productId?: number });
    if (!key) continue;
    const cur = purchaseMap.get(key) ?? { amount: 0, qty: 0 };
    purchaseMap.set(key, { amount: cur.amount + p.totalAmount, qty: cur.qty + p.quantity });
  }
  for (const e of rapor.expenses) {
    const key = productKey(e as Expense & { productId?: number });
    if (!key) continue;
    expenseMap.set(key, (expenseMap.get(key) ?? 0) + e.totalAmount);
  }

  return urunler.map((u) => {
    const satis = saleMap.get(u.name)?.amount ?? 0;
    const alim = purchaseMap.get(u.name)?.amount ?? 0;
    const digerMaliyet = expenseMap.get(u.name) ?? 0;
    const kar = satis - alim - digerMaliyet;
    const qty = saleMap.get(u.name)?.qty ?? 0;
    const marj = marginPct(kar, satis);
    return {
      ad: u.name,
      raf: u.shelfLocation?.trim() || "—",
      satis: formatCurrency(satis),
      alim: formatCurrency(alim),
      digerMaliyet: formatCurrency(digerMaliyet),
      kar: formatCurrency(kar),
      marj: satis > 0 ? `%${marj}` : "—",
      satisAdet: formatQty(qty),
      _satis: satis,
      _alim: alim,
      _digerMaliyet: digerMaliyet,
      _kar: kar,
      _marj: marj,
      _satisQty: qty,
    };
  });
}

export function buildAylikSatisTrend(sales: Sale[]): TrendDatum[] {  const aylikMap = new Map<string, number>();
  for (const s of sales) {
    const d = new Date(s.date);
    const ay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    aylikMap.set(ay, (aylikMap.get(ay) ?? 0) + s.vatIncludedAmount);
  }
  return [...aylikMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));
}
