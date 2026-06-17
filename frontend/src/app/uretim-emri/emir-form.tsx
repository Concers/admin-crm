"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { createProductionOrderAction } from "./actions";

export function EmirForm({
  products,
}: {
  products: { id: number; name: string }[];
}) {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createProductionOrderAction(new FormData(form)), {
          success: "Üretim emri eklendi.",
        });
        form.reset();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="productId">Mamul *</Label>
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
          <Input id="quantity" name="quantity" type="number" step="1" min="0" required />
        </div>
        <div>
          <Label htmlFor="status">Durum *</Label>
          <Select id="status" name="status" required defaultValue="PLANNED">
            <option value="PLANNED">Planlandı</option>
            <option value="IN_PROGRESS">Üretimde</option>
            <option value="DONE">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate">Başlangıç</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        <div>
          <Label htmlFor="endDate">Bitiş</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notlar</Label>
        <Textarea id="notes" name="notes" />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Kaydediliyor..." : "Üretim Emri Ekle"}
      </Button>
    </form>
  );
}
