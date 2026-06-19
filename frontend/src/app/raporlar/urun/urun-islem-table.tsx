"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GiderTableRow } from "@/app/gider-girisi/gider-rows";
import { GiderModal } from "@/app/gider-girisi/gider-modal";
import { deleteGider } from "@/app/gider-girisi/actions";
import type { AlimRow } from "@/app/urun-alim/alim-rows";
import { AlimModal } from "@/app/urun-alim/alim-modal";
import { deleteAlim } from "@/app/urun-alim/actions";
import type { SatisTableRow } from "@/app/urun-satis/satis-rows";
import { SatisModal } from "@/app/urun-satis/satis-modal";
import { deleteSatis } from "@/app/urun-satis/actions";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  ALIM_AMOUNT_FILTER,
  ALIM_SEARCH_KEYS,
  alimYearColumn,
  buildAlimDataColumns,
} from "@/lib/alim-table-cells";
import {
  buildGiderDataColumns,
  GIDER_AMOUNT_FILTER,
  GIDER_SEARCH_KEYS,
} from "@/lib/gider-table-cells";
import {
  buildSatisDataColumns,
  SATIS_AMOUNT_FILTER,
  SATIS_SEARCH_KEYS,
} from "@/lib/satis-table-cells";

const URUN_RAPOR_SATIS_FILTERS = ["yil", "ay", "musteri", "raf"] as const;
const URUN_RAPOR_ALIM_FILTERS = ["yil", "tedarikci", "raf"] as const;
const URUN_RAPOR_GIDER_FILTERS = ["yil", "giderTuru", "tedarikciAdi"] as const;

function SatisRowActions({ row, onEdit }: { row: SatisTableRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={onEdit} title="Düzenle" aria-label="Düzenle" className="h-8 w-8">
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
          if (confirm(`"${row.urunAdi}" satış kaydı silinsin mi?`)) {
            run(() => deleteSatis(row.id), { success: "Satış kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AlimRowActions({ row, onEdit }: { row: AlimRow; onEdit: () => void }) {
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

function GiderRowActions({ row, onEdit }: { row: GiderTableRow; onEdit: () => void }) {
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

export function UrunSatisTable({
  rows,
  urunler,
  musteriler,
}: {
  rows: SatisTableRow[];
  urunler: string[];
  musteriler: string[];
}) {
  const [editing, setEditing] = useState<SatisTableRow | null>(null);

  const columns = useMemo(
    () => [
      ...buildSatisDataColumns(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: SatisTableRow) => <SatisRowActions row={row} onEdit={() => setEditing(row)} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        onRowClick={setEditing}
        defaultSort={{ key: "yil", asc: false }}
        searchKeys={[...SATIS_SEARCH_KEYS]}
        searchPlaceholder="Müşteri, tarih, ay, raf veya not ara…"
        filterKeys={[...URUN_RAPOR_SATIS_FILTERS]}
        amountFilter={SATIS_AMOUNT_FILTER}
        minTableWidth="2280px"
        emptyText="Satış kaydı yok"
        emptyHint="Bu ürün için henüz satış girilmemiş."
      />
      {editing && (
        <SatisModal
          mode="edit"
          row={editing}
          urunler={urunler}
          musteriler={musteriler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

export function UrunAlimTable({
  rows,
  urunler,
  tedarikciler,
}: {
  rows: AlimRow[];
  urunler: string[];
  tedarikciler: string[];
}) {
  const [editing, setEditing] = useState<AlimRow | null>(null);

  const columns = useMemo(
    () => [
      ...buildAlimDataColumns(),
      alimYearColumn(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: AlimRow) => <AlimRowActions row={row} onEdit={() => setEditing(row)} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        onRowClick={setEditing}
        defaultSort={{ key: "tarih", asc: false }}
        searchKeys={[...ALIM_SEARCH_KEYS]}
        searchPlaceholder="Tedarikçi, raf veya tarih ara…"
        filterKeys={[...URUN_RAPOR_ALIM_FILTERS]}
        amountFilter={ALIM_AMOUNT_FILTER}
        minTableWidth="1280px"
        emptyText="Alım kaydı yok"
        emptyHint="Bu ürün için henüz alım girilmemiş."
      />
      {editing && (
        <AlimModal
          mode="edit"
          row={editing}
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

export function UrunGiderTable({
  rows,
  genelGiderTurleri,
  urunGiderTurleri,
  urunler,
  tedarikciler,
}: {
  rows: GiderTableRow[];
  genelGiderTurleri: string[];
  urunGiderTurleri: string[];
  urunler: string[];
  tedarikciler: string[];
}) {
  const [editing, setEditing] = useState<GiderTableRow | null>(null);

  const columns = useMemo(
    () => [
      ...buildGiderDataColumns(),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: GiderTableRow) => <GiderRowActions row={row} onEdit={() => setEditing(row)} />,
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        onRowClick={setEditing}
        defaultSort={{ key: "yil", asc: false }}
        searchKeys={[...GIDER_SEARCH_KEYS]}
        searchPlaceholder="Gider türü, tedarikçi, tarih veya fatura no ara…"
        filterKeys={[...URUN_RAPOR_GIDER_FILTERS]}
        amountFilter={GIDER_AMOUNT_FILTER}
        minTableWidth="2080px"
        emptyText="Ürün gideri yok"
        emptyHint="Bu ürüne atanmış gider kaydı bulunmuyor."
      />
      {editing && (
        <GiderModal
          mode="edit"
          row={editing}
          genelGiderTurleri={genelGiderTurleri}
          urunGiderTurleri={urunGiderTurleri}
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
