"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
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
import {
  ALIM_AMOUNT_FILTER,
  ALIM_PRIMARY_FILTER_KEYS,
  ALIM_SEARCH_KEYS,
  alimYearColumn,
  buildAlimDataColumns,
} from "@/lib/alim-table-cells";
import { deleteAlim } from "./actions";
import { AlimModal } from "./alim-modal";
import type { AlimRow } from "./alim-rows";

export type { AlimRow };

/** Alım ekranında ürün seçici için: id + eksik-detay bayrağı. */
export type UrunKart = { id: number; name: string; complete: boolean };

export function AlimWorkspace({
  rows,
  urunKartlari,
  tedarikciler,
}: {
  rows: AlimRow[];
  urunKartlari: UrunKart[];
  tedarikciler: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AlimRow | null>(null);

  return (
    <>
      <RecordWorkspaceToolbar
        addLabel="Yeni Alım Ekle"
        hint="Satıra tıklayarak düzenleyebilir veya yeni alım ekleyebilirsiniz."
        onAdd={() => setCreateOpen(true)}
      />
      <AlimList rows={rows} onEdit={setEditing} />
      {createOpen && (
        <AlimModal
          mode="create"
          urunKartlari={urunKartlari}
          tedarikciler={tedarikciler}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editing && (
        <AlimModal
          mode="edit"
          row={editing}
          urunKartlari={urunKartlari}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function AlimList({ rows, onEdit }: { rows: AlimRow[]; onEdit: (row: AlimRow) => void }) {
  const columns = useMemo(
    () => [
      ...buildAlimDataColumns(),
      alimYearColumn(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: AlimRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchPlaceholder="Ürün, tedarikçi, raf ara…"
      searchKeys={[...ALIM_SEARCH_KEYS]}
      filterKeys={[...ALIM_PRIMARY_FILTER_KEYS]}
      amountFilter={ALIM_AMOUNT_FILTER}
      columns={columns}
      minTableWidth="1040px"
      emptyText="Alım kaydı bulunamadı"
      emptyHint="Filtreleri temizleyin veya yeni alım ekleyin."
    />
  );
}

function RowActions({ row, onEdit }: { row: AlimRow; onEdit: () => void }) {
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
          <DropdownMenuItem variant="danger" onSelect={() => setTimeout(() => setConfirmOpen(true), 0)}>
            <Trash2 className="h-4 w-4" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alım kaydı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{row.urunAdi}</strong> alımı kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => run(() => deleteAlim(row.id), { success: "Alım kaydı silindi." })}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
