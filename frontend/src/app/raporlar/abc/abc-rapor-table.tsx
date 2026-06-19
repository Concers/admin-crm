"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { ABC_RAPOR_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { AbcSinif, AbcTableRow } from "./abc-rows";

const SINIF_BADGE: Record<AbcSinif, string> = {
  A: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  B: "bg-amber-100 text-amber-900 ring-amber-200",
  C: "bg-slate-100 text-slate-700 ring-slate-200",
};

function moneyCell(value: string, amount: number) {
  return <span className="font-semibold tabular-nums text-indigo-700">{value}</span>;
}

function pctCell(value: string, tone?: "default" | "muted") {
  return (
    <span
      className={cn(
        "tabular-nums",
        tone === "muted" ? "text-sm text-[var(--muted-foreground)]" : "font-medium"
      )}
    >
      {value}
    </span>
  );
}

export function AbcRaporTable({ rows }: { rows: AbcTableRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "urun",
        label: "Ürün",
        sortValue: (r: AbcTableRow) => r.urun,
        filterValue: (r: AbcTableRow) => r.urun,
        render: (r: AbcTableRow) => (
          <div className="flex min-w-0 max-w-[18rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Package className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.urun}>
                {r.urun}
              </p>
              <Link
                href={`/raporlar/urun?urun=${encodeURIComponent(r.urun)}`}
                className="inline-flex items-center gap-0.5 text-[11px] text-[var(--primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Ürün raporu
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "ciro",
        label: "Ciro",
        align: "right" as const,
        sortValue: (r: AbcTableRow) => r._revenue,
        filterValue: (r: AbcTableRow) => r.ciro,
        render: (r: AbcTableRow) => moneyCell(r.ciro, r._revenue),
      },
      {
        key: "adet",
        label: "Adet",
        align: "right" as const,
        sortValue: (r: AbcTableRow) => r._quantity,
        filterValue: (r: AbcTableRow) => r.adet,
        render: (r: AbcTableRow) => (
          <span className="tabular-nums font-medium">{r.adet}</span>
        ),
      },
      {
        key: "ciroPct",
        label: "Ciro %",
        align: "right" as const,
        sortValue: (r: AbcTableRow) => r._revenuePct,
        filterValue: (r: AbcTableRow) => r.ciroPct,
        render: (r: AbcTableRow) => pctCell(r.ciroPct),
      },
      {
        key: "kumPct",
        label: "Kümülatif %",
        align: "right" as const,
        sortValue: (r: AbcTableRow) => r._cumulativePct,
        filterValue: (r: AbcTableRow) => r.kumPct,
        render: (r: AbcTableRow) => pctCell(r.kumPct, "muted"),
      },
      {
        key: "sinif",
        label: "Sınıf",
        sortValue: (r: AbcTableRow) => r.sinif,
        filterValue: (r: AbcTableRow) => r.sinif,
        render: (r: AbcTableRow) => (
          <Badge className={cn("font-bold ring-1", SINIF_BADGE[r.sinif])}>{r.sinif}</Badge>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "ciro", asc: false }}
      searchKeys={["urun", "sinif"]}
      searchPlaceholder="Ürün veya sınıf ara…"
      filterKeys={[...ABC_RAPOR_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "ciro",
        fields: [
          { id: "ciro", label: "Ciro", getValue: (r: AbcTableRow) => r._revenue },
          { id: "adet", label: "Adet", getValue: (r: AbcTableRow) => r._quantity },
        ],
      }}
      minTableWidth="960px"
      emptyText="ABC analizi için veri yok"
      emptyHint="Henüz satışı olan ürün bulunmuyor."
    />
  );
}
