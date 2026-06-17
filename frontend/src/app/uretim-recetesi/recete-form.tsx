"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { ComponentsEditor } from "./components-editor";
import { createBomAction } from "./actions";

export function ReceteForm({
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
        run(() => createBomAction(new FormData(form)), {
          success: "Reçete eklendi.",
        });
        form.reset();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Reçete Adı *</Label>
          <Input id="name" name="name" required />
        </div>
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
      </div>
      <ComponentsEditor products={products} />
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Kaydediliyor..." : "Reçete Ekle"}
      </Button>
    </form>
  );
}
