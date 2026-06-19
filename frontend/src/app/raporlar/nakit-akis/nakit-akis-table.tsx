"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { NAKIT_AKIS_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { cn } from "@/lib/utils";
import type { NakitAkisDurum, NakitAkisRow } from "./nakit-akis-rows";

const DURUM_TONE: Record<NakitAkisDurum, "green" | "red" | "amber"> = {
  Pozitif: "green",
  Negatif: "red",
  Dengede: "amber",
};

function moneyCell(value: string, tone?: "emerald" | "rose" | "slate" | "default") {
  const styles = {
    emerald: "font-semibold text-emerald-800",
    rose: "font-semibold text-rose-800",
    slate: "font-medium text-slate-700",
    default: "font-medium tabular-nums text-[var(--foreground)]",
  };
  return <span className={cn("tabular-nums", styles[tone ?? "default"])}>{value}</span>;
}

function netCell(row: NakitAkisRow) {
  const tone =
    row.durum === "Pozitif" ? "text-emerald-700 font-semibold" : row.durum === "Negatif" ? "text-rose-700 font-semibold" : "";
  return <span className={cn("tabular-nums", tone)}>{row.net}</span>;
}

function kumulatifCell(row: NakitAkisRow) {
  const tone =
    row._cumulative > 0 ? "text-emerald-800 font-semibold" : row._cumulative < 0 ? "text-rose-800 font-semibold" : "";
  return <span className={cn("tabular-nums", tone)}>{row.kumulatif}</span>;
}

export function NakitAkisTable({ rows }: { rows: NakitAkisRow[] }) {
  const columns = useMemo(
    () => [
      {
        key: "ay",
        label: "Ay",
        sortValue: (r: NakitAkisRow) => r.ayKey,
        filterValue: (r: NakitAkisRow) => r.ay,
        render: (r: NakitAkisRow) => (
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <CalendarDays className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium">{r.ay}</span>
          </div>
        ),
      },
      {
        key: "durum",
        label: "Durum",
        sortValue: (r: NakitAkisRow) => r.durum,
        filterValue: (r: NakitAkisRow) => r.durum,
        render: (r: NakitAkisRow) => <Badge tone={DURUM_TONE[r.durum]}>{r.durum}</Badge>,
      },
      {
        key: "giris",
        label: "Giriş",
        align: "right" as const,
        sortValue: (r: NakitAkisRow) => r._inflow,
        filterValue: (r: NakitAkisRow) => r.giris,
        render: (r: NakitAkisRow) => moneyCell(r.giris, "emerald"),
      },
      {
        key: "cikis",
        label: "Çıkış",
        align: "right" as const,
        sortValue: (r: NakitAkisRow) => r._outflow,
        filterValue: (r: NakitAkisRow) => r.cikis,
        render: (r: NakitAkisRow) => moneyCell(r.cikis, "rose"),
      },
      {
        key: "net",
        label: "Net",
        align: "right" as const,
        sortValue: (r: NakitAkisRow) => r._net,
        filterValue: (r: NakitAkisRow) => r.net,
        render: (r: NakitAkisRow) => netCell(r),
      },
      {
        key: "kumulatif",
        label: "Kümülatif",
        align: "right" as const,
        sortValue: (r: NakitAkisRow) => r._cumulative,
        filterValue: (r: NakitAkisRow) => r.kumulatif,
        render: (r: NakitAkisRow) => kumulatifCell(r),
      },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "ay", asc: true }}
      searchKeys={["ay", "durum"]}
      searchPlaceholder="Ay veya durum ara…"
      filterKeys={[...NAKIT_AKIS_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "net",
        fields: [
          { id: "giris", label: "Giriş", getValue: (r: NakitAkisRow) => r._inflow },
          { id: "cikis", label: "Çıkış", getValue: (r: NakitAkisRow) => r._outflow },
          { id: "net", label: "Net", getValue: (r: NakitAkisRow) => r._net },
          { id: "kumulatif", label: "Kümülatif", getValue: (r: NakitAkisRow) => r._cumulative },
        ],
      }}
      minTableWidth="960px"
      emptyText="Projeksiyon verisi yok"
      emptyHint="Seçili dönemde beklenen nakit hareketi bulunmuyor."
    />
  );
}
