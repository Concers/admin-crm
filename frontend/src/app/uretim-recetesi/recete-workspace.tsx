"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ClipboardList, Layers, Package, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteRecete } from "./actions";
import { ReceteModal } from "./recete-modal";
import type { ReceteTableRow } from "./recete-rows";

const COLUMNS = [
  { key: "ad", label: "Reçete Adı" },
  { key: "mamul", label: "Mamul" },
  { key: "bilesenSayisi", label: "Bileşen" },
  { key: "durum", label: "Durum" },
] as const;

function DurumBadge({ durum, active }: { durum: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-slate-50 text-slate-600 ring-slate-200"
      )}
    >
      {durum}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: ReceteTableRow) => ReactNode> = {
  ad: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <ClipboardList className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.ad}</span>
    </div>
  ),
  mamul: (r) => (
    <div className="flex min-w-0 max-w-[12rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
        <Package className="h-3.5 w-3.5" />
      </span>
      <span className="truncate text-sm">{r.mamul}</span>
    </div>
  ),
  bilesenSayisi: (r) => (
    <span className="inline-flex min-w-[2rem] items-center justify-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      <Layers className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      {r.bilesenSayisi}
    </span>
  ),
  durum: (r) => <DurumBadge durum={r.durum} active={r._isActive} />,
};

export function ReceteWorkspace({
  rows,
  products,
}: {
  rows: ReceteTableRow[];
  products: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ReceteTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Reçete Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni reçete ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <ReceteList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <ReceteModal mode="create" products={products} onClose={() => setCreateOpen(false)} />
      )}
      {editing && (
        <ReceteModal
          mode="edit"
          row={editing}
          products={products}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ReceteList({
  rows,
  onEdit,
}: {
  rows: ReceteTableRow[];
  onEdit: (row: ReceteTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "bilesenSayisi"
            ? (r: ReceteTableRow) => r.bilesenSayisi
            : undefined,
        align: col.key === "bilesenSayisi" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: ReceteTableRow) => {
          if (col.key === "ad") return r.ad;
          if (col.key === "mamul") return r.mamul;
          if (col.key === "durum") return r.durum;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: ReceteTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "ad", asc: true }}
      searchKeys={["ad", "mamul", "durum"]}
      searchPlaceholder="Reçete veya mamul ara…"
      columns={columns}
      emptyText="Henüz reçete kaydı yok"
      emptyHint="Yukarıdaki butonla ilk reçetenizi ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: ReceteTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.ad}" reçetesi silinsin mi?`)) {
            run(() => deleteRecete(row.id), { success: "Reçete silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
