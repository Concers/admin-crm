"use client";

import { DataTable } from "@/components/data-table";
import { DeleteButton } from "./delete-button";

type Row = { id: number; depo: string; lokasyon: string; name: string };

export function DepoList({ rows }: { rows: Row[] }) {
  return (
    <DataTable
      rows={rows}
      searchKeys={["depo", "lokasyon"]}
      columns={[
        { key: "depo", label: "Depo" },
        { key: "lokasyon", label: "Lokasyon" },
        { key: "sil", label: "", sortable: false, render: (row: Row) => <DeleteButton id={row.id} name={row.name} /> },
      ]}
    />
  );
}
