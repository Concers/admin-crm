"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateSatis, deleteSatis } from "./actions";

export type SatisRow = {
  id: number;
  tarih: string;
  ay: string;
  yil: string;
  urunAdi: string;
  musteri: string;
  birimSatisFiyati: string;
  satisAdeti: number;
  toplamTutar: string;
  kdvDahilTutar: string;
  karYuzdesi: string;
  // raw values for editing
  _date: string;
  _productName: string;
  _customerName: string;
  _quantity: number;
  _unitPrice: number;
  _vatRate: number;
  _paidAmount: number;
  _notes: string;
};

export function SatisList({
  rows,
  urunler,
  musteriler,
}: {
  rows: SatisRow[];
  urunler: string[];
  musteriler: string[];
}) {
  const [editing, setEditing] = useState<SatisRow | null>(null);

  return (
    <>
      <DataTable
        rows={rows}
        searchKeys={["urunAdi", "musteri"]}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "ay", label: "Ay" },
          { key: "yil", label: "Yıl" },
          { key: "urunAdi", label: "Ürün" },
          { key: "musteri", label: "Müşteri" },
          { key: "birimSatisFiyati", label: "Birim Fiyat" },
          { key: "satisAdeti", label: "Adet" },
          { key: "toplamTutar", label: "Toplam" },
          { key: "kdvDahilTutar", label: "KDV Dahil" },
          { key: "karYuzdesi", label: "Kâr %" },
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
        <EditSatisModal
          row={editing}
          urunler={urunler}
          musteriler={musteriler}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function RowActions({ row, onEdit }: { row: SatisRow; onEdit: () => void }) {
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
            run(() => deleteSatis(row.id), { success: "Satış kaydı silindi." });
          }
        }}
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

function EditSatisModal({
  row,
  urunler,
  musteriler,
  onClose,
}: {
  row: SatisRow;
  urunler: string[];
  musteriler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Satış Kaydını Düzenle</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => updateSatis(row.id, fd), {
              success: "Satış kaydı güncellendi.",
            });
            onClose();
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="edit-tarih">Tarih *</Label>
            <Input
              id="edit-tarih"
              name="tarih"
              type="date"
              required
              defaultValue={row._date.slice(0, 10)}
            />
          </div>
          <div>
            <Label htmlFor="edit-urunAdi">Ürün Adı *</Label>
            <Select id="edit-urunAdi" name="urunAdi" required defaultValue={row._productName}>
              <option value="" disabled>Seçin</option>
              {urunler.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-musteri">Müşteri / Tedarikçi</Label>
            <Select id="edit-musteri" name="musteri" defaultValue={row._customerName}>
              <option value="">—</option>
              {musteriler.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-birimSatisFiyati">Birim Satış Fiyatı</Label>
            <Input id="edit-birimSatisFiyati" name="birimSatisFiyati" type="number" step="0.01" defaultValue={row._unitPrice} />
          </div>
          <div>
            <Label htmlFor="edit-satisAdeti">Satış Adedi *</Label>
            <Input id="edit-satisAdeti" name="satisAdeti" type="number" step="1" required defaultValue={row._quantity} />
          </div>
          <div>
            <Label htmlFor="edit-kdvOrani">KDV Oranı</Label>
            <Input id="edit-kdvOrani" name="kdvOrani" type="number" step="0.01" defaultValue={row._vatRate} />
          </div>
          <div>
            <Label htmlFor="edit-pesinOdenen">Peşin Ödenen</Label>
            <Input id="edit-pesinOdenen" name="pesinOdenen" type="number" step="0.01" defaultValue={row._paidAmount} />
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
