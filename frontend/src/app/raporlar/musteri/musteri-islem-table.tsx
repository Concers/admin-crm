"use client";

import { useMemo, useState } from "react";
import { Pencil, StickyNote, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { TahsilatModal } from "@/app/musteri-tahsilat/tahsilat-modal";
import { deleteTahsilat } from "@/app/musteri-tahsilat/actions";
import type { TahsilatTableRow } from "@/app/musteri-tahsilat/tahsilat-rows";
import type { SatisTableRow } from "@/app/urun-satis/satis-rows";
import { SatisModal } from "@/app/urun-satis/satis-modal";
import { deleteSatis } from "@/app/urun-satis/actions";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  buildSatisDataColumns,
  SATIS_AMOUNT_FILTER,
  SATIS_SEARCH_KEYS,
} from "@/lib/satis-table-cells";

const MUSTERI_SATIS_FILTERS = ["yil", "ay", "urunAdi", "raf"] as const;

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

function TahsilatRowActions({ row, onEdit }: { row: TahsilatTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.musteriAdi}" tahsilat kaydı silinsin mi?`)) {
            run(() => deleteTahsilat(row.id), { success: "Tahsilat kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const TAHSILAT_CELL_RENDERERS = {
  tarih: (r: TahsilatTableRow) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  musteriAdi: (r: TahsilatTableRow) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <Users className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.musteriAdi}</span>
    </div>
  ),
  tahsilatTutari: (r: TahsilatTableRow) => (
    <span className="font-semibold tabular-nums text-emerald-700">{r.tahsilatTutari}</span>
  ),
  notlar: (r: TahsilatTableRow) =>
    r.notlar ? (
      <span
        className="inline-flex max-w-[200px] items-center gap-1 truncate text-sm text-[var(--muted-foreground)]"
        title={r.notlar}
      >
        <StickyNote className="h-3.5 w-3.5 shrink-0" />
        {r.notlar}
      </span>
    ) : (
      <span className="text-sm text-[var(--muted-foreground)]">—</span>
    ),
};

export function MusteriSatisTable({
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
        searchPlaceholder="Ürün, tarih, ay, raf veya not ara…"
        filterKeys={[...MUSTERI_SATIS_FILTERS]}
        amountFilter={SATIS_AMOUNT_FILTER}
        minTableWidth="2280px"
        emptyText="Satış kaydı yok"
        emptyHint="Bu müşteriye henüz satış girilmemiş."
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

export function MusteriTahsilatTable({
  rows,
  musteriler,
}: {
  rows: TahsilatTableRow[];
  musteriler: string[];
}) {
  const [editing, setEditing] = useState<TahsilatTableRow | null>(null);

  const columns = useMemo(
    () => [
      ...(["tarih", "musteriAdi", "tahsilatTutari", "notlar"] as const).map((key) => ({
        key,
        label:
          key === "tarih"
            ? "Gün"
            : key === "musteriAdi"
              ? "Müşteri"
              : key === "tahsilatTutari"
                ? "Tutar"
                : "Notlar",
        sortValue:
          key === "tarih"
            ? (r: TahsilatTableRow) => r._date
            : key === "tahsilatTutari"
              ? (r: TahsilatTableRow) => r._amount
              : undefined,
        align: key === "tahsilatTutari" ? ("right" as const) : undefined,
        render: TAHSILAT_CELL_RENDERERS[key],
        filterValue: (r: TahsilatTableRow) =>
          key === "musteriAdi" ? r.musteriAdi : key === "notlar" ? r.notlar : String(r[key] ?? ""),
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: TahsilatTableRow) => <TahsilatRowActions row={row} onEdit={() => setEditing(row)} />,
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
        searchKeys={["musteriAdi", "notlar", "tarih"]}
        searchPlaceholder="Not veya tarih ara…"
        amountFilter={{
          defaultField: "tutar",
          fields: [{ id: "tutar", label: "Tahsilat tutarı", getValue: (r: TahsilatTableRow) => r._amount }],
        }}
        minTableWidth="900px"
        emptyText="Tahsilat kaydı yok"
        emptyHint="Bu müşteriden henüz tahsilat girilmemiş."
      />
      {editing && (
        <TahsilatModal mode="edit" row={editing} musteriler={musteriler} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
