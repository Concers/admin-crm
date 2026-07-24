"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { createProductAction } from "./actions";

export function YeniUrunForm() {
  const { run, pending } = useActionToast();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        run(() => createProductAction(new FormData(form)), { success: "Ürün oluşturuldu." });
        form.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="flex-1 min-w-[220px]">
        <Input name="name" required placeholder="Yeni ürün adı (ör. Akgünlük Toz Ekstraktı)" />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Ekleniyor…" : "Ürün Kartı Aç"}
      </Button>
    </form>
  );
}
