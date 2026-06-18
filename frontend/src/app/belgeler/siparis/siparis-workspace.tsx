"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ClipboardList,
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
import { deleteSiparis } from "./actions";
import { SiparisModal } from "./siparis-modal";
import type { SiparisTableRow } from "./siparis-rows";

const COLUMNS = [
  { key: "tarih", label: "Tarih" },
  { key: "tur", label: "Tür" },
  { key: "cari", label: "Cari" },
  { key: "durum", label: "Durum" },
  { key: "kalemSayisi", label: "Kalem" },
  { key: "toplam", label: "Toplam" },
  { key: "kdvDahil", label: "KDV Dahil" },
  { key: "notlar", label: "Notlar" },
] as const;

function TurBadge({ tur, docType }: { tur: string; docType: string }) {
  const sales = docType === "SALES";
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        sales
          ? "bg-blue-50 text-blue-700 ring-blue-100"
          : "bg-amber-50 text-amber-800 ring-amber-100"
      )}
    >
      {tur}
    </span>
  );
}

function DurumBadge({ durum, status }: { durum: string; status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-slate-50 text-slate-700 ring-slate-200",
    CONFIRMED: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-100",
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

const CELL_RENDERERS: Record<string, (row: SiparisTableRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  tur: (r) => <TurBadge tur={r.tur} docType={r._docType} />,
  cari: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        <ClipboardList className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.cari}</span>
    </div>
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
    <span className="font-semibold tabular-nums text-indigo-700">{r.kdvDahil}</span>
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

export function SiparisWorkspace({
  rows,
  partners,
  products,
}: {
  rows: SiparisTableRow[];
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SiparisTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Sipariş Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni sipariş ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <SiparisList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <SiparisModal
          mode="create"
          partners={partners}
          products={products}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <SiparisModal
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

function SiparisList({
  rows,
  onEdit,
}: {
  rows: SiparisTableRow[];
  onEdit: (row: SiparisTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "tarih"
            ? (r: SiparisTableRow) => r._date
            : col.key === "toplam"
              ? (r: SiparisTableRow) => r._totalAmount
              : col.key === "kdvDahil"
                ? (r: SiparisTableRow) => r._vatIncludedAmount
                : col.key === "kalemSayisi"
                  ? (r: SiparisTableRow) => r.kalemSayisi
                  : undefined,
        align:
          col.key === "toplam" || col.key === "kdvDahil" || col.key === "kalemSayisi"
            ? ("right" as const)
            : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: SiparisTableRow) => {
          if (col.key === "cari") return r.cari;
          if (col.key === "notlar") return r.notlar;
          if (col.key === "tur") return r.tur;
          if (col.key === "durum") return r.durum;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: SiparisTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["cari", "tur", "durum", "notlar", "tarih"]}
      searchPlaceholder="Cari, tür, durum veya not ara…"
      amountFilter={{
        defaultField: "toplam",
        fields: [
          { id: "toplam", label: "Toplam", getValue: (r) => r._totalAmount },
          { id: "kdv", label: "KDV Dahil", getValue: (r) => r._vatIncludedAmount },
        ],
      }}
      columns={columns}
      emptyText="Henüz sipariş kaydı yok"
      emptyHint="Yukarıdaki butonla ilk siparişinizi ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: SiparisTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.cari}" siparişi silinsin mi?`)) {
            run(() => deleteSiparis(row.id), { success: "Sipariş silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
