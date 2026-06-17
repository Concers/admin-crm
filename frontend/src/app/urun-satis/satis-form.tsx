"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createSatis } from "./actions";

export function SatisForm({
  urunler,
  musteriler,
}: {
  urunler: string[];
  musteriler: string[];
}) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createSatis(new FormData(e.currentTarget)), {
          success: "Satış kaydı eklendi.",
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
        <Select id="urunAdi" name="urunAdi" required defaultValue="">
          <option value="" disabled>Seçin</option>
          {urunler.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="musteri">Müşteri / Tedarikçi</Label>
        <Select id="musteri" name="musteri" defaultValue="">
          <option value="">—</option>
          {musteriler.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="birimSatisFiyati">Birim Satış Fiyatı</Label>
        <Input id="birimSatisFiyati" name="birimSatisFiyati" type="number" step="0.01" />
      </div>
      <div>
        <Label htmlFor="satisAdeti">Satış Adedi *</Label>
        <Input id="satisAdeti" name="satisAdeti" type="number" step="1" required />
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
          {pending ? "Kaydediliyor..." : "Satış Ekle"}
        </Button>
      </div>
    </form>
  );
}
