"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, StickyNote, Trash2, Truck } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { TEDARIKCI_ODEME_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteOdeme } from "./actions";
import { OdemeModal } from "./odeme-modal";
import type { OdemeTableRow } from "./odeme-rows";

export type OdemeRow = OdemeTableRow;

const CELL_RENDERERS: Record<string, (row: OdemeTableRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  tedarikciAdi: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <Truck className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.tedarikciAdi}</span>
    </div>
  ),
  odenenTutar: (r) => (
    <span className="font-semibold tabular-nums text-rose-700">{r.odenenTutar}</span>
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
  { key: "tedarikciAdi", label: "Tedarikçi / Hizmet Sağlayıcı" },
  { key: "hesap", label: "Hesap" },
  { key: "odenenTutar", label: "Ödenen Tutar" },
  { key: "notlar", label: "Notlar" },
] as const;

export function OdemeWorkspace({
  rows,
  tedarikciler,
  accounts,
}: {
  rows: OdemeTableRow[];
  tedarikciler: string[];
  accounts: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<OdemeTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Ödeme Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni ödeme ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <OdemeList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <OdemeModal mode="create" tedarikciler={tedarikciler} accounts={accounts} onClose={() => setCreateOpen(false)} />
      )}
      {editing && (
        <OdemeModal
          mode="edit"
          row={editing}
          tedarikciler={tedarikciler}
          accounts={accounts}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function OdemeList({
  rows,
  onEdit,
}: {
  rows: OdemeTableRow[];
  onEdit: (row: OdemeTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "tarih"
            ? (r: OdemeTableRow) => r._date
            : col.key === "odenenTutar"
              ? (r: OdemeTableRow) => r._amount
              : undefined,
        align: col.key === "odenenTutar" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: OdemeTableRow) =>
          col.key === "tedarikciAdi"
            ? r.tedarikciAdi
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
        render: (row: OdemeTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["tedarikciAdi", "notlar", "tarih"]}
      searchPlaceholder="Tedarikçi, not veya tarih ara…"
      filterKeys={[...TEDARIKCI_ODEME_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "tutar",
        fields: [{ id: "tutar", label: "Ödenen Tutar", getValue: (r) => r._amount }],
      }}
      columns={columns}
      emptyText="Henüz ödeme kaydı yok"
      emptyHint="Yukarıdaki butonla ilk ödemenizi ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: OdemeTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.tedarikciAdi}" ödeme kaydı silinsin mi?`)) {
            run(() => deleteOdeme(row.id), { success: "Ödeme kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
