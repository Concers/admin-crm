"use client";

import { useMemo, useState } from "react";
import { Pencil, StickyNote, Trash2, Truck } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { GiderTableRow } from "@/app/gider-girisi/gider-rows";
import { GiderModal } from "@/app/gider-girisi/gider-modal";
import { deleteGider } from "@/app/gider-girisi/actions";
import type { OdemeTableRow } from "@/app/tedarikci-odeme/odeme-rows";
import { OdemeModal } from "@/app/tedarikci-odeme/odeme-modal";
import { deleteOdeme } from "@/app/tedarikci-odeme/actions";
import type { AlimRow } from "@/app/urun-alim/alim-rows";
import { AlimModal } from "@/app/urun-alim/alim-modal";
import { deleteAlim } from "@/app/urun-alim/actions";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  ALIM_AMOUNT_FILTER,
  ALIM_SEARCH_KEYS,
  alimYearColumn,
  buildAlimDataColumns,
} from "@/lib/alim-table-cells";
import {
  GIDER_AMOUNT_FILTER,
  GIDER_SEARCH_KEYS,
  buildGiderDataColumns,
} from "@/lib/gider-table-cells";

const TEDARIKCI_ALIM_FILTERS = ["yil", "urunAdi", "raf"] as const;
const TEDARIKCI_GIDER_FILTERS = ["yil", "giderTuru", "giderKategori"] as const;

function AlimRowActions({ row, onEdit }: { row: AlimRow; onEdit: () => void }) {
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
          if (confirm(`"${row.urunAdi}" alım kaydı silinsin mi?`)) {
            run(() => deleteAlim(row.id), { success: "Alım kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function GiderRowActions({ row, onEdit }: { row: GiderTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.giderTuru}" gider kaydı silinsin mi?`)) {
            run(() => deleteGider(row.id), { success: "Gider kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function OdemeRowActions({ row, onEdit }: { row: OdemeTableRow; onEdit: () => void }) {
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
          if (confirm(`"${row.tedarikciAdi}" ödeme kaydı silinsin mi?`)) {
            run(() => deleteOdeme(row.id), { success: "Ödeme kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const ODEME_CELL_RENDERERS = {
  tarih: (r: OdemeTableRow) => (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums">{r.tarih}</span>
  ),
  tedarikciAdi: (r: OdemeTableRow) => (
    <div className="flex min-w-0 max-w-[14rem] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <Truck className="h-3.5 w-3.5" />
      </span>
      <span className="truncate font-medium">{r.tedarikciAdi}</span>
    </div>
  ),
  odenenTutar: (r: OdemeTableRow) => (
    <span className="font-semibold tabular-nums text-rose-700">{r.odenenTutar}</span>
  ),
  notlar: (r: OdemeTableRow) =>
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

export function TedarikciAlimTable({
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
        searchPlaceholder="Ürün, raf veya tarih ara…"
        filterKeys={[...TEDARIKCI_ALIM_FILTERS]}
        amountFilter={ALIM_AMOUNT_FILTER}
        minTableWidth="1280px"
        emptyText="Alım kaydı yok"
        emptyHint="Bu tedarikçiden henüz alım girilmemiş."
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

export function TedarikciGiderTable({
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
        searchPlaceholder="Gider türü, tarih veya fatura no ara…"
        filterKeys={[...TEDARIKCI_GIDER_FILTERS]}
        amountFilter={GIDER_AMOUNT_FILTER}
        minTableWidth="2080px"
        emptyText="Gider kaydı yok"
        emptyHint="Bu tedarikçiye bağlı gider bulunmuyor."
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

export function TedarikciOdemeTable({
  rows,
  tedarikciler,
}: {
  rows: OdemeTableRow[];
  tedarikciler: string[];
}) {
  const [editing, setEditing] = useState<OdemeTableRow | null>(null);

  const columns = useMemo(
    () => [
      ...(["tarih", "tedarikciAdi", "odenenTutar", "notlar"] as const).map((key) => ({
        key,
        label:
          key === "tarih"
            ? "Tarih"
            : key === "tedarikciAdi"
              ? "Tedarikçi / Hizmet sağlayıcı"
              : key === "odenenTutar"
                ? "Ödenen tutar"
                : "Notlar",
        sortValue:
          key === "tarih"
            ? (r: OdemeTableRow) => r._date
            : key === "odenenTutar"
              ? (r: OdemeTableRow) => r._amount
              : undefined,
        align: key === "odenenTutar" ? ("right" as const) : undefined,
        render: ODEME_CELL_RENDERERS[key],
        filterValue: (r: OdemeTableRow) =>
          key === "tedarikciAdi" ? r.tedarikciAdi : key === "notlar" ? r.notlar : String(r[key] ?? ""),
      })),
      {
        key: "id",
        label: "",
        sortable: false as const,
        filterable: false as const,
        render: (row: OdemeTableRow) => <OdemeRowActions row={row} onEdit={() => setEditing(row)} />,
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
        searchKeys={["tedarikciAdi", "notlar", "tarih"]}
        searchPlaceholder="Not veya tarih ara…"
        amountFilter={{
          defaultField: "tutar",
          fields: [{ id: "tutar", label: "Ödenen tutar", getValue: (r: OdemeTableRow) => r._amount }],
        }}
        minTableWidth="900px"
        emptyText="Ödeme kaydı yok"
        emptyHint="Bu tedarikçiye henüz ödeme girilmemiş."
      />
      {editing && (
        <OdemeModal mode="edit" row={editing} tedarikciler={tedarikciler} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
