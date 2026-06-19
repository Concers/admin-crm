"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Truck } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { TEDARIKCI_BORC_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { TedarikciBorcRow } from "./tedarikci-borc-rows";

function moneyCell(value: string, amount: number, tone?: "blue" | "violet" | "amber" | "emerald" | "rose" | "default") {
  const styles = {
    blue: "font-semibold text-blue-700",
    violet: "font-medium text-violet-800",
    amber: "font-medium text-amber-800",
    emerald: "font-semibold text-emerald-700",
    rose: "font-semibold text-rose-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function TedarikciBorcTable({ rows }: { rows: TedarikciBorcRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ad",
        label: "Cari",
        sortValue: (r: TedarikciBorcRow) => r.ad,
        filterValue: (r: TedarikciBorcRow) => r.ad,
        render: (r: TedarikciBorcRow) => (
          <div className="flex min-w-0 max-w-[18rem] items-center gap-2">
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
                Tedarikçi raporu
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "alimToplam",
        label: "Mal alımı",
        align: "right" as const,
        sortValue: (r: TedarikciBorcRow) => r._alim,
        filterValue: (r: TedarikciBorcRow) => r.alimToplam,
        render: (r: TedarikciBorcRow) => moneyCell(r.alimToplam, r._alim, "blue"),
      },
      {
        key: "digerGider",
        label: "Diğer gider",
        align: "right" as const,
        sortValue: (r: TedarikciBorcRow) => r._gider,
        filterValue: (r: TedarikciBorcRow) => r.digerGider,
        render: (r: TedarikciBorcRow) => moneyCell(r.digerGider, r._gider, "violet"),
      },
      {
        key: "odenen",
        label: "Ödenen (peşin + ödeme)",
        align: "right" as const,
        sortValue: (r: TedarikciBorcRow) => r._odenen,
        filterValue: (r: TedarikciBorcRow) => r.odenen,
        render: (r: TedarikciBorcRow) => moneyCell(r.odenen, r._odenen, "amber"),
      },
      {
        key: "bizimAlacak",
        label: "Bizim alacağımız",
        align: "right" as const,
        sortValue: (r: TedarikciBorcRow) => r._alacak,
        filterValue: (r: TedarikciBorcRow) => r.bizimAlacak,
        render: (r: TedarikciBorcRow) => moneyCell(r.bizimAlacak, r._alacak, "emerald"),
      },
      {
        key: "netBorc",
        label: "Net borç",
        align: "right" as const,
        sortValue: (r: TedarikciBorcRow) => r._borc,
        filterValue: (r: TedarikciBorcRow) => r.netBorc,
        render: (r: TedarikciBorcRow) => moneyCell(r.netBorc, r._borc, "rose"),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "netBorc", asc: false }}
      searchKeys={["ad"]}
      searchPlaceholder="Cari ara…"
      filterKeys={[...TEDARIKCI_BORC_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "borc",
        fields: [
          { id: "borc", label: "Net borç", getValue: (r: TedarikciBorcRow) => r._borc },
          { id: "alim", label: "Mal alımı", getValue: (r: TedarikciBorcRow) => r._alim },
          { id: "gider", label: "Diğer gider", getValue: (r: TedarikciBorcRow) => r._gider },
          { id: "alacak", label: "Bizim alacağımız", getValue: (r: TedarikciBorcRow) => r._alacak },
        ],
      }}
      minTableWidth="1050px"
      emptyText="Net borçlu cari yok"
      emptyHint="Tüm tedarikçi bakiyeleri tahsilat veya alacakla kapanmış görünüyor."
    />
  );
}
