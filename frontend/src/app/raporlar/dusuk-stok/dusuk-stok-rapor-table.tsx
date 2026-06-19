"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { DUSUK_STOK_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { DusukStokAciliyet, DusukStokTableRow } from "./dusuk-stok-rows";

const ACILIYET_TONE: Record<DusukStokAciliyet, "red" | "amber"> = {
  Kritik: "red",
  Uyarı: "amber",
  "Eksi Stok": "red",
};

function qtyCell(value: string, amount: number, tone?: "rose" | "amber" | "emerald" | "default") {
  const styles = {
    rose: "font-semibold text-rose-700",
    amber: "font-semibold text-amber-800",
    emerald: "font-medium text-emerald-700",
    default: "font-medium text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

function dolulukBar(pct: number) {
  const color =
    pct <= 0 ? "bg-rose-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex min-w-[88px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs font-medium tabular-nums text-[var(--muted-foreground)]">
        %{pct}
      </span>
    </div>
  );
}

export function DusukStokRaporTable({ rows }: { rows: DusukStokTableRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "urun",
        label: "Ürün",
        sortValue: (r: DusukStokTableRow) => r.urun,
        filterValue: (r: DusukStokTableRow) => r.urun,
        render: (r: DusukStokTableRow) => (
          <div className="flex min-w-0 max-w-[16rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <Package className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.urun}>
                {r.urun}
              </p>
              <Link
                href={`/urun-alim`}
                className="inline-flex items-center gap-0.5 text-[11px] text-[var(--primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Alım girişi
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "aciliyet",
        label: "Aciliyet",
        sortValue: (r: DusukStokTableRow) =>
          ({ "Eksi Stok": 3, Kritik: 2, Uyarı: 1 })[r.aciliyet],
        filterValue: (r: DusukStokTableRow) => r.aciliyet,
        render: (r: DusukStokTableRow) => <Badge tone={ACILIYET_TONE[r.aciliyet]}>{r.aciliyet}</Badge>,
      },
      {
        key: "stok",
        label: "Mevcut",
        align: "right" as const,
        sortValue: (r: DusukStokTableRow) => r._stock,
        filterValue: (r: DusukStokTableRow) => r.stok,
        render: (r: DusukStokTableRow) =>
          qtyCell(
            r.stok,
            r._stock,
            r._stock < 0 ? "rose" : r._stock === 0 ? "rose" : "amber"
          ),
      },
      {
        key: "minStok",
        label: "Min. Stok",
        align: "right" as const,
        sortValue: (r: DusukStokTableRow) => r._minStock,
        filterValue: (r: DusukStokTableRow) => r.minStok,
        render: (r: DusukStokTableRow) => qtyCell(r.minStok, r._minStock, "default"),
      },
      {
        key: "eksik",
        label: "Eksik",
        align: "right" as const,
        sortValue: (r: DusukStokTableRow) => r._eksik,
        filterValue: (r: DusukStokTableRow) => r.eksik,
        render: (r: DusukStokTableRow) =>
          r._eksik > 0 ? (
            qtyCell(r.eksik, r._eksik, "rose")
          ) : (
            <span className="text-sm text-[var(--muted-foreground)]">—</span>
          ),
      },
      {
        key: "doluluk",
        label: "Doluluk",
        sortValue: (r: DusukStokTableRow) => r._doluluk,
        filterValue: (r: DusukStokTableRow) => r.doluluk,
        render: (r: DusukStokTableRow) => dolulukBar(r._doluluk),
      },
      {
        key: "birim",
        label: "Birim",
        sortValue: (r: DusukStokTableRow) => r.birim,
        filterValue: (r: DusukStokTableRow) => r.birim,
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "eksik", asc: false }}
      searchKeys={["urun", "birim", "aciliyet"]}
      searchPlaceholder="Ürün, birim veya aciliyet ara…"
      filterKeys={[...DUSUK_STOK_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "eksik",
        fields: [
          { id: "eksik", label: "Eksik Miktar", getValue: (r: DusukStokTableRow) => r._eksik },
          { id: "stok", label: "Mevcut Stok", getValue: (r: DusukStokTableRow) => r._stock },
          { id: "min", label: "Min. Stok", getValue: (r: DusukStokTableRow) => r._minStock },
        ],
      }}
      emptyText="Minimum stok seviyesinin altında ürün yok"
      emptyHint="Tüm ürünler yeniden sipariş seviyesinin üzerinde."
    />
  );
}
