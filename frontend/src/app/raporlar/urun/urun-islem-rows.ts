import type { Expense, Purchase, Sale } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mapGiderRows } from "@/app/gider-girisi/gider-rows";
import type { AlimRow } from "@/app/urun-alim/alim-rows";
import { mapSatisRows } from "@/app/urun-satis/satis-rows";

export function buildUrunSatisRows(sales: Sale[]) {
  return mapSatisRows(sales);
}

export function buildUrunAlimRows(purchases: Purchase[]): AlimRow[] {
  return purchases.map((a) => ({
    id: a.id,
    tarih: formatDate(a.date),
    urunAdi: a.product?.name ?? "—",
    tedarikci: a.supplier?.name || "—",
    raf: a.shelfLocation ?? "",
    birimAlimFiyati: formatCurrency(a.unitPrice),
    alimAdeti: a.quantity,
    toplamTutar: formatCurrency(a.totalAmount),
    kdvDahilTutar: formatCurrency(a.vatIncludedAmount),
    pesinOdenen: a.paidAmount ? formatCurrency(a.paidAmount) : "—",
    _date: a.date,
    _productName: a.product?.name ?? "",
    _supplierName: a.supplier?.name ?? "",
    _quantity: a.quantity,
    _unitPrice: a.unitPrice,
    _vatRate: a.vatRate,
    _paidAmount: a.paidAmount,
    _totalAmount: a.totalAmount,
    _vatIncludedAmount: a.vatIncludedAmount,
    _shelfLocation: a.shelfLocation ?? "",
    _notes: a.notes ?? "",
  }));
}

export function buildUrunGiderRows(expenses: Expense[]) {
  return mapGiderRows(expenses);
}
