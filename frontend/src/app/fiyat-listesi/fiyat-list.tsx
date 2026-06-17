"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "@/app/belgeler/delete-button";
import { deletePriceListAction } from "./actions";

export type FiyatRow = {
  id: number;
  ad: string;
  paraBirimi: string;
  kalemSayisi: number;
};

export function FiyatList({ rows }: { rows: FiyatRow[] }) {
  return (
    <DataTable<FiyatRow>
      rows={rows}
      searchKeys={["ad", "paraBirimi"]}
      columns={[
        { key: "ad", label: "Liste Adı" },
        { key: "paraBirimi", label: "Para Birimi" },
        { key: "kalemSayisi", label: "Kalem Sayısı" },
        {
          key: "sil",
          label: "",
          sortable: false,
          render: (row) => (
            <DeleteButton
              id={row.id}
              action={deletePriceListAction}
              success="Fiyat listesi silindi."
            />
          ),
        },
      ]}
    />
  );
}
