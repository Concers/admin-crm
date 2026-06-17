"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/app/belgeler/delete-button";
import { deleteProductionOrderAction } from "./actions";

export type EmirRow = {
  id: number;
  mamul: string;
  miktar: string;
  durum: string;
  baslangic: string;
};

export function EmirList({ rows }: { rows: EmirRow[] }) {
  return (
    <DataTable<EmirRow>
      rows={rows}
      searchKeys={["mamul", "durum"]}
      columns={[
        { key: "mamul", label: "Mamul" },
        { key: "miktar", label: "Miktar" },
        { key: "durum", label: "Durum" },
        { key: "baslangic", label: "Başlangıç" },
        {
          key: "sil",
          label: "",
          sortable: false,
          render: (row) => (
            <DeleteButton
              id={row.id}
              action={deleteProductionOrderAction}
              success="Üretim emri silindi."
            />
          ),
        },
      ]}
    />
  );
}
