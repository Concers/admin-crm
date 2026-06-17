"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { createOdeme } from "./actions";

export function OdemeForm({ tedarikciler }: { tedarikciler: string[] }) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => createOdeme(new FormData(e.currentTarget)), {
          success: "Ödeme kaydı eklendi.",
        });
        e.currentTarget.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div><Label htmlFor="tarih">Tarih *</Label><Input id="tarih" name="tarih" type="date" required /></div>
      <div>
        <Label htmlFor="tedarikciAdi">Tedarikçi *</Label>
        <Select id="tedarikciAdi" name="tedarikciAdi" required defaultValue="">
          <option value="" disabled>Seçin</option>
          {tedarikciler.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      <div><Label htmlFor="odenenTutar">Ödenen Tutar *</Label><Input id="odenenTutar" name="odenenTutar" type="number" step="0.01" required /></div>
      <div className="sm:col-span-2"><Label htmlFor="notlar">Notlar</Label><Textarea id="notlar" name="notlar" rows={2} /></div>
      <div className="flex items-end"><Button type="submit" disabled={pending}><Plus className="h-4 w-4" />{pending ? "Kaydediliyor..." : "Ödeme Ekle"}</Button></div>
    </form>
  );
}
