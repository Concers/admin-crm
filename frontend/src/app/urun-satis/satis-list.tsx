"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  buildSatisDataColumns,
  SATIS_AMOUNT_FILTER,
  SATIS_PRIMARY_FILTER_KEYS,
  SATIS_SEARCH_KEYS,
} from "@/lib/satis-table-cells";
import { deleteSatis } from "./actions";
import { SatisModal } from "./satis-modal";
import type { SatisTableRow } from "./satis-rows";

export type SatisRow = SatisTableRow;

export function SatisWorkspace({
  rows,
  urunler,
  musteriler,
}: {
  rows: SatisTableRow[];
  urunler: string[];
  musteriler: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SatisTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Satış Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni satış ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <SatisList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <SatisModal
          mode="create"
          urunler={urunler}
          musteriler={musteriler}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <SatisModal
          mode="edit"
          row={editing}
          urunler={urunler}
          musteriler={musteriler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function SatisList({
  rows,
  onEdit,
}: {
  rows: SatisTableRow[];
  onEdit: (row: SatisTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...buildSatisDataColumns(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: SatisTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "yil", asc: false }}
      searchPlaceholder="Ürün, müşteri, raf, not veya ay ara…"
      searchKeys={[...SATIS_SEARCH_KEYS]}
      filterKeys={[...SATIS_PRIMARY_FILTER_KEYS]}
      amountFilter={SATIS_AMOUNT_FILTER}
      columns={columns}
      minTableWidth="2200px"
      emptyText="Henüz satış kaydı yok"
      emptyHint="Yukarıdaki butonla ilk satışınızı ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: SatisTableRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        title="Düzenle"
        aria-label="Düzenle"
        className="h-8 w-8"
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
          if (confirm(`"${row.urunAdi}" satış kaydı silinsin mi?`)) {
            run(() => deleteSatis(row.id), { success: "Satış kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
