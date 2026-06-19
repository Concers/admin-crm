"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Receipt } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { GIDER_MERKEZI_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { GiderMerkeziRow, GiderMerkeziTrend } from "./gider-merkezi-rows";

const TREND_TONE: Record<GiderMerkeziTrend, "red" | "green" | "amber" | "indigo"> = {
  Artış: "red",
  Azalış: "green",
  Sabit: "amber",
  Yeni: "indigo",
};

function moneyCell(value: string, amount: number, tone?: "violet" | "slate" | "default") {
  const styles = {
    violet: "font-semibold text-violet-800",
    slate: "font-medium text-slate-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

function degisimCell(row: GiderMerkeziRow) {
  const tone =
    row.trend === "Artış" ? "text-rose-700 font-semibold" : row.trend === "Azalış" ? "text-emerald-700 font-semibold" : "";
  return <span className={cn("tabular-nums", tone)}>{row.degisim}</span>;
}

export function GiderMerkeziTable({ rows }: { rows: GiderMerkeziRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "kategori",
        label: "Gider türü",
        sortValue: (r: GiderMerkeziRow) => r.kategori,
        filterValue: (r: GiderMerkeziRow) => r.kategori,
        render: (r: GiderMerkeziRow) => (
          <div className="flex min-w-0 max-w-[18rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <Receipt className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.kategori}>
                {r.kategori}
              </p>
              <Link
                href="/gider-girisi"
                className="inline-flex items-center gap-0.5 text-[11px] text-[var(--primary)] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Gider girişi
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "trend",
        label: "Trend",
        sortValue: (r: GiderMerkeziRow) => r.trend,
        filterValue: (r: GiderMerkeziRow) => r.trend,
        render: (r: GiderMerkeziRow) => <Badge tone={TREND_TONE[r.trend]}>{r.trend}</Badge>,
      },
      {
        key: "buDonem",
        label: "Bu dönem",
        align: "right" as const,
        sortValue: (r: GiderMerkeziRow) => r._current,
        filterValue: (r: GiderMerkeziRow) => r.buDonem,
        render: (r: GiderMerkeziRow) => moneyCell(r.buDonem, r._current, "violet"),
      },
      {
        key: "oncekiDonem",
        label: "Önceki dönem",
        align: "right" as const,
        sortValue: (r: GiderMerkeziRow) => r._previous,
        filterValue: (r: GiderMerkeziRow) => r.oncekiDonem,
        render: (r: GiderMerkeziRow) => moneyCell(r.oncekiDonem, r._previous, "slate"),
      },
      {
        key: "degisim",
        label: "Değişim",
        align: "right" as const,
        sortValue: (r: GiderMerkeziRow) => r._changePct,
        filterValue: (r: GiderMerkeziRow) => r.degisim,
        render: (r: GiderMerkeziRow) => degisimCell(r),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "buDonem", asc: false }}
      searchKeys={["kategori", "trend"]}
      searchPlaceholder="Gider türü veya trend ara…"
      filterKeys={[...GIDER_MERKEZI_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "buDonem",
        fields: [
          { id: "buDonem", label: "Bu dönem", getValue: (r: GiderMerkeziRow) => r._current },
          { id: "onceki", label: "Önceki dönem", getValue: (r: GiderMerkeziRow) => r._previous },
        ],
      }}
      minTableWidth="900px"
      emptyText="Gider kaydı yok"
      emptyHint="Seçili dönemde gider bulunmuyor."
    />
  );
}
