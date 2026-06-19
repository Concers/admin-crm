"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { MUSTERI_LISTE_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { MusteriListeRow } from "./musteri-rows";

function moneyCell(value: string, amount: number, tone?: "blue" | "amber" | "emerald" | "rose" | "default") {
  const styles = {
    blue: "font-semibold text-blue-700",
    amber: "font-medium text-amber-800",
    emerald: "font-semibold text-emerald-700",
    rose: "font-semibold text-rose-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function MusteriListeTable({ rows }: { rows: MusteriListeRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ad",
        label: "Müşteri",
        sortValue: (r: MusteriListeRow) => r.ad,
        filterValue: (r: MusteriListeRow) => r.ad,
        render: (r: MusteriListeRow) => (
          <div className="flex min-w-0 max-w-[16rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <Users className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.ad}>
                {r.ad}
              </p>
              <Link
                href={`/raporlar/musteri?ad=${encodeURIComponent(r.ad)}`}
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
        sortValue: (r: MusteriListeRow) => r.tip,
        filterValue: (r: MusteriListeRow) => r.tip,
      },
      {
        key: "satisToplam",
        label: "Satış (KDV hariç)",
        align: "right" as const,
        sortValue: (r: MusteriListeRow) => r._satis,
        filterValue: (r: MusteriListeRow) => r.satisToplam,
        render: (r: MusteriListeRow) => moneyCell(r.satisToplam, r._satis, "blue"),
      },
      {
        key: "kdvliToplam",
        label: "KDV'li toplam",
        align: "right" as const,
        sortValue: (r: MusteriListeRow) => r._kdvli,
        filterValue: (r: MusteriListeRow) => r.kdvliToplam,
        render: (r: MusteriListeRow) => moneyCell(r.kdvliToplam, r._kdvli, "default"),
      },
      {
        key: "pesinOdenen",
        label: "Peşin",
        align: "right" as const,
        sortValue: (r: MusteriListeRow) => r._pesin,
        filterValue: (r: MusteriListeRow) => r.pesinOdenen,
        render: (r: MusteriListeRow) => moneyCell(r.pesinOdenen, r._pesin, "amber"),
      },
      {
        key: "tahsilat",
        label: "Tahsilat",
        align: "right" as const,
        sortValue: (r: MusteriListeRow) => r._tahsilat,
        filterValue: (r: MusteriListeRow) => r.tahsilat,
        render: (r: MusteriListeRow) => moneyCell(r.tahsilat, r._tahsilat, "emerald"),
      },
      {
        key: "alacak",
        label: "Kalan bakiye",
        align: "right" as const,
        sortValue: (r: MusteriListeRow) => r._alacak,
        filterValue: (r: MusteriListeRow) => r.alacak,
        render: (r: MusteriListeRow) =>
          moneyCell(r.alacak, r._alacak, r._alacak > 0 ? "rose" : r._alacak < 0 ? "emerald" : "default"),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "alacak", asc: false }}
      searchKeys={["ad", "tip"]}
      searchPlaceholder="Müşteri veya tip ara…"
      filterKeys={[...MUSTERI_LISTE_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "alacak",
        fields: [
          { id: "alacak", label: "Kalan bakiye", getValue: (r: MusteriListeRow) => r._alacak },
          { id: "kdvli", label: "KDV'li toplam", getValue: (r: MusteriListeRow) => r._kdvli },
          { id: "tahsilat", label: "Tahsilat", getValue: (r: MusteriListeRow) => r._tahsilat },
        ],
      }}
      minTableWidth="1100px"
      emptyText="Müşteri kaydı yok"
      emptyHint="Satış veya tahsilat girilmiş müşteri bulunmuyor."
    />
  );
}
