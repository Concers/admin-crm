"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import {
  buildGiderDataColumns,
  GIDER_AMOUNT_FILTER,
  GIDER_PRIMARY_FILTER_KEYS,
  GIDER_SEARCH_KEYS,
} from "@/lib/gider-table-cells";
import type { GiderTableRow } from "@/app/gider-girisi/gider-rows";

export function GiderRaporTable({ rows }: { rows: GiderTableRow[] }) {
  const columns = useMemo(() => buildGiderDataColumns(), []);

  return (
    <DataTable
      rows={rows}
      defaultSort={{ key: "yil", asc: false }}
      searchPlaceholder="Gider türü, tedarikçi, fatura no, ürün…"
      searchKeys={[...GIDER_SEARCH_KEYS]}
      filterKeys={[...GIDER_PRIMARY_FILTER_KEYS]}
      amountFilter={GIDER_AMOUNT_FILTER}
      columns={columns}
      minTableWidth="1600px"
      emptyText="Seçilen dönemde gider kaydı yok"
      emptyHint="Filtreyi değiştirin veya Gider Girişi sayfasından yeni kayıt ekleyin."
    />
  );
}
