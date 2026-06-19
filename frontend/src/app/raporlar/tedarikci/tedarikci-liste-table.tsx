"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Truck } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { TEDARIKCI_LISTE_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { TedarikciListeRow } from "./tedarikci-rows";

function moneyCell(value: string, amount: number, tone?: "blue" | "amber" | "rose" | "emerald" | "default") {
  const styles = {
    blue: "font-semibold text-blue-700",
    amber: "font-medium text-amber-800",
    rose: "font-semibold text-rose-700",
    emerald: "font-semibold text-emerald-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function TedarikciListeTable({ rows }: { rows: TedarikciListeRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ad",
        label: "Tedarikçi",
        sortValue: (r: TedarikciListeRow) => r.ad,
        filterValue: (r: TedarikciListeRow) => r.ad,
        render: (r: TedarikciListeRow) => (
          <div className="flex min-w-0 max-w-[16rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <Truck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.ad}>
                {r.ad}
              </p>
              <Link
                href={`/raporlar/tedarikci?ad=${encodeURIComponent(r.ad)}`}
                className="inline-flex items-center gap-0.5 text-[11px] text-[var(--primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Detay rapor
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "tip",
        label: "Tip",
        sortValue: (r: TedarikciListeRow) => r.tip,
        filterValue: (r: TedarikciListeRow) => r.tip,
      },
      {
        key: "alimToplam",
        label: "Mal alımı",
        align: "right" as const,
        sortValue: (r: TedarikciListeRow) => r._alim,
        filterValue: (r: TedarikciListeRow) => r.alimToplam,
        render: (r: TedarikciListeRow) => moneyCell(r.alimToplam, r._alim, "blue"),
      },
      {
        key: "pesinOdenen",
        label: "Alım peşin",
        align: "right" as const,
        sortValue: (r: TedarikciListeRow) => r._pesin,
        filterValue: (r: TedarikciListeRow) => r.pesinOdenen,
        render: (r: TedarikciListeRow) => moneyCell(r.pesinOdenen, r._pesin, "amber"),
      },
      {
        key: "digerGider",
        label: "Diğer gider",
        align: "right" as const,
        sortValue: (r: TedarikciListeRow) => r._gider,
        filterValue: (r: TedarikciListeRow) => r.digerGider,
        render: (r: TedarikciListeRow) => moneyCell(r.digerGider, r._gider, "default"),
      },
      {
        key: "giderPesin",
        label: "Gider peşin",
        align: "right" as const,
        sortValue: (r: TedarikciListeRow) => r._giderPesin,
        filterValue: (r: TedarikciListeRow) => r.giderPesin,
        render: (r: TedarikciListeRow) => moneyCell(r.giderPesin, r._giderPesin, "amber"),
      },
      {
        key: "yapilanOdeme",
        label: "Ödemeler",
        align: "right" as const,
        sortValue: (r: TedarikciListeRow) => r._odeme,
        filterValue: (r: TedarikciListeRow) => r.yapilanOdeme,
        render: (r: TedarikciListeRow) => moneyCell(r.yapilanOdeme, r._odeme, "default"),
      },
      {
        key: "borc",
        label: "Kalan bakiye",
        align: "right" as const,
        sortValue: (r: TedarikciListeRow) => r._borc,
        filterValue: (r: TedarikciListeRow) => r.borc,
        render: (r: TedarikciListeRow) =>
          moneyCell(r.borc, r._borc, r._borc > 0 ? "rose" : r._borc < 0 ? "emerald" : "default"),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "borc", asc: false }}
      searchKeys={["ad", "tip"]}
      searchPlaceholder="Tedarikçi veya tip ara…"
      filterKeys={[...TEDARIKCI_LISTE_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "borc",
        fields: [
          { id: "borc", label: "Kalan bakiye", getValue: (r: TedarikciListeRow) => r._borc },
          { id: "alim", label: "Mal alımı", getValue: (r: TedarikciListeRow) => r._alim },
          { id: "gider", label: "Diğer gider", getValue: (r: TedarikciListeRow) => r._gider },
          { id: "odeme", label: "Ödemeler", getValue: (r: TedarikciListeRow) => r._odeme },
        ],
      }}
      emptyText="Tedarikçi kaydı yok"
      emptyHint="Alım veya ödeme girilmiş tedarikçi bulunmuyor."
    />
  );
}
