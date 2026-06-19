"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  MoreHorizontal,
  Package,
  Pencil,
  RotateCcw,
  StickyNote,
  Trash2,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { IADE_PRIMARY_FILTER_KEYS } from "@/lib/table-primary-filters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteIade } from "./actions";
import { IadeModal } from "./iade-modal";
import type { IadeTableRow } from "./iade-rows";

const COLUMNS = [
  { key: "tarih", label: "Tarih" },
  { key: "tur", label: "Tür" },
  { key: "cari", label: "Cari" },
  { key: "urun", label: "Ürün" },
  { key: "miktar", label: "Miktar" },
  { key: "tutar", label: "Tutar" },
  { key: "sebep", label: "Sebep" },
  { key: "notlar", label: "Notlar" },
] as const;

function TurBadge({ tur, type }: { tur: string; type: string }) {
  const sales = type === "SALES_RETURN";
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
        sales
          ? "bg-rose-50 text-rose-700 ring-rose-100"
          : "bg-amber-50 text-amber-800 ring-amber-100"
      )}
    >
      {tur}
    </span>
  );
}

const CELL_RENDERERS: Record<string, (row: IadeTableRow) => ReactNode> = {
  tarih: (r) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  tur: (r) => <TurBadge tur={r.tur} type={r._type} />,
  cari: (r) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <RotateCcw className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.cari}</span>
    </div>
  ),
  urun: (r) => (
    <div className="flex min-w-0 max-w-[12rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
        <Package className="h-3.5 w-3.5" />
      </span>
      <span className="truncate text-sm">{r.urun}</span>
    </div>
  ),
  miktar: (r) => (
    <span className="inline-flex min-w-[2rem] justify-end rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
      {r.miktar}
    </span>
  ),
  tutar: (r) => (
    <span className="font-semibold tabular-nums text-amber-700">{r.tutar}</span>
  ),
  sebep: (r) =>
    r.sebep ? (
      <span className="inline-block max-w-[160px] truncate text-sm" title={r.sebep}>
        {r.sebep}
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

export function IadeWorkspace({
  rows,
  partners,
  products,
}: {
  rows: IadeTableRow[];
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<IadeTableRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni İade Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni iade ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <IadeList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <IadeModal
          mode="create"
          partners={partners}
          products={products}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <IadeModal
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

function IadeList({
  rows,
  onEdit,
}: {
  rows: IadeTableRow[];
  onEdit: (row: IadeTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...COLUMNS.map((col) => ({
        key: col.key,
        label: col.label,
        sortValue:
          col.key === "tarih"
            ? (r: IadeTableRow) => r._date
            : col.key === "miktar"
              ? (r: IadeTableRow) => r._quantity
              : col.key === "tutar"
                ? (r: IadeTableRow) => r._amount
                : undefined,
        align:
          col.key === "miktar" || col.key === "tutar" ? ("right" as const) : undefined,
        render: CELL_RENDERERS[col.key],
        filterValue: (r: IadeTableRow) => {
          if (col.key === "cari") return r.cari;
          if (col.key === "urun") return r.urun;
          if (col.key === "sebep") return r.sebep;
          if (col.key === "notlar") return r.notlar;
          if (col.key === "tur") return r.tur;
          return String((r as Record<string, unknown>)[col.key] ?? "");
        },
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: IadeTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["cari", "urun", "tur", "sebep", "notlar", "tarih"]}
      searchPlaceholder="Cari, ürün, sebep veya not ara…"
      filterKeys={[...IADE_PRIMARY_FILTER_KEYS]}
      amountFilter={{
        defaultField: "tutar",
        fields: [{ id: "tutar", label: "Tutar", getValue: (r) => r._amount }],
      }}
      columns={columns}
      emptyText="Henüz iade kaydı yok"
      emptyHint="Yukarıdaki butonla ilk iade kaydınızı ekleyebilirsiniz."
    />
  );
}

function RowActions({ row, onEdit }: { row: IadeTableRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="İşlemler" aria-label="İşlemler">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onEdit()}>
            <Pencil className="h-4 w-4" />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="danger"
            onSelect={() => {
              // Menünün kapanmasına izin ver, sonra AlertDialog'u aç (focus çakışmasını önler).
              setTimeout(() => setConfirmOpen(true), 0);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İade kaydı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{row.urun}</strong> için {row.tarih} tarihli iade kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => run(() => deleteIade(row.id), { success: "İade kaydı silindi." })}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
