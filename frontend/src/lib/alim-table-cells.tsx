import type { ReactNode } from "react";
import { LayoutGrid, Package, Truck } from "lucide-react";
import { ALIM_TABLE_COLUMNS, ALIM_PRIMARY_FILTER_KEYS } from "@/lib/alim-columns";
import { calendarYear } from "@/lib/dates";
import { cn, formatCurrency } from "@/lib/utils";
import type { AlimRow } from "@/app/urun-alim/alim-rows";

const AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function tarihKisa(date: string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = AYLAR_KISA[d.getMonth()] ?? "";
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export const ALIM_MONEY_KEYS = new Set([
  "birimAlimFiyati",
  "toplamTutar",
  "kdvDahilTutar",
  "pesinOdenen",
]);

export const ALIM_SORT_VALUE: Partial<Record<string, (row: AlimRow) => string | number>> = {
  tarih: (r) => new Date(r._date).getTime(),
  yil: (r) => calendarYear(r._date),
  urunAdi: (r) => r.urunAdi.toLowerCase(),
  tedarikci: (r) => r.tedarikci.toLowerCase(),
  raf: (r) => r.raf.toLowerCase(),
  birimAlimFiyati: (r) => r._unitPrice,
  alimAdeti: (r) => r._quantity,
  toplamTutar: (r) => r._totalAmount,
  kdvDahilTutar: (r) => r._vatIncludedAmount,
  pesinOdenen: (r) => r._paidAmount,
};

export function alimFilterValue(key: string, row: AlimRow): string {
  switch (key) {
    case "yil":
      return String(calendarYear(row._date));
    case "urunAdi":
      return row.urunAdi;
    case "tedarikci":
      return row.tedarikci;
    case "raf":
      return row.raf;
    default:
      return String((row as Record<string, unknown>)[key] ?? "");
  }
}

const alimCellRenderers: Record<string, (row: AlimRow) => ReactNode> = {
  tarih: (row) => (
    <span className="whitespace-nowrap font-medium tabular-nums">{tarihKisa(row._date)}</span>
  ),
  urunAdi: (row) => (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25">
        <Package className="h-3.5 w-3.5" />
      </span>
      <span className="max-w-[16rem] truncate font-medium" title={row.urunAdi}>
        {row.urunAdi}
      </span>
    </div>
  ),
  tedarikci: (row) =>
    row.tedarikci && row.tedarikci !== "—" ? (
      <span className="inline-flex max-w-[12rem] items-center gap-1.5 truncate" title={row.tedarikci}>
        <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {row.tedarikci}
      </span>
    ) : (
      <span className="text-[var(--muted-foreground)]">—</span>
    ),
  raf: (row) =>
    row.raf ? (
      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/25">
        <LayoutGrid className="h-3 w-3" />
        {row.raf}
      </span>
    ) : (
      <span className="text-[var(--muted-foreground)]">—</span>
    ),
  birimAlimFiyati: (row) => (
    <span className="tabular-nums text-[var(--muted-foreground)]">{row.birimAlimFiyati}</span>
  ),
  alimAdeti: (row) => <span className="font-medium tabular-nums">{row.alimAdeti}</span>,
  toplamTutar: (row) => (
    <span className="font-semibold tabular-nums text-emerald-300">{row.toplamTutar}</span>
  ),
  kdvDahilTutar: (row) => <span className="tabular-nums">{row.kdvDahilTutar}</span>,
  pesinOdenen: (row) => (
    <span
      className={cn(
        "tabular-nums",
        row._paidAmount > 0 ? "font-medium text-amber-300" : "text-[var(--muted-foreground)]"
      )}
    >
      {row.pesinOdenen}
    </span>
  ),
};

export function buildAlimDataColumns() {
  return ALIM_TABLE_COLUMNS.map((col) => {
    const render = alimCellRenderers[col.key];
    const isMoney = ALIM_MONEY_KEYS.has(col.key);
    return {
      key: col.key,
      label: col.label,
      sortValue: ALIM_SORT_VALUE[col.key],
      align: isMoney || col.key === "alimAdeti" ? ("right" as const) : undefined,
      ...(isMoney ? { filterType: "number" as const } : {}),
      ...(render
        ? {
            render,
            filterValue: (row: AlimRow) => alimFilterValue(col.key, row),
          }
        : {}),
    };
  });
}

/** Görünür olmayan ama filtre için kullanılan yıl sütunu. */
export function alimYearColumn() {
  return {
    key: "yil",
    label: "Yıl",
    hidden: true as const,
    filterable: true as const,
    sortValue: ALIM_SORT_VALUE.yil,
    filterValue: (row: AlimRow) => alimFilterValue("yil", row),
  };
}

export { ALIM_PRIMARY_FILTER_KEYS };
export const ALIM_SEARCH_KEYS = ["urunAdi", "tedarikci", "raf", "_notes"] as const;

export const ALIM_AMOUNT_FILTER = {
  defaultField: "toplam",
  fields: [
    { id: "toplam", label: "Toplam Tutar", getValue: (r: AlimRow) => r._totalAmount },
    { id: "kdv", label: "KDV Dahil", getValue: (r: AlimRow) => r._vatIncludedAmount },
    { id: "pesin", label: "Peşin Ödenen", getValue: (r: AlimRow) => r._paidAmount },
    { id: "birim", label: "Birim Fiyat", getValue: (r: AlimRow) => r._unitPrice },
    { id: "adet", label: "Adet", getValue: (r: AlimRow) => r._quantity },
  ],
};
