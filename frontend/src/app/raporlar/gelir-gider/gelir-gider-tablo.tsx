"use client";

import { useMemo, type ReactNode } from "react";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import type { GelirGiderMatrixRow } from "./gelir-gider-rows";

function moneyCell(value: string, amount: number, accent?: "emerald" | "amber" | "rose" | "indigo") {
  if (!value) return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  const styles = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    indigo: "text-indigo-700",
  };
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        amount > 0 && accent ? styles[accent] : "text-[var(--foreground)]"
      )}
    >
      {value}
    </span>
  );
}

function nameCell(value: string, narrow = false) {
  if (!value) return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  return (
    <span
      className={cn(
        "block truncate text-sm font-medium",
        narrow ? "max-w-[10rem]" : "max-w-[14rem]"
      )}
      title={value}
    >
      {value}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: GelirGiderMatrixRow) => ReactNode> = {
  satisUrun: (r) =>
    r.satisUrun === "TOPLAM" ? (
      <span className="text-sm font-bold uppercase tracking-wide">TOPLAM</span>
    ) : (
      nameCell(r.satisUrun)
    ),
  satisTutar: (r) => moneyCell(r.satisTutar, r._satisAmount, "emerald"),
  alimUrun: (r) =>
    r.alimUrun === "TOPLAM" ? (
      <span className="text-sm font-bold uppercase tracking-wide">TOPLAM</span>
    ) : (
      nameCell(r.alimUrun)
    ),
  alimTutar: (r) => moneyCell(r.alimTutar, r._alimAmount, "amber"),
  urunGiderUrun: (r) =>
    r.urunGiderUrun === "TOPLAM" ? (
      <span className="text-sm font-bold uppercase tracking-wide">TOPLAM</span>
    ) : (
      nameCell(r.urunGiderUrun)
    ),
  urunGiderTutar: (r) => moneyCell(r.urunGiderTutar, r._urunGiderAmount, "rose"),
  genelGiderTur: (r) =>
    r.genelGiderTur === "TOPLAM" ? (
      <span className="text-sm font-bold uppercase tracking-wide">TOPLAM</span>
    ) : (
      nameCell(r.genelGiderTur, true)
    ),
  genelGiderTutar: (r) => moneyCell(r.genelGiderTutar, r._genelGiderAmount, "indigo"),
};

const COLUMNS = [
  { key: "satisUrun", label: "Yapılan Satış (KDV'siz)" },
  { key: "satisTutar", label: "Tutar" },
  { key: "alimUrun", label: "Yapılan Alımlar" },
  { key: "alimTutar", label: "Tutar" },
  { key: "urunGiderUrun", label: "Ürün Giderleri" },
  { key: "urunGiderTutar", label: "Tutar" },
  { key: "genelGiderTur", label: "Genel Giderler" },
  { key: "genelGiderTutar", label: "Tutar" },
] as const;

export function GelirGiderMatrixTable({
  rows,
  toplamSatiri,
}: {
  rows: GelirGiderMatrixRow[];
  toplamSatiri: GelirGiderMatrixRow;
}) {
  const tableRows = useMemo(() => [toplamSatiri, ...rows], [rows, toplamSatiri]);

  const columns = useMemo(
    () =>
      COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortable: col.key.endsWith("Tutar"),
        filterable: !col.key.endsWith("Tutar"),
        align: col.key.endsWith("Tutar") ? ("right" as const) : undefined,
        sortValue: col.key.endsWith("Tutar")
          ? (r: GelirGiderMatrixRow) =>
              ({
                satisTutar: r._satisAmount,
                alimTutar: r._alimAmount,
                urunGiderTutar: r._urunGiderAmount,
                genelGiderTutar: r._genelGiderAmount,
              })[col.key as "satisTutar"]
          : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: GelirGiderMatrixRow) => String((r as Record<string, unknown>)[col.key] ?? ""),
      })),
    []
  );

  return (
    <DataTable
      rows={tableRows}
      columns={columns}
      defaultSort={{ key: "satisTutar", asc: false }}
      searchKeys={["satisUrun", "alimUrun", "urunGiderUrun", "genelGiderTur"]}
      searchPlaceholder="Ürün veya gider türü ara…"
      minTableWidth="1400px"
      emptyText="Seçilen dönemde kayıt yok"
      emptyHint="Tarih aralığını değiştirin."
    />
  );
}
