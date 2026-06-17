"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "../delete-button";
import { deleteOrderAction } from "./actions";

export type SiparisRow = {
  id: number;
  tarih: string;
  tur: string;
  cari: string;
  durum: string;
  toplam: string;
  kdvDahil: string;
};

export function SiparisList({ rows }: { rows: SiparisRow[] }) {
  return (
    <DataTable<SiparisRow>
      rows={rows}
      searchKeys={["cari", "tur"]}
      columns={[
        { key: "tarih", label: "Tarih" },
        { key: "tur", label: "Tür" },
        { key: "cari", label: "Cari" },
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
              action={deleteOrderAction}
              success="Sipariş silindi."
            />
          ),
        },
      ]}
    />
  );
}
