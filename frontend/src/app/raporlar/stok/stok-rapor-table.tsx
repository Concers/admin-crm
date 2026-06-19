"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Package } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { STOK_RAPOR_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { StokDurum, StokTableRow } from "./stok-rows";

const DURUM_TONE: Record<StokDurum, "green" | "amber" | "red"> = {
  Stokta: "green",
  Tükendi: "amber",
  "Eksi Stok": "red",
};

function qtyCell(value: string, amount: number, tone?: "emerald" | "blue" | "rose" | "amber" | "default") {
  if (amount === 0 && tone !== "default") {
    return <span className="text-sm text-[var(--muted-foreground)]">0</span>;
  }
  const styles = {
    emerald: "font-semibold text-emerald-700",
    blue: "font-medium text-blue-700",
    amber: "font-semibold text-amber-800",
    rose: "font-semibold text-rose-700",
    default: "font-medium text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function StokRaporTable({ rows }: { rows: StokTableRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "urun",
        label: "Ürün",
        sortValue: (r: StokTableRow) => r.urun,
        filterValue: (r: StokTableRow) => r.urun,
        render: (r: StokTableRow) => (
          <div className="flex min-w-0 max-w-[16rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Package className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.urun}>
                {r.urun}
              </p>
              <Link
                href={`/raporlar/stok-hareket?name=${encodeURIComponent(r.urun)}`}
                className="inline-flex items-center gap-0.5 text-[11px] text-[var(--primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Hareket dökümü
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "raf",
        label: "Raf",
        sortValue: (r: StokTableRow) => r.raf,
        filterValue: (r: StokTableRow) => r.raf,
        render: (r: StokTableRow) =>
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
        key: "birim",
        label: "Birim",
        sortValue: (r: StokTableRow) => r.birim,
        filterValue: (r: StokTableRow) => r.birim,
      },
      {
        key: "durum",
        label: "Durum",
        sortValue: (r: StokTableRow) =>
          ({ "Eksi Stok": 3, Tükendi: 2, Stokta: 1 })[r.durum],
        filterValue: (r: StokTableRow) => r.durum,
        render: (r: StokTableRow) => <Badge tone={DURUM_TONE[r.durum]}>{r.durum}</Badge>,
      },
      {
        key: "toplamAlim",
        label: "Toplam Alım",
        align: "right" as const,
        sortValue: (r: StokTableRow) => r._purchased,
        filterValue: (r: StokTableRow) => r.toplamAlim,
        render: (r: StokTableRow) => qtyCell(r.toplamAlim, r._purchased, "blue"),
      },
      {
        key: "toplamSatis",
        label: "Toplam Satış",
        align: "right" as const,
        sortValue: (r: StokTableRow) => r._sold,
        filterValue: (r: StokTableRow) => r.toplamSatis,
        render: (r: StokTableRow) => qtyCell(r.toplamSatis, r._sold, "default"),
      },
      {
        key: "stok",
        label: "Mevcut Stok",
        align: "right" as const,
        sortValue: (r: StokTableRow) => r._stock,
        filterValue: (r: StokTableRow) => r.stok,
        render: (r: StokTableRow) =>
          qtyCell(
            r.stok,
            r._stock,
            r._stock < 0 ? "rose" : r._stock === 0 ? "amber" : "emerald"
          ),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "stok", asc: false }}
      searchKeys={["urun", "raf", "birim", "durum"]}
      searchPlaceholder="Ürün, raf veya durum ara…"
      filterKeys={[...STOK_RAPOR_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "stok",
        fields: [
          { id: "stok", label: "Mevcut Stok", getValue: (r: StokTableRow) => r._stock },
          { id: "alim", label: "Toplam Alım", getValue: (r: StokTableRow) => r._purchased },
          { id: "satis", label: "Toplam Satış", getValue: (r: StokTableRow) => r._sold },
        ],
      }}
      emptyText="Stok kaydı bulunamadı"
      emptyHint="Ürün tanımlayıp alım veya stok hareketi girdikten sonra liste dolacaktır."
    />
  );
}
