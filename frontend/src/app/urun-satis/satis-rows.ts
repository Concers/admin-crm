import type { Sale } from "@/lib/api";
import { ayAdi } from "@/lib/calculations";
import { formatKdvOrani } from "@/lib/satis-columns";
import { formatCurrency, formatCalendarDate, calendarMonth, calendarYear } from "@/lib/utils";

function fmtCost(value: number | null | undefined) {
  if (value == null || value === 0) return "—";
  return formatCurrency(value);
}

export function mapSatisRows(satislar: Sale[]) {
  return satislar.map((s) => {
    const month = s.periodMonth ?? calendarMonth(s.date);
    const year = s.periodYear ?? calendarYear(s.date);

    return {
      id: s.id,
      gun: formatCalendarDate(s.date),
      ay: ayAdi(month),
      yil: String(year),
      urunAdi: s.product.name,
      musteri: s.customer.name || "—",
      birimSatisFiyati: formatCurrency(s.unitPrice),
      satisAdeti: s.quantity,
      toplamTutar: formatCurrency(s.totalAmount),
      kdvOrani: formatKdvOrani(s.vatRate),
      kdvDahilTutar: formatCurrency(s.vatIncludedAmount),
      pesinOdenen: s.paidAmount ? formatCurrency(s.paidAmount) : "—",
      raf: s.shelfLocation?.trim() || "",
      notlar: s.notes ?? "",
      alimBirimMaliyeti: fmtCost(s.purchaseUnitCost),
      uretimBirimMaliyeti: fmtCost(s.productionUnitCost),
      genelGiderMaliyeti: fmtCost(s.overheadUnitCost),
      toplamBirimMaliyeti: fmtCost(s.totalUnitCost),
      karYuzdesi: s.profitMargin != null ? `%${s.profitMargin.toFixed(1)}` : "—",
      _date: s.date,
      _productName: s.product.name,
      _customerName: s.customer.name,
      _quantity: s.quantity,
      _unitPrice: s.unitPrice,
      _vatRate: s.vatRate,
      _paidAmount: s.paidAmount,
      _totalAmount: s.totalAmount,
      _vatIncludedAmount: s.vatIncludedAmount,
      _purchaseUnitCost: s.purchaseUnitCost ?? 0,
      _productionUnitCost: s.productionUnitCost ?? 0,
      _overheadUnitCost: s.overheadUnitCost ?? 0,
      _totalUnitCost: s.totalUnitCost ?? 0,
      _profitMargin: s.profitMargin ?? null,
      _year: year,
      _month: month,
      _shelfLocation: s.shelfLocation ?? "",
      _notes: s.notes ?? "",
    };
  });
}

export type SatisTableRow = ReturnType<typeof mapSatisRows>[number];
