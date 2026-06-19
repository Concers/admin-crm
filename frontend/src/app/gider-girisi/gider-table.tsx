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
import { useActionToast } from "@/hooks/use-action-toast";
import {
  buildGiderDataColumns,
  GIDER_AMOUNT_FILTER,
  GIDER_PRIMARY_FILTER_KEYS,
  GIDER_SEARCH_KEYS,
} from "@/lib/gider-table-cells";
import { deleteGider } from "./actions";
import type { GiderTableRow } from "./gider-rows";

export function GiderTable({
  rows,
  onEdit,
}: {
  rows: GiderTableRow[];
  onEdit: (row: GiderTableRow) => void;
}) {
  const columns = useMemo(
    () => [
      ...buildGiderDataColumns(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: GiderTableRow) => <RowActions row={row} onEdit={() => onEdit(row)} />,
      },
    ],
    [onEdit]
  );

  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "yil", asc: false }}
      searchPlaceholder="Gider türü, tedarikçi, fatura no, ürün…"
      searchKeys={[...GIDER_SEARCH_KEYS]}
      filterKeys={[...GIDER_PRIMARY_FILTER_KEYS]}
      amountFilter={GIDER_AMOUNT_FILTER}
      columns={columns}
      minTableWidth="1600px"
      emptyText="Kayıt bulunamadı"
      emptyHint="Filtreleri temizleyin veya yeni gider ekleyin."
    />
  );
}

function RowActions({ row, onEdit }: { row: GiderTableRow; onEdit: () => void }) {
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
            <AlertDialogTitle>Gider kaydı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{row.giderTuru}</strong> ({row.gun}) gider kaydı kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => run(() => deleteGider(row.id), { success: "Gider kaydı silindi." })}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
