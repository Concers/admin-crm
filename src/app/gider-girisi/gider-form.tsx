"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GIDER_KATEGORILERI } from "@/lib/calculations";
import { useActionToast } from "@/hooks/use-action-toast";
import { createGider, deleteGider } from "./actions";

export function GiderForm({
  genelGiderTurleri,
  urunGiderTurleri,
  urunler,
  tedarikciler,
}: {
  genelGiderTurleri: string[];
  urunGiderTurleri: string[];
  urunler: string[];
  tedarikciler: string[];
}) {
  const { run, pending } = useActionToast();
  const [kategori, setKategori] = useState<string>("Genel_Giderler");

  const giderTurleri = useMemo(
    () => (kategori === "ÜRÜN_GİDERLERİ" ? urunGiderTurleri : genelGiderTurleri),
    [kategori, genelGiderTurleri, urunGiderTurleri]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createGider(new FormData(e.currentTarget)), {
          success: "Gider kaydı eklendi.",
        });
        e.currentTarget.reset();
        setKategori("Genel_Giderler");
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label htmlFor="tarih">Tarih *</Label>
        <Input id="tarih" name="tarih" type="date" required />
      </div>
      <div>
        <Label htmlFor="giderKategori">Ürün Gideri / Genel</Label>
        <Select
          id="giderKategori"
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
        <Label htmlFor="giderTuru">Gider Türü *</Label>
        <Select
          key={kategori}
          id="giderTuru"
          name="giderTuru"
          required
          defaultValue=""
        >
          <option value="" disabled>Seçin</option>
          {giderTurleri.map((g, i) => (
            <option key={`gider-${i}-${g}`} value={g}>{g}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="periyotAy">Gider Periyodu (Ay)</Label>
        <Input id="periyotAy" name="periyotAy" type="number" min="1" defaultValue="12" />
      </div>
      <div>
        <Label htmlFor="urunAdi">Ürün Adı{kategori === "ÜRÜN_GİDERLERİ" ? " *" : ""}</Label>
        <Select
          id="urunAdi"
          name="urunAdi"
          defaultValue=""
          required={kategori === "ÜRÜN_GİDERLERİ"}
        >
          <option value="">—</option>
          {urunler.map((u, i) => (
            <option key={`urun-${i}-${u}`} value={u}>{u}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="tedarikciAdi">Hizmet Veren / Tedarikçi</Label>
        <Select id="tedarikciAdi" name="tedarikciAdi" defaultValue="">
          <option value="">—</option>
          {tedarikciler.map((t, i) => (
            <option key={`tedarikci-${i}-${t}`} value={t}>{t}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="toplamTutar">Toplam Tutar</Label>
        <Input id="toplamTutar" name="toplamTutar" type="number" step="0.01" />
      </div>
      <div>
        <Label htmlFor="pesinOdenen">Peşin Ödenen Tutar</Label>
        <Input id="pesinOdenen" name="pesinOdenen" type="number" step="0.01" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notlar">Notlar</Label>
        <Textarea id="notlar" name="notlar" rows={2} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "Gider Ekle"}
        </Button>
      </div>
    </form>
  );
}

export function DeleteGiderButton({ id }: { id: number }) {
  const { run, pending } = useActionToast();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (confirm("Silmek istediğinize emin misiniz?")) {
          run(() => deleteGider(id), { success: "Gider kaydı silindi." });
        }
      }}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </Button>
  );
}
