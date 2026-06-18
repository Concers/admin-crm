"use client";

import { useState } from "react";
import { Pencil, Trash2, Package, Truck, LayoutGrid } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { RecordWorkspaceToolbar } from "@/components/record-workspace-toolbar";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { deleteAlim } from "./actions";
import { AlimModal } from "./alim-modal";

export type AlimRow = {
  id: number;
  tarih: string;
  urunAdi: string;
  tedarikci: string;
  raf: string;
  birimAlimFiyati: string;
  alimAdeti: number;
  toplamTutar: string;
  kdvDahilTutar: string;
  pesinOdenen: string;
  _date: string;
  _productName: string;
  _supplierName: string;
  _quantity: number;
  _unitPrice: number;
  _vatRate: number;
  _paidAmount: number;
  _totalAmount: number;
  _vatIncludedAmount: number;
  _shelfLocation: string;
  _notes: string;
};

export function AlimWorkspace({
  rows,
  urunler,
  tedarikciler,
}: {
  rows: AlimRow[];
  urunler: string[];
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
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setCreateOpen(false)}
        />
      )}
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

function AlimList({ rows, onEdit }: { rows: AlimRow[]; onEdit: (row: AlimRow) => void }) {
  return (
    <DataTable
      rows={rows}
      onRowClick={onEdit}
      defaultSort={{ key: "tarih", asc: false }}
      searchKeys={["urunAdi", "tedarikci", "raf", "tarih"]}
      searchPlaceholder="Ürün, tedarikçi, raf veya tarih ara…"
      emptyText="Henüz alım kaydı yok"
      emptyHint="Yukarıdaki butonla ilk alımınızı ekleyebilirsiniz."
      amountFilter={{
        defaultField: "toplam",
        fields: [
          { id: "toplam", label: "Toplam", getValue: (r) => r._totalAmount },
          { id: "kdv", label: "KDV Dahil", getValue: (r) => r._vatIncludedAmount },
          { id: "pesin", label: "Peşin", getValue: (r) => r._paidAmount },
          { id: "birim", label: "Birim Fiyat", getValue: (r) => r._unitPrice },
        ],
      }}
      columns={[
        {
          key: "tarih",
          label: "Tarih",
          sortValue: (r) => r._date,
          render: (r) => (
            <span className="whitespace-nowrap text-sm tabular-nums">{r.tarih}</span>
          ),
        },
        {
          key: "urunAdi",
          label: "Ürün",
          render: (r) => (
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Package className="h-3.5 w-3.5" />
              </span>
              <span className="truncate font-medium">{r.urunAdi}</span>
            </div>
          ),
        },
        {
          key: "tedarikci",
          label: "Tedarikçi",
          filterValue: (r) => r.tedarikci,
          render: (r) =>
            r.tedarikci && r.tedarikci !== "—" ? (
              <span className="inline-flex max-w-[10rem] items-center gap-1.5 truncate text-sm">
                <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                {r.tedarikci}
              </span>
            ) : (
              <span className="text-sm text-[var(--muted-foreground)]">—</span>
            ),
        },
        {
          key: "raf",
          label: "Raf",
          filterValue: (r) => r.raf || "Rafsız",
          render: (r) =>
            r.raf ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                <LayoutGrid className="h-3 w-3" />
                {r.raf}
              </span>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)]">—</span>
            ),
        },
        {
          key: "birimAlimFiyati",
          label: "Birim",
          align: "right",
          sortValue: (r) => r._unitPrice,
          render: (r) => (
            <span className="tabular-nums text-sm text-[var(--muted-foreground)]">
              {r.birimAlimFiyati}
            </span>
          ),
        },
        {
          key: "alimAdeti",
          label: "Adet",
          align: "right",
          sortValue: (r) => r._quantity,
          render: (r) => (
            <span className="inline-flex min-w-[2rem] justify-end rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-medium tabular-nums">
              {r.alimAdeti}
            </span>
          ),
        },
        {
          key: "toplamTutar",
          label: "Toplam",
          align: "right",
          sortValue: (r) => r._totalAmount,
          render: (r) => (
            <span className="font-medium tabular-nums">{r.toplamTutar}</span>
          ),
        },
        {
          key: "kdvDahilTutar",
          label: "KDV Dahil",
          align: "right",
          sortValue: (r) => r._vatIncludedAmount,
          render: (r) => (
            <span className="font-semibold tabular-nums text-emerald-700">{r.kdvDahilTutar}</span>
          ),
        },
        {
          key: "pesinOdenen",
          label: "Peşin",
          align: "right",
          sortValue: (r) => r._paidAmount,
          render: (r) => (
            <span
              className={cn(
                "tabular-nums text-sm",
                r._paidAmount > 0 ? "font-medium text-amber-700" : "text-[var(--muted-foreground)]"
              )}
            >
              {r.pesinOdenen}
            </span>
          ),
        },
        {
          key: "id",
          label: "",
          sortable: false,
          filterable: false,
          render: (row) => <RowActions row={row} onEdit={() => onEdit(row)} />,
        },
      ]}
    />
  );
}

function RowActions({ row, onEdit }: { row: AlimRow; onEdit: () => void }) {
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
