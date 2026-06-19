"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { MUSTERI_ALACAK_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { MusteriAlacakRow } from "./musteri-alacak-rows";

function moneyCell(value: string, amount: number, tone?: "blue" | "amber" | "emerald" | "rose" | "default") {
  const styles = {
    blue: "font-semibold text-blue-700",
    amber: "font-medium text-amber-800",
    emerald: "font-semibold text-emerald-700",
    rose: "font-medium text-rose-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function MusteriAlacakTable({ rows }: { rows: MusteriAlacakRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ad",
        label: "Cari",
        sortValue: (r: MusteriAlacakRow) => r.ad,
        filterValue: (r: MusteriAlacakRow) => r.ad,
        render: (r: MusteriAlacakRow) => (
          <div className="flex min-w-0 max-w-[18rem] items-center gap-2">
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
                Müşteri raporu
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "satisToplam",
        label: "Satış toplamı",
        align: "right" as const,
        sortValue: (r: MusteriAlacakRow) => r._satis,
        filterValue: (r: MusteriAlacakRow) => r.satisToplam,
        render: (r: MusteriAlacakRow) => moneyCell(r.satisToplam, r._satis, "blue"),
      },
      {
        key: "pesinOdenen",
        label: "Peşin ödenen",
        align: "right" as const,
        sortValue: (r: MusteriAlacakRow) => r._pesin,
        filterValue: (r: MusteriAlacakRow) => r.pesinOdenen,
        render: (r: MusteriAlacakRow) => moneyCell(r.pesinOdenen, r._pesin, "amber"),
      },
      {
        key: "tahsilat",
        label: "Tahsilat",
        align: "right" as const,
        sortValue: (r: MusteriAlacakRow) => r._tahsilat,
        filterValue: (r: MusteriAlacakRow) => r.tahsilat,
        render: (r: MusteriAlacakRow) => moneyCell(r.tahsilat, r._tahsilat, "emerald"),
      },
      {
        key: "bizimBorc",
        label: "Bizim borcumuz",
        align: "right" as const,
        sortValue: (r: MusteriAlacakRow) => r._borc,
        filterValue: (r: MusteriAlacakRow) => r.bizimBorc,
        render: (r: MusteriAlacakRow) => moneyCell(r.bizimBorc, r._borc, "rose"),
      },
      {
        key: "netAlacak",
        label: "Net alacak",
        align: "right" as const,
        sortValue: (r: MusteriAlacakRow) => r._alacak,
        filterValue: (r: MusteriAlacakRow) => r.netAlacak,
        render: (r: MusteriAlacakRow) => moneyCell(r.netAlacak, r._alacak, "emerald"),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "netAlacak", asc: false }}
      searchKeys={["ad"]}
      searchPlaceholder="Cari ara…"
      filterKeys={[...MUSTERI_ALACAK_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "alacak",
        fields: [
          { id: "alacak", label: "Net alacak", getValue: (r: MusteriAlacakRow) => r._alacak },
          { id: "satis", label: "Satış toplamı", getValue: (r: MusteriAlacakRow) => r._satis },
          { id: "tahsilat", label: "Tahsilat", getValue: (r: MusteriAlacakRow) => r._tahsilat },
          { id: "borc", label: "Bizim borcumuz", getValue: (r: MusteriAlacakRow) => r._borc },
        ],
      }}
      minTableWidth="1050px"
      emptyText="Net alacaklı cari yok"
      emptyHint="Tüm müşteri bakiyeleri tahsilat veya borç mahsuplaşmasıyla kapanmış görünüyor."
    />
  );
}
