import type { ReactNode } from "react";
import {
  Calendar,
  FileText,
  Package,
  Receipt,
  StickyNote,
  Truck,
} from "lucide-react";
import { GIDER_TABLE_COLUMNS } from "@/lib/gider-columns";
import { ayIndeksi, isUrunGideri } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { GiderTableRow } from "@/app/gider-girisi/gider-rows";

export const GIDER_MONEY_KEYS = new Set(["toplamTutar", "pesinOdenen", "aylikGiderPayi"]);

export const GIDER_SORT_VALUE: Partial<
  Record<string, (row: GiderTableRow) => string | number>
> = {
  gun: (r) => r._date,
  ay: (r) => Number(r.baslangicAy) || ayIndeksi(r.ay),
  yil: (r) => Number(r.yil) || Number(r.baslangicYil) || 0,
  periyotAy: (r) => Number(r.periyotAy) || 0,
  toplamTutar: (r) => r._totalAmount,
  pesinOdenen: (r) => r._paidAmount,
  aylikGiderPayi: (r) => r._monthlyShare,
  baslangicAy: (r) => Number(r.baslangicAy) || 0,
  baslangicYil: (r) => Number(r.baslangicYil) || 0,
  bitisAy: (r) => Number(r.bitisAy) || 0,
  bitisYil: (r) => Number(r.bitisYil) || 0,
  baslangicTarihi: (r) => r.baslangicTarihi,
  bitisTarihi: (r) => r.bitisTarihi,
};

function dash(value: string) {
  return !value || value === "-" ? (
    <span className="text-sm text-[var(--muted-foreground)]">—</span>
  ) : null;
}

function KategoriBadge({ kategori }: { kategori: string }) {
  const urun = isUrunGideri(kategori);
  const Icon = urun ? Package : Receipt;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1",
        urun
          ? "bg-rose-50 text-rose-700 ring-rose-100"
          : "bg-amber-50 text-amber-800 ring-amber-100"
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {urun ? "Ürün" : "Genel"}
    </span>
  );
}

function PeriodChip({ ay, yil }: { ay: string; yil: string }) {
  if ((!ay || ay === "-") && (!yil || yil === "-")) {
    return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-medium tabular-nums text-[var(--foreground)] ring-1 ring-[var(--border)]">
      <Calendar className="h-3 w-3 text-[var(--muted-foreground)]" />
      {ay !== "-" ? ay : ""}
      {yil !== "-" ? ` ${yil}` : ""}
    </span>
  );
}

