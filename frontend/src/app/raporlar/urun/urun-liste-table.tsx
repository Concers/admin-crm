"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Package } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { URUN_LISTE_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { UrunListeRow } from "./urun-rapor-rows";

function moneyCell(value: string, amount: number, tone?: "emerald" | "rose" | "blue" | "default") {
  const styles = {
    emerald: "font-semibold text-emerald-700",
    rose: "font-semibold text-rose-700",
    blue: "font-medium text-blue-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function UrunListeTable({ rows }: { rows: UrunListeRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ad",
        label: "Ürün",
        sortValue: (r: UrunListeRow) => r.ad,
        filterValue: (r: UrunListeRow) => r.ad,
        render: (r: UrunListeRow) => (
          <div className="flex min-w-0 max-w-[16rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Package className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.ad}>
                {r.ad}
              </p>
              <Link
                href={`/raporlar/urun?urun=${encodeURIComponent(r.ad)}`}
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
        key: "raf",
        label: "Raf",
        sortValue: (r: UrunListeRow) => r.raf,
        filterValue: (r: UrunListeRow) => r.raf,
        render: (r: UrunListeRow) =>
          r.raf === "—" ? (
            <span className="text-sm text-[var(--muted-foreground)]">—</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)]/50 px-2 py-0.5 text-xs font-medium">
              <MapPin className="h-3 w-3 text-[var(--primary)]" />
              {r.raf}
            </span>
          ),
      },
      {
        key: "satisAdet",
        label: "Satılan",
        align: "right" as const,
        sortValue: (r: UrunListeRow) => r._satisQty,
        filterValue: (r: UrunListeRow) => r.satisAdet,
      },
      {
        key: "satis",
        label: "Satış",
        align: "right" as const,
        sortValue: (r: UrunListeRow) => r._satis,
        filterValue: (r: UrunListeRow) => r.satis,
        render: (r: UrunListeRow) => moneyCell(r.satis, r._satis, "emerald"),
      },
      {
        key: "alim",
        label: "Alım",
        align: "right" as const,
        sortValue: (r: UrunListeRow) => r._alim,
        filterValue: (r: UrunListeRow) => r.alim,
        render: (r: UrunListeRow) => moneyCell(r.alim, r._alim, "blue"),
      },
      {
        key: "digerMaliyet",
        label: "Diğer maliyet",
        align: "right" as const,
        sortValue: (r: UrunListeRow) => r._digerMaliyet,
        filterValue: (r: UrunListeRow) => r.digerMaliyet,
        render: (r: UrunListeRow) => moneyCell(r.digerMaliyet, r._digerMaliyet, "default"),
      },
      {
        key: "kar",
        label: "Kâr/Zarar",
        align: "right" as const,
        sortValue: (r: UrunListeRow) => r._kar,
        filterValue: (r: UrunListeRow) => r.kar,
        render: (r: UrunListeRow) =>
          moneyCell(r.kar, r._kar, r._kar > 0 ? "emerald" : r._kar < 0 ? "rose" : "default"),
      },
      {
        key: "marj",
        label: "Marj",
        align: "right" as const,
        sortValue: (r: UrunListeRow) => r._marj,
        filterValue: (r: UrunListeRow) => r.marj,
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "kar", asc: false }}
      searchKeys={["ad", "raf"]}
      searchPlaceholder="Ürün veya raf ara…"
      filterKeys={[...URUN_LISTE_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "kar",
        fields: [
          { id: "kar", label: "Kâr/Zarar", getValue: (r: UrunListeRow) => r._kar },
          { id: "satis", label: "Satış", getValue: (r: UrunListeRow) => r._satis },
          { id: "alim", label: "Alım", getValue: (r: UrunListeRow) => r._alim },
          { id: "gider", label: "Diğer maliyet", getValue: (r: UrunListeRow) => r._digerMaliyet },
        ],
      }}
      emptyText="Henüz ürün tanımı yok"
      emptyHint="Tanımlama bölümünden ürün ekleyin."
    />
  );
}
