"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createTahsilat } from "./actions";

export function TahsilatForm({ musteriler }: { musteriler: string[] }) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createTahsilat(new FormData(e.currentTarget)), {
          success: "Tahsilat kaydı eklendi.",
        });
        e.currentTarget.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div><Label htmlFor="tarih">Tarih *</Label><Input id="tarih" name="tarih" type="date" required /></div>
      <div>
        <Label htmlFor="musteriAdi">Müşteri *</Label>
        <Select id="musteriAdi" name="musteriAdi" required defaultValue="">
          <option value="" disabled>Seçin</option>
          {musteriler.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </div>
      <div><Label htmlFor="tahsilatTutari">Tahsilat Tutarı *</Label><Input id="tahsilatTutari" name="tahsilatTutari" type="number" step="0.01" required /></div>
      <div className="flex items-end"><Button type="submit" disabled={pending}><Plus className="h-4 w-4" />{pending ? "Kaydediliyor..." : "Tahsilat Ekle"}</Button></div>
    </form>
  );
}
