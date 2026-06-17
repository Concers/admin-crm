"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "../delete-button";
import { deleteQuoteAction } from "./actions";

export type TeklifRow = {
  id: number;
  tarih: string;
  cari: string;
  gecerlilik: string;
  durum: string;
  toplam: string;
  kdvDahil: string;
};

export function TeklifList({ rows }: { rows: TeklifRow[] }) {
  return (
    <DataTable<TeklifRow>
      rows={rows}
      searchKeys={["cari", "durum"]}
      columns={[
        { key: "tarih", label: "Tarih" },
        { key: "cari", label: "Cari" },
        { key: "gecerlilik", label: "Geçerlilik" },
        { key: "durum", label: "Durum" },
        { key: "toplam", label: "Toplam" },
        { key: "kdvDahil", label: "KDV Dahil" },
        {
          key: "sil",
          label: "",
          sortable: false,
          render: (row) => (
            <DeleteButton
              id={row.id}
              action={deleteQuoteAction}
              success="Teklif silindi."
            />
          ),
        },
      ]}
    />
  );
}
