"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarClock,
  ClipboardList,
  Factory,
  Package,
  Pencil,
  StickyNote,
  Trash2,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { EMIR_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteEmir } from "./actions";
import { EmirModal } from "./emir-modal";
import { TalepFormuAction } from "./talep-formu-action";
import type { EmirTableRow, ReceteOption } from "./emir-rows";

const COLUMNS = [
  { key: "mamul", label: "Mamul" },
  { key: "recete", label: "Reçete" },
  { key: "miktar", label: "Miktar" },
  { key: "durum", label: "Durum" },
  { key: "baslangic", label: "Başlangıç" },
  { key: "bitis", label: "Bitiş" },
  { key: "notlar", label: "Notlar" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  PLANNED: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  IN_PROGRESS: "bg-amber-50 text-amber-800 ring-amber-100",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-100",
};

function DurumBadge({ durum, status }: { durum: string; status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        STATUS_STYLES[status] ?? "bg-[var(--muted)] ring-[var(--border)]"
      )}
    >
      {durum}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: EmirTableRow) => ReactNode> = {
  mamul: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        <Package className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.mamul}</span>
    </div>
  ),
  recete: (r) =>
    r.recete !== "—" ? (
      <span className="inline-flex max-w-[12rem] items-center gap-1 truncate text-sm">
        <ClipboardList className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.recete}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  miktar: (r) => (
    <span className="inline-flex min-w-[2rem] justify-end rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      {r.miktar}
    </span>
  ),
  durum: (r) => <DurumBadge durum={r.durum} status={r._status} />,
  baslangic: (r) =>
    r.baslangic !== "—" ? (
      <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.baslangic}</span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  bitis: (r) =>
    r.bitis !== "—" ? (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm tabular-nums text-[var(--muted-foreground)]">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
        {r.bitis}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  notlar: (r) =>
    r.notlar ? (
      <span
        className="inline-flex max-w-[160px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={r.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {r.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
};

export function EmirWorkspace({
  rows,
  products,
  receteler,
  ureticiler,
}: {
  rows: EmirTableRow[];
  products: { id: number; name: string }[];
  receteler: ReceteOption[];
  ureticiler: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EmirTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Üretim Emri Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni üretim emri ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <EmirList rows={rows} onEdit={setEditing} ureticiler={ureticiler} />
      {createOpen && (
        <EmirModal
          mode="create"
          products={products}
          receteler={receteler}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <EmirModal
          mode="edit"
          row={editing}
          products={products}
          receteler={receteler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function EmirList({
  rows,
  onEdit,
  ureticiler,
}: {
  rows: EmirTableRow[];
  onEdit: (row: EmirTableRow) => void;
  ureticiler: { id: number; name: string }[];
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "miktar"
            ? (r: EmirTableRow) => r._quantity
            : col.key === "baslangic"
              ? (r: EmirTableRow) => r._startDate ?? ""
              : col.key === "bitis"
                ? (r: EmirTableRow) => r._endDate ?? ""
                : undefined,
        align: col.key === "miktar" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: EmirTableRow) => {
          if (col.key === "mamul") return r.mamul;
          if (col.key === "recete") return r.recete;
          if (col.key === "durum") return r.durum;
          if (col.key === "notlar") return r.notlar;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: EmirTableRow) => (
          <RowActions row={row} onEdit={() => onEdit(row)} ureticiler={ureticiler} />
        ),
      },
    ],
    [onEdit, ureticiler]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "baslangic", asc: false }}
      searchKeys={["mamul", "recete", "durum", "notlar"]}
      searchPlaceholder="Mamul, reçete veya durum ara…"
      filterKeys={[...EMIR_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "miktar",
        fields: [{ id: "miktar", label: "Miktar", getValue: (r) => r._quantity }],
      }}
      columns={columns}
      emptyText="Henüz üretim emri yok"
      emptyHint="Yukarıdaki butonla ilk üretim emrini ekleyebilirsiniz."
    />
  );
}

function RowActions({
  row,
  onEdit,
  ureticiler,
}: {
  row: EmirTableRow;
  onEdit: () => void;
  ureticiler: { id: number; name: string }[];
}) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <TalepFormuAction orderId={row.id} mamul={row.mamul} ureticiler={ureticiler} />
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
          if (confirm(`"${row.mamul}" üretim emri silinsin mi?`)) {
            run(() => deleteEmir(row.id), { success: "Üretim emri silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
