"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { SATIS_TEMSILCISI_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import type { SatisTemsilcisiDurum, SatisTemsilcisiRow } from "./satis-temsilcisi-rows";

const DURUM_TONE: Record<SatisTemsilcisiDurum, "green" | "red" | "amber"> = {
  Kârlı: "green",
  Zararlı: "red",
  Başabaş: "amber",
};

export function SatisTemsilcisiTable({ rows }: { rows: SatisTemsilcisiRow[] }) {
  const columns = useMemo(
    () => [
      { key: "temsilci", label: "Temsilci", sortValue: (r: SatisTemsilcisiRow) => r.temsilci },
      {
        key: "durum",
        label: "Durum",
        filterValue: (r: SatisTemsilcisiRow) => r.durum,
        render: (r: SatisTemsilcisiRow) => <Badge tone={DURUM_TONE[r.durum]}>{r.durum}</Badge>,
      },
      { key: "siparis", label: "Sipariş", align: "right" as const, sortValue: (r: SatisTemsilcisiRow) => r._orders },
      { key: "ciro", label: "Ciro", align: "right" as const, sortValue: (r: SatisTemsilcisiRow) => r._revenue },
      { key: "maliyet", label: "Maliyet", align: "right" as const, sortValue: (r: SatisTemsilcisiRow) => r._cost },
      {
        key: "kar",
        label: "Net kâr",
        align: "right" as const,
        sortValue: (r: SatisTemsilcisiRow) => r._profit,
        render: (r: SatisTemsilcisiRow) => (
          <span className={r._profit >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
            {r.kar}
          </span>
        ),
      },
      { key: "marj", label: "Marj", align: "right" as const, sortValue: (r: SatisTemsilcisiRow) => r._marginPct },
    ],
    []
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      defaultSort={{ key: "kar", asc: false }}
      searchKeys={["temsilci", "durum"]}
      filterKeys={[...SATIS_TEMSILCISI_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "kar",
        fields: [
          { id: "ciro", label: "Ciro", getValue: (r: SatisTemsilcisiRow) => r._revenue },
          { id: "kar", label: "Net kâr", getValue: (r: SatisTemsilcisiRow) => r._profit },
        ],
      }}
      emptyText="Veri yok"
    />
  );
}
