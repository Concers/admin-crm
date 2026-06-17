"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/app/belgeler/delete-button";
import { deleteDiscountAction } from "./actions";

export type IskontoRow = {
  id: number;
  ad: string;
  yuzde: string;
  tutar: string;
  gecerlilik: string;
};

export function IskontoList({ rows }: { rows: IskontoRow[] }) {
  return (
    <DataTable<IskontoRow>
      rows={rows}
      searchKeys={["ad"]}
      columns={[
        { key: "ad", label: "Ad" },
        { key: "yuzde", label: "Yüzde" },
        { key: "tutar", label: "Tutar" },
        { key: "gecerlilik", label: "Geçerlilik" },
        {
          key: "sil",
          label: "",
          sortable: false,
          render: (row) => (
            <DeleteButton
              id={row.id}
              action={deleteDiscountAction}
              success="İskonto silindi."
            />
          ),
        },
      ]}
    />
  );
}
