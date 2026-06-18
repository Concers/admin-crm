"use client";

import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  buildGiderDataColumns,
  GIDER_AMOUNT_FILTER,
  GIDER_SEARCH_KEYS,
} from "@/lib/gider-table-cells";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteGider } from "./actions";
import type { GiderTableRow } from "./gider-rows";

function RowActions({
  row,
  onEdit,
}: {
  row: GiderTableRow;
  onEdit: () => void;
}) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        title="Düzenle"
        aria-label="Düzenle"
        className="h-8 w-8"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        title="Sil"
        aria-label="Sil"
        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => {
          if (confirm(`"${row.giderTuru}" gider kaydı silinsin mi?`)) {
            run(() => deleteGider(row.id), { success: "Gider kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function GiderTable({
  rows,
  onEdit,
}: {
  rows: GiderTableRow[];
  onEdit: (row: GiderTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...buildGiderDataColumns(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: GiderTableRow) => (
          <RowActions row={row} onEdit={() => onEdit(row)} />
        ),
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "yil", asc: false }}
      searchPlaceholder="Gider türü, tedarikçi, fatura no, ürün…"
      searchKeys={[...GIDER_SEARCH_KEYS]}
      amountFilter={GIDER_AMOUNT_FILTER}
      columns={columns}
      minTableWidth="1600px"
      emptyText="Henüz gider kaydı yok"
      emptyHint="Yukarıdaki butonla yeni gider ekleyebilirsiniz veya filtreleri temizleyin."
    />
  );
}
