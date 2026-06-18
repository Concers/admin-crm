"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Layers,
  Pencil,
  Tags,
  Trash2,
  Users,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteFiyatListesi } from "./actions";
import { FiyatModal } from "./fiyat-modal";
import type { FiyatTableRow } from "./fiyat-rows";

const COLUMNS = [
  { key: "ad", label: "Liste Adı" },
  { key: "paraBirimi", label: "Para Birimi" },
  { key: "segment", label: "Segment" },
  { key: "kalemSayisi", label: "Kalem" },
  { key: "ortalamaFiyat", label: "Ort. Fiyat" },
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

const CELL_RENDERERS: Record<string, (row: FiyatTableRow) => ReactNode> = {
  ad: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Tags className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.ad}</span>
    </div>
  ),
  paraBirimi: (r) => (
    <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs font-semibold uppercase">
      {r.paraBirimi}
    </span>
  ),
  segment: (r) =>
    r.segment !== "—" ? (
      <span className="inline-flex max-w-[10rem] items-center gap-1 truncate text-sm">
        <Users className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.segment}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  kalemSayisi: (r) => (
    <span className="inline-flex min-w-[2rem] items-center justify-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      <Layers className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      {r.kalemSayisi}
    </span>
  ),
  ortalamaFiyat: (r) =>
    r.ortalamaFiyat !== "—" ? (
      <span className="font-semibold tabular-nums text-blue-700">{r.ortalamaFiyat}</span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  durum: (r) => <DurumBadge durum={r.durum} active={r._isActive} />,
};

export function FiyatWorkspace({
  rows,
  products,
}: {
  rows: FiyatTableRow[];
  products: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FiyatTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Fiyat Listesi Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni fiyat listesi ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <FiyatList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <FiyatModal mode="create" products={products} onClose={() => setCreateOpen(false)} />
      )}
      {editing && (
        <FiyatModal
          mode="edit"
          row={editing}
          products={products}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function FiyatList({
  rows,
  onEdit,
}: {
  rows: FiyatTableRow[];
  onEdit: (row: FiyatTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "kalemSayisi"
            ? (r: FiyatTableRow) => r.kalemSayisi
            : col.key === "ortalamaFiyat"
              ? (r: FiyatTableRow) => r._avgPrice
              : undefined,
        align:
          col.key === "kalemSayisi" || col.key === "ortalamaFiyat"
            ? ("right" as const)
            : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: FiyatTableRow) => {
          if (col.key === "ad") return r.ad;
          if (col.key === "segment") return r.segment;
          if (col.key === "durum") return r.durum;
          if (col.key === "paraBirimi") return r.paraBirimi;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: FiyatTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "ad", asc: true }}
      searchKeys={["ad", "paraBirimi", "segment", "durum"]}
      searchPlaceholder="Liste adı, para birimi veya segment ara…"
      amountFilter={{
        defaultField: "fiyat",
        fields: [{ id: "fiyat", label: "Ort. Fiyat", getValue: (r) => r._avgPrice }],
      }}
      columns={columns}
      emptyText="Henüz fiyat listesi yok"
      emptyHint="Yukarıdaki butonla ilk fiyat listenizi ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: FiyatTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.ad}" fiyat listesi silinsin mi?`)) {
            run(() => deleteFiyatListesi(row.id), { success: "Fiyat listesi silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
