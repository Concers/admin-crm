"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { createReturnAction } from "./actions";

export function IadeForm({
  partners,
  products,
}: {
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
}) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createReturnAction(new FormData(form)), {
          success: "İade kaydı eklendi.",
        });
        form.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div>
        <Label htmlFor="type">Tür *</Label>
        <Select id="type" name="type" required defaultValue="SALES_RETURN">
          <option value="SALES_RETURN">Satış İadesi</option>
          <option value="PURCHASE_RETURN">Alım İadesi</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="partnerId">Cari *</Label>
        <Select id="partnerId" name="partnerId" required defaultValue="">
          <option value="" disabled>
            Seçin
          </option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="productId">Ürün *</Label>
        <Select id="productId" name="productId" required defaultValue="">
          <option value="" disabled>
            Seçin
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="quantity">Miktar *</Label>
        <Input id="quantity" name="quantity" type="number" step="1" min="1" required />
      </div>
      <div>
        <Label htmlFor="amount">Tutar</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0" />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="reason">Sebep</Label>
        <Textarea id="reason" name="reason" rows={2} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "İade Ekle"}
        </Button>
      </div>
    </form>
  );
}
