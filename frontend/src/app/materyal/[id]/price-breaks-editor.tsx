"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { MaterialPriceBreak } from "@/lib/api";
import { addPriceBreakAction, deletePriceBreakAction } from "../actions";

export function PriceBreaksEditor({
  materialId,
  priceBreaks,
  currency,
}: {
  materialId: number;
  priceBreaks: MaterialPriceBreak[];
  currency: string;
}) {
  const { run, pending } = useActionToast();

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted-foreground)]">
        Kademeli fiyat: belirli adetten itibaren geçerli birim/paket fiyatı (ör. 1000 adet → 2,50 ₺).
      </p>
      {priceBreaks.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Henüz fiyat kademesi yok.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)]">
          {priceBreaks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span>
                <strong>{b.minQty.toLocaleString("tr-TR")}</strong> adet ve üzeri →{" "}
                <strong>
                  {b.price} {currency}
                </strong>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-[var(--danger)]"
                disabled={pending}
                onClick={() =>
                  run(() => deletePriceBreakAction(materialId, b.id), { success: "Kademe silindi." })
                }
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          run(() => addPriceBreakAction(materialId, new FormData(form)), {
            success: "Fiyat kademesi eklendi.",
          });
          form.reset();
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <Input name="minQty" type="number" step="1" min="1" required placeholder="Adet (X)" />
        <Input name="price" type="number" step="0.01" min="0" required placeholder={`Fiyat (${currency})`} />
        <div>
          <Button type="submit" size="sm" disabled={pending}>
            <Plus className="h-4 w-4" />
            Kademe Ekle
          </Button>
        </div>
      </form>
    </div>
  );
}
