"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { ItemsEditor } from "./items-editor";
import { createPriceListAction } from "./actions";

export function FiyatForm({
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
        run(() => createPriceListAction(new FormData(form)), {
          success: "Fiyat listesi eklendi.",
        });
        form.reset();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Liste Adı *</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="currency">Para Birimi *</Label>
          <Input id="currency" name="currency" defaultValue="TRY" required />
        </div>
      </div>
      <ItemsEditor products={products} />
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Kaydediliyor..." : "Fiyat Listesi Ekle"}
      </Button>
    </form>
  );
}
