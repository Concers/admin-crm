import { ayAdi } from "@/lib/calculations";
import { parseFaturaNoFromNotes } from "@/lib/gider-columns";
import { formatCurrency, formatCalendarDate, calendarMonth, calendarYear } from "@/lib/utils";
import type { Expense } from "@/lib/api";

function formatAyYil(ay: number | null | undefined, yil: number | null | undefined) {
  if (!ay && !yil) return "-";
  const ayStr = ay ? ayAdi(ay) : "-";
  return yil ? `${ayStr} ${yil}` : ayStr;
}

function formatKategori(scope: Expense["scope"]) {
  if (scope === "PRODUCT") return "Ürün Gideri";
  return "Genel Gider";
}

export function mapGiderRows(giderler: Expense[]) {
  return giderler.map((g) => {
    const ay =
      g.excelMonthLabel?.trim() ||
      (g.startMonth ? ayAdi(g.startMonth) : ayAdi(calendarMonth(g.date)));
    const yil = g.startYear != null ? String(g.startYear) : String(calendarYear(g.date));

    return {
      id: g.id,
      gun: formatCalendarDate(g.date),
      ay,
      yil,
      giderKategori: formatKategori(g.scope),
      giderTuru: g.category || "-",
      periyotAy: g.durationMonths != null ? String(g.durationMonths) : "-",
      urunAdi: g.product?.name ?? "-",
      tedarikciAdi: g.partner?.name ?? "-",
      toplamTutar: formatCurrency(g.totalAmount),
      pesinOdenen: formatCurrency(g.paidAmount),
      faturaNo: g.invoiceNo?.trim() || parseFaturaNoFromNotes(g.notes),
      notlar: g.notes ?? "",
      aylikGiderPayi: g.monthlyShare != null ? formatCurrency(g.monthlyShare) : "-",
      baslangicAy: g.startMonth != null ? String(g.startMonth) : "-",
      baslangicYil: g.startYear != null ? String(g.startYear) : "-",
      bitisAy: g.endMonth != null ? String(g.endMonth) : "-",
      bitisYil: g.endYear != null ? String(g.endYear) : "-",
      baslangicDonem: formatAyYil(g.startMonth, g.startYear),
      bitisDonem: formatAyYil(g.endMonth, g.endYear),
      baslangicTarihi: g.startDate ? formatCalendarDate(g.startDate) : formatCalendarDate(g.date),
      bitisTarihi: g.endDate ? formatCalendarDate(g.endDate) : "-",
      _date: g.date,
      _scope: g.scope,
      _category: g.category ?? "",
      _productName: g.product?.name ?? "",
      _partnerName: g.partner?.name ?? "",
      _totalAmount: g.totalAmount,
      _paidAmount: g.paidAmount,
      _monthlyShare: g.monthlyShare ?? 0,
      _durationMonths: g.durationMonths ?? null,
      _notes: g.notes ?? "",
      _invoiceNo: g.invoiceNo?.trim() || parseFaturaNoFromNotes(g.notes),
    };
  });
}

export type GiderTableRow = ReturnType<typeof mapGiderRows>[number];