export const giderCellRenderers: Record<string, (row: GiderTableRow) => ReactNode> = {
  gun: (row) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{row.gun}</span>
  ),
  ay: (row) =>
    row.ay && row.ay !== "-" ? (
      <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
        {row.ay}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  yil: (row) => (
    <span className="text-sm font-medium tabular-nums text-[var(--muted-foreground)]">
      {row.yil}
    </span>
  ),
  giderKategori: (row) => <KategoriBadge kategori={row.giderKategori} />,
  giderTuru: (row) => (
    <span className="block max-w-[12rem] truncate font-medium" title={row.giderTuru}>
      {row.giderTuru}
    </span>
  ),
  periyotAy: (row) =>
    row.periyotAy && row.periyotAy !== "-" ? (
      <span className="inline-flex min-w-[2rem] justify-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium tabular-nums text-indigo-700 ring-1 ring-indigo-100">
        {row.periyotAy} ay
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  urunAdi: (row) => {
    const empty = dash(row.urunAdi);
    if (empty) return empty;
    return (
      <div className="flex min-w-0 max-w-[10rem] items-center gap-1.5">
        <Package className="h-3.5 w-3.5 shrink-0 text-rose-500" />
        <span className="truncate text-sm">{row.urunAdi}</span>
      </div>
    );
  },
  tedarikciAdi: (row) => {
    const empty = dash(row.tedarikciAdi);
    if (empty) return empty;
    return (
      <span className="inline-flex max-w-[10rem] items-center gap-1.5 truncate text-sm">
        <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {row.tedarikciAdi}
      </span>
    );
  },
  faturaNo: (row) =>
    row.faturaNo ? (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 ring-1 ring-slate-200">
        <FileText className="h-3 w-3 shrink-0 text-slate-500" />
        {row.faturaNo}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  toplamTutar: (row) => (
    <span className="font-semibold tabular-nums text-rose-700">{row.toplamTutar}</span>
  ),
  pesinOdenen: (row) => (
    <span
      className={cn(
        "tabular-nums text-sm",
        row._paidAmount > 0 ? "font-semibold text-amber-700" : "text-[var(--muted-foreground)]"
      )}
    >
      {row.pesinOdenen}
    </span>
  ),
  notlar: (row) =>
    row.notlar ? (
      <span
        className="inline-flex max-w-[180px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={row.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {row.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  aylikGiderPayi: (row) =>
    row._monthlyShare > 0 ? (
      <span className="font-medium tabular-nums text-indigo-700">{row.aylikGiderPayi}</span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  baslangicAy: (row) => <PeriodChip ay={row.baslangicAy} yil="-" />,
  baslangicYil: (row) => (
    <span className="text-sm tabular-nums text-[var(--muted-foreground)]">
      {row.baslangicYil !== "-" ? row.baslangicYil : "—"}
    </span>
  ),
  bitisAy: (row) => <PeriodChip ay={row.bitisAy} yil="-" />,
  bitisYil: (row) => (
    <span className="text-sm tabular-nums text-[var(--muted-foreground)]">
      {row.bitisYil !== "-" ? row.bitisYil : "—"}
    </span>
  ),
  baslangicTarihi: (row) => (
    <span className="whitespace-nowrap text-sm tabular-nums">{row.baslangicTarihi}</span>
  ),
  bitisTarihi: (row) =>
    row.bitisTarihi && row.bitisTarihi !== "-" ? (
      <span className="whitespace-nowrap text-sm tabular-nums">{row.bitisTarihi}</span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
};

export function giderFilterValue(key: string, row: GiderTableRow): string {
  switch (key) {
    case "giderKategori":
      return row.giderKategori;
    case "giderTuru":
      return row.giderTuru;
    case "urunAdi":
      return row.urunAdi;
    case "tedarikciAdi":
      return row.tedarikciAdi;
    case "faturaNo":
      return row.faturaNo || "";
    case "ay":
      return row.ay;
    case "yil":
      return row.yil;
    default:
      return String((row as Record<string, unknown>)[key] ?? "");
  }
}

export function buildGiderDataColumns() {
  return GIDER_TABLE_COLUMNS.map((col) => {
    const render =
      col.key in giderCellRenderers
        ? giderCellRenderers[col.key as keyof typeof giderCellRenderers]
        : undefined;
    const isMoney = GIDER_MONEY_KEYS.has(col.key);
    return {
      key: col.key,
      label: col.label,
      sortValue: GIDER_SORT_VALUE[col.key],
      align: isMoney ? ("right" as const) : undefined,
      // Para kolonları: tek-değer dropdown yerine min–max aralık filtresi.
      ...(isMoney ? { filterType: "number" as const } : {}),
      ...(render
        ? {
            render,
            filterValue: (row: GiderTableRow) => giderFilterValue(col.key, row),
          }
        : {}),
    };
  });
}

export const GIDER_SEARCH_KEYS = [
  "giderTuru",
  "urunAdi",
  "tedarikciAdi",
  "faturaNo",
  "notlar",
  "ay",
  "giderKategori",
  "gun",
] as const;

export const GIDER_AMOUNT_FILTER = {
  defaultField: "pesin",
  fields: [
    { id: "pesin", label: "Peşin Ödenen", getValue: (r: GiderTableRow) => r._paidAmount },
    { id: "toplam", label: "Toplam Tutar", getValue: (r: GiderTableRow) => r._totalAmount },
    { id: "aylik", label: "Aylık Pay", getValue: (r: GiderTableRow) => r._monthlyShare },
  ],
};
