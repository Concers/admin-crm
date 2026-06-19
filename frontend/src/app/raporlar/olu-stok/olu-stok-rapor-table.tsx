"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { OLU_STOK_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { OluStokDurum, OluStokTableRow } from "./olu-stok-rows";

const DURUM_TONE: Record<OluStokDurum, "red" | "amber"> = {
  "Hiç satılmamış": "red",
  "Uzun süredir bekliyor": "amber",
};

function qtyCell(value: string, amount: number) {
  return <span className="font-medium tabular-nums text-[var(--foreground)]">{value}</span>;
}

function moneyCell(value: string, amount: number) {
  return <span className="font-semibold tabular-nums text-indigo-700">{value}</span>;
}

function beklemeCell(row: OluStokTableRow) {
  if (row._idleDays == null) {
    return <span className="text-sm text-rose-600">Hiç satılmamış</span>;
  }
  const tone =
    row._idleDays >= 180 ? "text-rose-700 font-semibold" : row._idleDays >= 90 ? "text-amber-800 font-medium" : "";
  return <span className={cn("tabular-nums", tone)}>{row.bekleme}</span>;
}

export function OluStokRaporTable({ rows }: { rows: OluStokTableRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "urun",
        label: "Ürün",
        sortValue: (r: OluStokTableRow) => r.urun,
        filterValue: (r: OluStokTableRow) => r.urun,
        render: (r: OluStokTableRow) => (
          <div className="flex min-w-0 max-w-[18rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
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
        key: "durum",
        label: "Durum",
        sortValue: (r: OluStokTableRow) => r.durum,
        filterValue: (r: OluStokTableRow) => r.durum,
        render: (r: OluStokTableRow) => <Badge tone={DURUM_TONE[r.durum]}>{r.durum}</Badge>,
      },
      {
        key: "stok",
        label: "Stok",
        align: "right" as const,
        sortValue: (r: OluStokTableRow) => r._stock,
        filterValue: (r: OluStokTableRow) => r.stok,
        render: (r: OluStokTableRow) => qtyCell(r.stok, r._stock),
      },
      {
        key: "sonSatis",
        label: "Son satış",
        sortValue: (r: OluStokTableRow) => r._lastSale ?? "",
        filterValue: (r: OluStokTableRow) => r.sonSatis,
        render: (r: OluStokTableRow) => (
          <span
            className={cn(
              "whitespace-nowrap text-sm",
              r._lastSale ? "text-[var(--foreground)]" : "font-medium text-rose-600"
            )}
          >
            {r.sonSatis}
          </span>
        ),
      },
      {
        key: "bekleme",
        label: "Bekleme",
        align: "right" as const,
        sortValue: (r: OluStokTableRow) => r._idleDays ?? 99999,
        filterValue: (r: OluStokTableRow) => r.bekleme,
        render: (r: OluStokTableRow) => beklemeCell(r),
      },
      {
        key: "deger",
        label: "Stok değeri",
        align: "right" as const,
        sortValue: (r: OluStokTableRow) => r._value,
        filterValue: (r: OluStokTableRow) => r.deger,
        render: (r: OluStokTableRow) => moneyCell(r.deger, r._value),
      },
      {
        key: "birim",
        label: "Birim",
        sortValue: (r: OluStokTableRow) => r.birim,
        filterValue: (r: OluStokTableRow) => r.birim,
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "deger", asc: false }}
      searchKeys={["urun", "durum", "birim"]}
      searchPlaceholder="Ürün, durum veya birim ara…"
      filterKeys={[...OLU_STOK_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "deger",
        fields: [
          { id: "deger", label: "Stok değeri", getValue: (r: OluStokTableRow) => r._value },
          { id: "stok", label: "Stok miktarı", getValue: (r: OluStokTableRow) => r._stock },
          { id: "bekleme", label: "Bekleme (gün)", getValue: (r: OluStokTableRow) => r._idleDays ?? 0 },
        ],
      }}
      minTableWidth="1000px"
      emptyText="Ölü stok bulunmuyor"
      emptyHint="Seçilen sürede hareketsiz stok tespit edilmedi."
    />
  );
}
