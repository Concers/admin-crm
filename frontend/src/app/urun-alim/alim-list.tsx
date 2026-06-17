"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateAlim, deleteAlim } from "./actions";

export type AlimRow = {
  id: number;
  tarih: string;
  urunAdi: string;
  tedarikci: string;
  birimAlimFiyati: string;
  alimAdeti: number;
  toplamTutar: string;
  kdvDahilTutar: string;
  pesinOdenen: string;
  // raw values for editing
  _date: string;
  _productName: string;
  _supplierName: string;
  _quantity: number;
  _unitPrice: number;
  _vatRate: number;
  _paidAmount: number;
  _shelfLocation: string;
  _notes: string;
};

export function AlimList({
  rows,
  urunler,
  tedarikciler,
}: {
  rows: AlimRow[];
  urunler: string[];
  tedarikciler: string[];
}) {
  const [editing, setEditing] = useState<AlimRow | null>(null);

  return (
    <>
      <DataTable
        rows={rows}
        searchKeys={["urunAdi", "tedarikci"]}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "urunAdi", label: "Ürün" },
          { key: "tedarikci", label: "Tedarikçi" },
          { key: "birimAlimFiyati", label: "Birim Fiyat" },
          { key: "alimAdeti", label: "Adet" },
          { key: "toplamTutar", label: "Toplam" },
          { key: "kdvDahilTutar", label: "KDV Dahil" },
          { key: "pesinOdenen", label: "Peşin" },
          {
            key: "id",
            label: "",
            sortable: false,
            render: (row) => (
              <RowActions row={row} onEdit={() => setEditing(row)} />
            ),
          },
        ]}
      />
      {editing && (
        <EditAlimModal
          row={editing}
          urunler={urunler}
          tedarikciler={tedarikciler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function RowActions({ row, onEdit }: { row: AlimRow; onEdit: () => void }) {
  const { run, pending } = useActionToast();
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={onEdit} title="Düzenle">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        title="Sil"
        onClick={() => {
          if (confirm("Silmek istediğinize emin misiniz?")) {
            run(() => deleteAlim(row.id), { success: "Alım kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

function EditAlimModal({
  row,
  urunler,
  tedarikciler,
  onClose,
}: {
  row: AlimRow;
  urunler: string[];
  tedarikciler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Alım Kaydını Düzenle</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => updateAlim(row.id, fd), {
              success: "Alım kaydı güncellendi.",
            });
            onClose();
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="edit-tarih">Tarih *</Label>
            <Input id="edit-tarih" name="tarih" type="date" required defaultValue={row._date.slice(0, 10)} />
          </div>
          <div>
            <Label htmlFor="edit-urunAdi">Ürün Adı *</Label>
            <Select id="edit-urunAdi" name="urunAdi" required defaultValue={row._productName}>
              <option value="" disabled>Seçin</option>
              {urunler.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-tedarikci">Tedarikçi</Label>
            <Select id="edit-tedarikci" name="tedarikci" defaultValue={row._supplierName}>
              <option value="">—</option>
              {tedarikciler.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-birimAlimFiyati">Birim Alım Fiyatı</Label>
            <Input id="edit-birimAlimFiyati" name="birimAlimFiyati" type="number" step="0.01" defaultValue={row._unitPrice} />
          </div>
          <div>
            <Label htmlFor="edit-alimAdeti">Alım Adedi *</Label>
            <Input id="edit-alimAdeti" name="alimAdeti" type="number" step="1" required defaultValue={row._quantity} />
          </div>
          <div>
            <Label htmlFor="edit-kdvOrani">KDV Oranı</Label>
            <Input id="edit-kdvOrani" name="kdvOrani" type="number" step="0.01" defaultValue={row._vatRate} />
          </div>
          <div>
            <Label htmlFor="edit-pesinOdenen">Peşin Ödenen</Label>
            <Input id="edit-pesinOdenen" name="pesinOdenen" type="number" step="0.01" defaultValue={row._paidAmount} />
          </div>
          <div>
            <Label htmlFor="edit-konulanRaf">Konulan Raf</Label>
            <Input id="edit-konulanRaf" name="konulanRaf" defaultValue={row._shelfLocation} />
          </div>
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
