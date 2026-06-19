"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, StickyNote, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { TAHSILAT_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteTahsilat } from "./actions";
import { TahsilatModal } from "./tahsilat-modal";
import type { TahsilatTableRow } from "./tahsilat-rows";

export type TahsilatRow = TahsilatTableRow;

const CELL_RENDERERS: Record<string, (row: TahsilatTableRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  musteriAdi: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <Users className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.musteriAdi}</span>
    </div>
  ),
  tahsilatTutari: (r) => (
    <span className="font-semibold tabular-nums text-emerald-700">{r.tahsilatTutari}</span>
  ),
  notlar: (r) =>
    r.notlar ? (
      <span
        className="inline-flex max-w-[200px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={r.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {r.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
};

const COLUMNS = [
  { key: "tarih", label: "Tarih" },
  { key: "musteriAdi", label: "Müşteri" },
  { key: "hesap", label: "Hesap" },
  { key: "tahsilatTutari", label: "Tahsilat Tutarı" },
  { key: "notlar", label: "Notlar" },
] as const;

export function TahsilatWorkspace({
  rows,
  musteriler,
  accounts,
}: {
  rows: TahsilatTableRow[];
  musteriler: string[];
  accounts: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TahsilatTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Tahsilat Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni tahsilat ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <TahsilatList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <TahsilatModal mode="create" musteriler={musteriler} accounts={accounts} onClose={() => setCreateOpen(false)} />
      )}
      {editing && (
        <TahsilatModal
          mode="edit"
          row={editing}
          musteriler={musteriler}
          accounts={accounts}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function TahsilatList({
  rows,
  onEdit,
}: {
  rows: TahsilatTableRow[];
  onEdit: (row: TahsilatTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "tarih"
            ? (r: TahsilatTableRow) => r._date
            : col.key === "tahsilatTutari"
              ? (r: TahsilatTableRow) => r._amount
              : undefined,
        align: col.key === "tahsilatTutari" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: TahsilatTableRow) =>
          col.key === "musteriAdi"
            ? r.musteriAdi
            : col.key === "hesap"
              ? r.hesap
              : col.key === "notlar"
                ? r.notlar
                : String((r as Record<string, unknown>)[col.key] ?? ""),
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: TahsilatTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["musteriAdi", "notlar", "tarih"]}
      searchPlaceholder="Müşteri, not veya tarih ara…"
      filterKeys={[...TAHSILAT_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "tutar",
        fields: [{ id: "tutar", label: "Tahsilat Tutarı", getValue: (r) => r._amount }],
      }}
      columns={columns}
      emptyText="Henüz tahsilat kaydı yok"
      emptyHint="Yukarıdaki butonla ilk tahsilatınızı ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: TahsilatTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.musteriAdi}" tahsilat kaydı silinsin mi?`)) {
            run(() => deleteTahsilat(row.id), { success: "Tahsilat kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
