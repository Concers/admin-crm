"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarClock,
  FileSignature,
  Package,
  Pencil,
  StickyNote,
  Trash2,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteTeklif } from "./actions";
import { TeklifModal } from "./teklif-modal";
import type { TeklifTableRow } from "./teklif-rows";

const COLUMNS = [
  { key: "tarih", label: "Tarih" },
  { key: "cari", label: "Cari" },
  { key: "gecerlilik", label: "Geçerlilik" },
  { key: "durum", label: "Durum" },
  { key: "kalemSayisi", label: "Kalem" },
  { key: "toplam", label: "Toplam" },
  { key: "kdvDahil", label: "KDV Dahil" },
  { key: "notlar", label: "Notlar" },
] as const;

function DurumBadge({ durum, status }: { durum: string; status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-slate-50 text-slate-700 ring-slate-200",
    SENT: "bg-blue-50 text-blue-700 ring-blue-100",
    ACCEPTED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-100",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        styles[status] ?? "bg-[var(--muted)] text-[var(--foreground)] ring-[var(--border)]"
      )}
    >
      {durum}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: TeklifTableRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  cari: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <FileSignature className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.cari}</span>
    </div>
  ),
  gecerlilik: (r) =>
    r.gecerlilik !== "—" ? (
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm tabular-nums text-[var(--muted-foreground)]">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
        {r.gecerlilik}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
  durum: (r) => <DurumBadge durum={r.durum} status={r._status} />,
  kalemSayisi: (r) => (
    <span className="inline-flex min-w-[2rem] items-center justify-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      <Package className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      {r.kalemSayisi}
    </span>
  ),
  toplam: (r) => <span className="font-medium tabular-nums">{r.toplam}</span>,
  kdvDahil: (r) => (
    <span className="font-semibold tabular-nums text-emerald-700">{r.kdvDahil}</span>
  ),
  notlar: (r) =>
    r.notlar ? (
      <span
        className="inline-flex max-w-[180px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={r.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {r.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
};

export function TeklifWorkspace({
  rows,
  partners,
  products,
}: {
  rows: TeklifTableRow[];
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TeklifTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Teklif Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni teklif ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <TeklifList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <TeklifModal
          mode="create"
          partners={partners}
          products={products}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <TeklifModal
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

function TeklifList({
  rows,
  onEdit,
}: {
  rows: TeklifTableRow[];
  onEdit: (row: TeklifTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "tarih"
            ? (r: TeklifTableRow) => r._date
            : col.key === "gecerlilik"
              ? (r: TeklifTableRow) => r._validUntil ?? ""
              : col.key === "toplam"
                ? (r: TeklifTableRow) => r._totalAmount
                : col.key === "kdvDahil"
                  ? (r: TeklifTableRow) => r._vatIncludedAmount
                  : col.key === "kalemSayisi"
                    ? (r: TeklifTableRow) => r.kalemSayisi
                    : undefined,
        align:
          col.key === "toplam" || col.key === "kdvDahil" || col.key === "kalemSayisi"
            ? ("right" as const)
            : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: TeklifTableRow) => {
          if (col.key === "cari") return r.cari;
          if (col.key === "notlar") return r.notlar;
          if (col.key === "durum") return r.durum;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: TeklifTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["cari", "durum", "notlar", "tarih", "gecerlilik"]}
      searchPlaceholder="Cari, durum veya not ara…"
      amountFilter={{
        defaultField: "toplam",
        fields: [
          { id: "toplam", label: "Toplam", getValue: (r) => r._totalAmount },
          { id: "kdv", label: "KDV Dahil", getValue: (r) => r._vatIncludedAmount },
        ],
      }}
      columns={columns}
      emptyText="Henüz teklif kaydı yok"
      emptyHint="Yukarıdaki butonla ilk teklifinizi ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: TeklifTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.cari}" teklifi silinsin mi?`)) {
            run(() => deleteTeklif(row.id), { success: "Teklif silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
