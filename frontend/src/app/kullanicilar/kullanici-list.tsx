"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "./delete-button";

type Row = { id: number; ad: string; eposta: string; rol: string; durum: string };

export function KullaniciList({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      searchKeys={["ad", "eposta", "rol"]}
      columns={[
        { key: "ad", label: "Ad" },
        { key: "eposta", label: "E-posta" },
        { key: "rol", label: "Rol" },
        { key: "durum", label: "Durum" },
        { key: "sil", label: "", sortable: false, render: (row: Row) => <DeleteButton id={row.id} name={row.ad} /> },
      ]}
    />
  );
}
