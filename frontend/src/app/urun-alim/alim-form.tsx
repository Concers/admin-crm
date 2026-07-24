"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createAlim } from "./actions";

export function AlimForm({
  urunler,
  tedarikciler,
}: {
  urunler: string[];
  tedarikciler: string[];
}) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createAlim(new FormData(e.currentTarget)), {
          success: "Alım kaydı eklendi.",
        });
        e.currentTarget.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label htmlFor="tarih">Tarih *</Label>
        <Input id="tarih" name="tarih" type="date" required />
      </div>
      <div>
        <Label htmlFor="urunAdi">Ürün Adı *</Label>
        {/* Ürün Detay kartlarından çekilir: tıklayarak seç veya yazarak çağır. */}
        <Input
          id="urunAdi"
          name="urunAdi"
          list="urun-detay-list"
          required
          autoComplete="off"
          placeholder="Ürün seçin veya yazın"
        />
        <datalist id="urun-detay-list">
          {urunler.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </div>
      <div>
        <Label htmlFor="tedarikci">Tedarikçi</Label>
        <Select id="tedarikci" name="tedarikci" defaultValue="">
          <option value="">—</option>
          {tedarikciler.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="birimAlimFiyati">Birim Alım Fiyatı</Label>
        <Input id="birimAlimFiyati" name="birimAlimFiyati" type="number" step="0.01" />
      </div>
      <div>
        <Label htmlFor="alimAdeti">Alım Adedi *</Label>
        <Input id="alimAdeti" name="alimAdeti" type="number" step="1" required />
      </div>
      <div>
        <Label htmlFor="kdvOrani">KDV Oranı</Label>
        <Input id="kdvOrani" name="kdvOrani" type="number" step="0.01" defaultValue="0.2" />
      </div>
      <div>
        <Label htmlFor="pesinOdenen">Peşin Ödenen</Label>
        <Input id="pesinOdenen" name="pesinOdenen" type="number" step="0.01" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "Alım Ekle"}
        </Button>
      </div>
    </form>
  );
}
