import type { ReactNode } from "react";
import {
  LayoutGrid,
  Package,
  StickyNote,
  Users,
} from "lucide-react";
import { SATIS_TABLE_COLUMNS } from "@/lib/satis-columns";
import { ayIndeksi } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { SatisTableRow } from "@/app/urun-satis/satis-rows";

export const SATIS_MONEY_KEYS = new Set([
  "birimSatisFiyati",
  "toplamTutar",
  "kdvDahilTutar",
  "pesinOdenen",
  "alimBirimMaliyeti",
  "uretimBirimMaliyeti",
  "genelGiderMaliyeti",
  "toplamBirimMaliyeti",
]);

export const SATIS_SORT_VALUE: Partial<
  Record<string, (row: SatisTableRow) => string | number>
> = {
  gun: (r) => r._date,
  ay: (r) => r._month || ayIndeksi(r.ay),
  yil: (r) => r._year,
  birimSatisFiyati: (r) => r._unitPrice,
  satisAdeti: (r) => r._quantity,
  toplamTutar: (r) => r._totalAmount,
  kdvOrani: (r) => r._vatRate,
  kdvDahilTutar: (r) => r._vatIncludedAmount,
  pesinOdenen: (r) => r._paidAmount,
  alimBirimMaliyeti: (r) => r._purchaseUnitCost,
  uretimBirimMaliyeti: (r) => r._productionUnitCost,
  genelGiderMaliyeti: (r) => r._overheadUnitCost,
  toplamBirimMaliyeti: (r) => r._totalUnitCost,
  karYuzdesi: (r) => r._profitMargin ?? -999,
};

function KarBadge({ margin }: { margin: number | null }) {
  if (margin == null) {
    return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  }
  const positive = margin >= 0;
  return (
    <span
      className={cn(
        "inline-flex min-w-[3rem] justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ring-1",
        positive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-rose-50 text-rose-700 ring-rose-100"
      )}
    >
      %{margin.toFixed(1)}
    </span>
  );
}

export const satisCellRenderers: Record<string, (row: SatisTableRow) => ReactNode> = {
  gun: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.gun}</span>
  ),
  ay: (r) => (
    <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
      {r.ay}
    </span>
  ),
  yil: (r) => (
    <span className="text-sm font-medium tabular-nums text-[var(--muted-foreground)]">{r.yil}</span>
  ),
  urunAdi: (r) => (
    <div className="flex min-w-0 max-w-[11rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Package className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.urunAdi}</span>
    </div>
  ),
  musteri: (r) =>
    r.musteri && r.musteri !== "—" ? (
      <span className="inline-flex max-w-[10rem] items-center gap-1.5 truncate text-sm">
        <Users className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.musteri}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  birimSatisFiyati: (r) => (
    <span className="tabular-nums text-sm">{r.birimSatisFiyati}</span>
  ),
  satisAdeti: (r) => (
    <span className="inline-flex min-w-[2rem] justify-end rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      {r.satisAdeti}
    </span>
  ),
  toplamTutar: (r) => <span className="font-medium tabular-nums">{r.toplamTutar}</span>,
  kdvOrani: (r) => (
    <span className="text-sm tabular-nums text-[var(--muted-foreground)]">{r.kdvOrani}</span>
  ),
  kdvDahilTutar: (r) => (
    <span className="font-semibold tabular-nums text-emerald-700">{r.kdvDahilTutar}</span>
  ),
  pesinOdenen: (r) => (
    <span
      className={cn(
        "tabular-nums text-sm",
        r._paidAmount > 0 ? "font-semibold text-amber-700" : "text-[var(--muted-foreground)]"
      )}
    >
      {r.pesinOdenen}
    </span>
  ),
  raf: (r) =>
    r.raf ? (
      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
        <LayoutGrid className="h-3 w-3" />
        {r.raf}
      </span>
    ) : (
      <span className="text-xs text-[var(--muted-foreground)]">—</span>
    ),
  notlar: (r) =>
    r.notlar ? (
      <span
        className="inline-flex max-w-[160px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={r.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {r.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  alimBirimMaliyeti: (r) => (
    <span className="tabular-nums text-sm text-[var(--muted-foreground)]">{r.alimBirimMaliyeti}</span>
  ),
  uretimBirimMaliyeti: (r) => (
    <span className="tabular-nums text-sm text-[var(--muted-foreground)]">{r.uretimBirimMaliyeti}</span>
  ),
  genelGiderMaliyeti: (r) => (
    <span className="tabular-nums text-sm text-[var(--muted-foreground)]">{r.genelGiderMaliyeti}</span>
  ),
  toplamBirimMaliyeti: (r) => (
    <span className="font-medium tabular-nums text-indigo-700">{r.toplamBirimMaliyeti}</span>
  ),
  karYuzdesi: (r) => <KarBadge margin={r._profitMargin} />,
};

export function satisFilterValue(key: string, row: SatisTableRow): string {
  switch (key) {
    case "urunAdi":
      return row.urunAdi;
    case "musteri":
      return row.musteri;
    case "raf":
      return row.raf || "Rafsız";
    case "notlar":
      return row.notlar;
    case "kdvOrani":
      return row.kdvOrani;
    default:
      return String((row as Record<string, unknown>)[key] ?? "");
  }
}

export function buildSatisDataColumns() {
  return SATIS_TABLE_COLUMNS.map((col) => {
    const render =
      col.key in satisCellRenderers
        ? satisCellRenderers[col.key as keyof typeof satisCellRenderers]
        : undefined;
    return {
      key: col.key,
      label: col.label,
      sortValue: SATIS_SORT_VALUE[col.key],
      align: SATIS_MONEY_KEYS.has(col.key) ? ("right" as const) : undefined,
      ...(render
        ? {
            render,
            filterValue: (row: SatisTableRow) => satisFilterValue(col.key, row),
          }
        : {}),
    };
  });
}

export const SATIS_SEARCH_KEYS = [
  "urunAdi",
  "musteri",
  "raf",
  "notlar",
  "ay",
  "gun",
  "yil",
] as const;

export const SATIS_AMOUNT_FILTER = {
  defaultField: "toplam",
  fields: [
    { id: "toplam", label: "Toplam Tutar", getValue: (r: SatisTableRow) => r._totalAmount },
    { id: "kdv", label: "KDV Dahil", getValue: (r: SatisTableRow) => r._vatIncludedAmount },
    { id: "pesin", label: "Peşin Ödenen", getValue: (r: SatisTableRow) => r._paidAmount },
    { id: "birim", label: "Birim Fiyat", getValue: (r: SatisTableRow) => r._unitPrice },
    { id: "maliyet", label: "Toplam Birim Maliyet", getValue: (r: SatisTableRow) => r._totalUnitCost },
  ],
};
