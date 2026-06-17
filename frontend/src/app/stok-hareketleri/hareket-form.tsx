"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createStockMovementAction } from "./actions";

export function HareketForm({ urunler }: { urunler: string[] }) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createStockMovementAction(new FormData(form)), {
          success: "Stok hareketi eklendi.",
        });
        form.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label htmlFor="productName">Ürün *</Label>
        <Select id="productName" name="productName" required defaultValue="">
          <option value="" disabled>Seçin</option>
          {urunler.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="type">Tür *</Label>
        <Select id="type" name="type" required defaultValue="IN">
          <option value="IN">Giriş</option>
          <option value="OUT">Çıkış</option>
          <option value="ADJUSTMENT">Düzeltme</option>
          <option value="TRANSFER">Transfer</option>
          <option value="WASTE">Fire</option>
        </Select>
      </div>
      <div><Label htmlFor="quantity">Miktar *</Label><Input id="quantity" name="quantity" type="number" step="0.01" required /></div>
      <div><Label htmlFor="reason">Açıklama</Label><Input id="reason" name="reason" /></div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "Hareket Ekle"}
        </Button>
      </div>
    </form>
  );
}
