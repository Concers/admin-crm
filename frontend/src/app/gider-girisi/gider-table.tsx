"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GIDER_KATEGORILERI } from "@/lib/calculations";
import { useActionToast } from "@/hooks/use-action-toast";
import { DeleteGiderButton } from "./gider-form";
import { updateGider } from "./actions";
import type { GiderTableRow } from "./gider-rows";

export function GiderTable({
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

  return (
    <>
      <DataTable
        rows={rows}
        searchKeys={[
          "giderTuru",
          "urunAdi",
          "tedarikciAdi",
          "notlar",
          "ay",
          "giderKategori",
        ]}
        columns={[
          { key: "gun", label: "Gün" },
          { key: "ay", label: "Ay" },
          { key: "yil", label: "Yıl" },
          { key: "giderKategori", label: "Genel / Ürün" },
          { key: "giderTuru", label: "Gider Türü" },
          { key: "periyotAy", label: "Periyot (Ay)" },
          { key: "urunAdi", label: "Ürün Adı" },
          { key: "tedarikciAdi", label: "Tedarikçi / Hizmet" },
          { key: "toplamTutar", label: "Toplam Tutar" },
          { key: "pesinOdenen", label: "Peşin Ödenen" },
          {
            key: "notlar",
            label: "Notlar",
            render: (row) => (
              <span className="block max-w-[200px] truncate" title={row.notlar || undefined}>
                {row.notlar || "-"}
              </span>
            ),
          },
          { key: "aylikGiderPayi", label: "Aylık Gider Payı" },
          { key: "baslangicDonem", label: "Başlangıç Dönem" },
          { key: "bitisDonem", label: "Bitiş Dönem" },
          { key: "baslangicTarihi", label: "Başlangıç Tarihi" },
          { key: "bitisTarihi", label: "Bitiş Tarihi" },
          {
            key: "id",
            label: "",
            sortable: false,
            render: (row) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Düzenle"
                  onClick={() => setEditing(row)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteGiderButton id={row.id} />
              </div>
            ),
          },
        ]}
      />
      {editing && (
        <EditGiderModal
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

function EditGiderModal({
  row,
  genelGiderTurleri,
  urunGiderTurleri,
  urunler,
  tedarikciler,
  onClose,
}: {
  row: GiderTableRow;
  genelGiderTurleri: string[];
  urunGiderTurleri: string[];
  urunler: string[];
  tedarikciler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const [kategori, setKategori] = useState<string>(
    row._scope === "PRODUCT" ? "ÜRÜN_GİDERLERİ" : "Genel_Giderler"
  );

  const giderTurleri = useMemo(
    () => (kategori === "ÜRÜN_GİDERLERİ" ? urunGiderTurleri : genelGiderTurleri),
    [kategori, genelGiderTurleri, urunGiderTurleri]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Gider Kaydını Düzenle</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => updateGider(row.id, fd), {
              success: "Gider kaydı güncellendi.",
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
            <Label htmlFor="edit-giderKategori">Ürün Gideri / Genel</Label>
            <Select
              id="edit-giderKategori"
              name="giderKategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              {GIDER_KATEGORILERI.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-giderTuru">Gider Türü *</Label>
            <Select
              key={kategori}
              id="edit-giderTuru"
              name="giderTuru"
              required
              defaultValue={row._category}
            >
              <option value="" disabled>Seçin</option>
              {giderTurleri.map((g, i) => (
                <option key={`gider-${i}-${g}`} value={g}>{g}</option>
              ))}
              {row._category && !giderTurleri.includes(row._category) && (
                <option value={row._category}>{row._category}</option>
              )}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-periyotAy">Gider Periyodu (Ay)</Label>
            <Input
              id="edit-periyotAy"
              name="periyotAy"
              type="number"
              min="1"
              defaultValue={row._durationMonths ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="edit-urunAdi">Ürün Adı{kategori === "ÜRÜN_GİDERLERİ" ? " *" : ""}</Label>
            <Select
              id="edit-urunAdi"
              name="urunAdi"
              defaultValue={row._productName}
              required={kategori === "ÜRÜN_GİDERLERİ"}
            >
              <option value="">—</option>
              {urunler.map((u, i) => (
                <option key={`urun-${i}-${u}`} value={u}>{u}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-tedarikciAdi">Hizmet Veren / Tedarikçi</Label>
            <Select id="edit-tedarikciAdi" name="tedarikciAdi" defaultValue={row._partnerName}>
              <option value="">—</option>
              {tedarikciler.map((t, i) => (
                <option key={`tedarikci-${i}-${t}`} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-toplamTutar">Toplam Tutar</Label>
            <Input id="edit-toplamTutar" name="toplamTutar" type="number" step="0.01" defaultValue={row._totalAmount} />
          </div>
          <div>
            <Label htmlFor="edit-pesinOdenen">Peşin Ödenen Tutar</Label>
            <Input id="edit-pesinOdenen" name="pesinOdenen" type="number" step="0.01" defaultValue={row._paidAmount} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="edit-notlar">Notlar</Label>
            <Textarea id="edit-notlar" name="notlar" rows={2} defaultValue={row._notes} />
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
