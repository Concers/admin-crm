"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { createWarehouseAction } from "./actions";

export function DepoForm() {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createWarehouseAction(new FormData(form)), {
          success: "Depo eklendi.",
        });
        form.reset();
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div><Label htmlFor="name">Ad *</Label><Input id="name" name="name" required /></div>
      <div><Label htmlFor="location">Lokasyon</Label><Input id="location" name="location" /></div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          {pending ? "Kaydediliyor..." : "Depo Ekle"}
        </Button>
      </div>
    </form>
  );
}
