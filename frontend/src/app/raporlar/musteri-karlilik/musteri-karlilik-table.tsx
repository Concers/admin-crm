"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { MUSTERI_KARLILIK_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { KarlilikDurum, MusteriKarlilikRow } from "./musteri-karlilik-rows";

const DURUM_TONE: Record<KarlilikDurum, "green" | "red" | "default"> = {
  Kârlı: "green",
  Zararlı: "red",
  Başabaş: "default",
};

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

function marjBar(pct: number) {
  const color = pct < 0 ? "bg-rose-500" : pct < 15 ? "bg-amber-500" : "bg-emerald-500";
  const width = Math.min(100, Math.max(0, Math.abs(pct)));
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${width}%` }} />
      </div>
      <span
        className={cn(
          "w-12 text-right text-xs font-medium tabular-nums",
          pct < 0 ? "text-rose-700" : pct < 15 ? "text-amber-800" : "text-emerald-700"
        )}
      >
        %{pct.toFixed(1)}
      </span>
    </div>
  );
}

export function MusteriKarlilikTable({ rows }: { rows: MusteriKarlilikRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "musteri",
        label: "Müşteri",
        sortValue: (r: MusteriKarlilikRow) => r.musteri,
        filterValue: (r: MusteriKarlilikRow) => r.musteri,
        render: (r: MusteriKarlilikRow) => (
          <div className="flex min-w-0 max-w-[18rem] items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Users className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium" title={r.musteri}>
                {r.musteri}
              </p>
              <Link
                href={`/raporlar/musteri?ad=${encodeURIComponent(r.musteri)}`}
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
        key: "durum",
        label: "Durum",
        sortValue: (r: MusteriKarlilikRow) => r.durum,
        filterValue: (r: MusteriKarlilikRow) => r.durum,
        render: (r: MusteriKarlilikRow) => <Badge tone={DURUM_TONE[r.durum]}>{r.durum}</Badge>,
      },
      {
        key: "ciro",
        label: "Ciro",
        align: "right" as const,
        sortValue: (r: MusteriKarlilikRow) => r._revenue,
        filterValue: (r: MusteriKarlilikRow) => r.ciro,
        render: (r: MusteriKarlilikRow) => moneyCell(r.ciro, r._revenue, "blue"),
      },
      {
        key: "maliyet",
        label: "Maliyet",
        align: "right" as const,
        sortValue: (r: MusteriKarlilikRow) => r._cost,
        filterValue: (r: MusteriKarlilikRow) => r.maliyet,
        render: (r: MusteriKarlilikRow) => moneyCell(r.maliyet, r._cost, "amber"),
      },
      {
        key: "kar",
        label: "Kâr",
        align: "right" as const,
        sortValue: (r: MusteriKarlilikRow) => r._profit,
        filterValue: (r: MusteriKarlilikRow) => r.kar,
        render: (r: MusteriKarlilikRow) =>
          moneyCell(r.kar, r._profit, r._profit > 0 ? "emerald" : r._profit < 0 ? "rose" : "default"),
      },
      {
        key: "marj",
        label: "Marj",
        sortValue: (r: MusteriKarlilikRow) => r._marginPct,
        filterValue: (r: MusteriKarlilikRow) => r.marj,
        render: (r: MusteriKarlilikRow) => marjBar(r._marginPct),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "kar", asc: false }}
      searchKeys={["musteri", "durum"]}
      searchPlaceholder="Müşteri veya durum ara…"
      filterKeys={[...MUSTERI_KARLILIK_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "kar",
        fields: [
          { id: "kar", label: "Kâr", getValue: (r: MusteriKarlilikRow) => r._profit },
          { id: "ciro", label: "Ciro", getValue: (r: MusteriKarlilikRow) => r._revenue },
          { id: "maliyet", label: "Maliyet", getValue: (r: MusteriKarlilikRow) => r._cost },
        ],
      }}
      minTableWidth="980px"
      emptyText="Kârlılık verisi yok"
      emptyHint="Henüz satışı olan müşteri bulunmuyor."
    />
  );
}
