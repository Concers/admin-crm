"use client";

import { useMemo, useState, type ReactNode } from "react";
import { MapPin, Pencil, Trash2, Warehouse } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteDepo } from "./actions";
import { DepoModal } from "./depo-modal";
import type { DepoTableRow } from "./depo-rows";

const COLUMNS = [
  { key: "depo", label: "Depo" },
  { key: "lokasyon", label: "Lokasyon" },
  { key: "hareket", label: "Hareket" },
] as const;

const CELL_RENDERERS: Record<string, (row: DepoTableRow) => ReactNode> = {
  depo: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        <Warehouse className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.depo}</span>
    </div>
  ),
  lokasyon: (r) =>
    r.lokasyon !== "—" ? (
      <span className="inline-flex max-w-[16rem] items-center gap-1.5 truncate text-sm">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.lokasyon}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  hareket: (r) => (
    <span className="inline-flex min-w-[2rem] justify-center rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      {r.hareket}
    </span>
  ),
};

export function DepoWorkspace({ rows }: { rows: DepoTableRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DepoTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Depo Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni depo ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <DepoList rows={rows} onEdit={setEditing} />
      {createOpen && <DepoModal mode="create" onClose={() => setCreateOpen(false)} />}
      {editing && (
        <DepoModal mode="edit" row={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function DepoList({
  rows,
  onEdit,
}: {
  rows: DepoTableRow[];
  onEdit: (row: DepoTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "hareket" ? (r: DepoTableRow) => r.hareket : undefined,
        align: col.key === "hareket" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: DepoTableRow) => {
          if (col.key === "depo") return r.depo;
          if (col.key === "lokasyon") return r.lokasyon;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: DepoTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "depo", asc: true }}
      searchKeys={["depo", "lokasyon"]}
      searchPlaceholder="Depo veya lokasyon ara…"
      columns={columns}
      emptyText="Henüz depo kaydı yok"
      emptyHint="Yukarıdaki butonla ilk deponuzu ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: DepoTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.depo}" deposu silinsin mi?`)) {
            run(() => deleteDepo(row.id), { success: "Depo silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
