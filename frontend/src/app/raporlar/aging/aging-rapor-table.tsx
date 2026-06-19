"use client";

import { useMemo } from "react";
import { Building2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { AGING_RAPOR_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { AgingRisk, AgingTableRow } from "./aging-rows";

const RISK_TONE: Record<AgingRisk, "green" | "blue" | "amber" | "red"> = {
  Düşük: "green",
  İzle: "blue",
  Orta: "amber",
  Yüksek: "red",
};

function moneyCell(value: string, amount: number, tone?: "emerald" | "blue" | "amber" | "rose" | "default") {
  if (amount <= 0) {
    return <span className="text-sm text-[var(--muted-foreground)]">—</span>;
  }
  const styles = {
    emerald: "font-semibold text-emerald-700",
    blue: "font-semibold text-blue-700",
    amber: "font-semibold text-amber-800",
    rose: "font-semibold text-rose-700",
    default: "font-medium text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

export function AgingRaporTable({ rows }: { rows: AgingTableRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ad",
        label: "Cari",
        sortValue: (r: AgingTableRow) => r.ad,
        filterValue: (r: AgingTableRow) => r.ad,
        render: (r: AgingTableRow) => (
          <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            <span className="truncate font-medium" title={r.ad}>
              {r.ad}
            </span>
          </div>
        ),
      },
      {
        key: "risk",
        label: "Risk",
        sortValue: (r: AgingTableRow) =>
          ({ Yüksek: 4, Orta: 3, İzle: 2, Düşük: 1 })[r.risk],
        filterValue: (r: AgingTableRow) => r.risk,
        render: (r: AgingTableRow) => <Badge tone={RISK_TONE[r.risk]}>{r.risk}</Badge>,
      },
      {
        key: "d0_30",
        label: "0–30 Gün",
        align: "right" as const,
        sortValue: (r: AgingTableRow) => r._d0_30,
        filterValue: (r: AgingTableRow) => r.d0_30,
        render: (r: AgingTableRow) => moneyCell(r.d0_30, r._d0_30, "emerald"),
      },
      {
        key: "d31_60",
        label: "31–60 Gün",
        align: "right" as const,
        sortValue: (r: AgingTableRow) => r._d31_60,
        filterValue: (r: AgingTableRow) => r.d31_60,
        render: (r: AgingTableRow) => moneyCell(r.d31_60, r._d31_60, "blue"),
      },
      {
        key: "d61_90",
        label: "61–90 Gün",
        align: "right" as const,
        sortValue: (r: AgingTableRow) => r._d61_90,
        filterValue: (r: AgingTableRow) => r.d61_90,
        render: (r: AgingTableRow) => moneyCell(r.d61_90, r._d61_90, "amber"),
      },
      {
        key: "d90plus",
        label: "90+ Gün",
        align: "right" as const,
        sortValue: (r: AgingTableRow) => r._d90plus,
        filterValue: (r: AgingTableRow) => r.d90plus,
        render: (r: AgingTableRow) => moneyCell(r.d90plus, r._d90plus, "rose"),
      },
      {
        key: "toplam",
        label: "Toplam",
        align: "right" as const,
        sortValue: (r: AgingTableRow) => r._total,
        filterValue: (r: AgingTableRow) => r.toplam,
        render: (r: AgingTableRow) => (
          <span className="font-semibold tabular-nums text-[var(--foreground)]">{r.toplam}</span>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "toplam", asc: false }}
      searchKeys={["ad", "risk"]}
      searchPlaceholder="Cari veya risk seviyesi ara…"
      filterKeys={[...AGING_RAPOR_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "toplam",
        fields: [
          { id: "toplam", label: "Toplam Alacak", getValue: (r: AgingTableRow) => r._total },
          { id: "d90", label: "90+ Gün", getValue: (r: AgingTableRow) => r._d90plus },
        ],
      }}
      emptyText="Açık alacak kaydı bulunamadı"
      emptyHint="Tahsilat ve satış kayıtları oluştukça alacak durumu tablosu dolacaktır."
    />
  );
}
