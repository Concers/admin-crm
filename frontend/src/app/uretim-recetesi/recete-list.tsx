"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/app/belgeler/delete-button";
import { deleteBomAction } from "./actions";

export type ReceteRow = {
  id: number;
  ad: string;
  mamul: string;
  bilesenSayisi: number;
};

export function ReceteList({ rows }: { rows: ReceteRow[] }) {
  return (
    <DataTable<ReceteRow>
      rows={rows}
      searchKeys={["ad", "mamul"]}
      columns={[
        { key: "ad", label: "Reçete Adı" },
        { key: "mamul", label: "Mamul" },
        { key: "bilesenSayisi", label: "Bileşen Sayısı" },
        {
          key: "sil",
          label: "",
          sortable: false,
          render: (row) => (
            <DeleteButton
              id={row.id}
              action={deleteBomAction}
              success="Reçete silindi."
            />
          ),
        },
      ]}
    />
  );
}
