"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarRange,
  Package,
  Percent,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteIskonto } from "./actions";
import { IskontoModal } from "./iskonto-modal";
import type { IskontoTableRow } from "./iskonto-rows";

const COLUMNS = [
  { key: "ad", label: "İskonto" },
  { key: "tur", label: "Tür" },
  { key: "deger", label: "Değer" },
  { key: "cari", label: "Cari" },
  { key: "urun", label: "Ürün" },
  { key: "gecerlilik", label: "Geçerlilik" },
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

function TurBadge({ tur }: { tur: string }) {
  const styles =
    tur === "Yüzde"
      ? "bg-rose-50 text-rose-700 ring-rose-100"
      : tur === "Tutar"
        ? "bg-amber-50 text-amber-800 ring-amber-100"
        : tur === "Karma"
          ? "bg-violet-50 text-violet-700 ring-violet-100"
          : "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1", styles)}>
      {tur}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: IskontoTableRow) => ReactNode> = {
  ad: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <Percent className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.ad}</span>
    </div>
  ),
  tur: (r) => <TurBadge tur={r.tur} />,
  deger: (r) =>
    r.deger !== "—" ? (
      <span className="font-semibold tabular-nums text-rose-700">{r.deger}</span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  cari: (r) =>
    r.cari !== "—" ? (
      <span className="inline-flex max-w-[10rem] items-center gap-1 truncate text-sm">
        <User className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.cari}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">Tümü</span>
    ),
  urun: (r) =>
    r.urun !== "—" ? (
      <span className="inline-flex max-w-[10rem] items-center gap-1 truncate text-sm">
        <Package className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
        {r.urun}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">Tümü</span>
    ),
  gecerlilik: (r) => (
    <span className="inline-flex max-w-[11rem] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]">
      <CalendarRange className="h-3.5 w-3.5 shrink-0" />
      {r.gecerlilik}
    </span>
  ),
  durum: (r) => <DurumBadge durum={r.durum} active={r._isActive} />,
};

export function IskontoWorkspace({
  rows,
  partners,
  products,
}: {
  rows: IskontoTableRow[];
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<IskontoTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni İskonto Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni iskonto tanımı ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <IskontoList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <IskontoModal
          mode="create"
          partners={partners}
          products={products}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <IskontoModal
          mode="edit"
          row={editing}
          partners={partners}
          products={products}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function IskontoList({
  rows,
  onEdit,
}: {
  rows: IskontoTableRow[];
  onEdit: (row: IskontoTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "deger" ? (r: IskontoTableRow) => r._sortValue : undefined,
        align: col.key === "deger" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: IskontoTableRow) => {
          if (col.key === "ad") return r.ad;
          if (col.key === "tur") return r.tur;
          if (col.key === "cari") return r.cari;
          if (col.key === "urun") return r.urun;
          if (col.key === "durum") return r.durum;
          if (col.key === "gecerlilik") return r.gecerlilik;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: IskontoTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "ad", asc: true }}
      searchKeys={["ad", "cari", "urun", "tur", "durum"]}
      searchPlaceholder="İskonto adı, cari veya ürün ara…"
      amountFilter={{
        defaultField: "deger",
        fields: [
          { id: "deger", label: "İskonto Değeri", getValue: (r) => r._sortValue },
        ],
      }}
      columns={columns}
      emptyText="Henüz iskonto tanımı yok"
      emptyHint="Yukarıdaki butonla ilk iskontonuzu ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: IskontoTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.ad}" iskontosu silinsin mi?`)) {
            run(() => deleteIskonto(row.id), { success: "İskonto silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
