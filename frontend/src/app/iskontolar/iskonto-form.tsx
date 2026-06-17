"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { createDiscountAction } from "./actions";

export function IskontoForm() {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createDiscountAction(new FormData(form)), {
          success: "İskonto eklendi.",
        });
        form.reset();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="name">Ad *</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="percent">Yüzde (%)</Label>
          <Input id="percent" name="percent" type="number" step="0.01" min="0" />
        </div>
        <div>
          <Label htmlFor="amount">Tutar</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0" />
        </div>
        <div>
          <Label htmlFor="validFrom">Geçerlilik Başlangıç</Label>
          <Input id="validFrom" name="validFrom" type="date" />
        </div>
        <div>
          <Label htmlFor="validTo">Geçerlilik Bitiş</Label>
          <Input id="validTo" name="validTo" type="date" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Kaydediliyor..." : "İskonto Ekle"}
      </Button>
    </form>
  );
}
