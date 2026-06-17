"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "../delete-button";
import { deleteInvoiceAction } from "./actions";

export type FaturaRow = {
  id: number;
  faturaNo: string;
  tarih: string;
  tur: string;
  cari: string;
  vade: string;
  durum: string;
  toplam: string;
};

export function FaturaList({ rows }: { rows: FaturaRow[] }) {
  return (
    <DataTable<FaturaRow>
      rows={rows}
      searchKeys={["faturaNo", "cari", "durum"]}
      columns={[
        { key: "faturaNo", label: "Fatura No" },
        { key: "tarih", label: "Tarih" },
        { key: "tur", label: "Tür" },
        { key: "cari", label: "Cari" },
        { key: "vade", label: "Vade" },
        { key: "durum", label: "Durum" },
        { key: "toplam", label: "Toplam" },
        {
          key: "sil",
          label: "",
          sortable: false,
          render: (row) => (
            <DeleteButton
              id={row.id}
              action={deleteInvoiceAction}
              success="Fatura silindi."
            />
          ),
        },
      ]}
    />
  );
}
