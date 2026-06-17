"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { LineItemsEditor } from "../line-items";
import { createQuoteAction } from "./actions";

export function TeklifForm({
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
        run(() => createQuoteAction(new FormData(form)), {
          success: "Teklif eklendi.",
        });
        form.reset();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
          <Input id="validUntil" name="validUntil" type="date" />
        </div>
      </div>
      <LineItemsEditor products={products} />
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Kaydediliyor..." : "Teklif Ekle"}
      </Button>
    </form>
  );
}
