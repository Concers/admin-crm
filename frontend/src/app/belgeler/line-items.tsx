"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/calculations";

export type LineRow = {
  productId: string;
  quantity: string;
  unitPrice: string;
};

const emptyRow: LineRow = { productId: "", quantity: "1", unitPrice: "" };

/**
 * Client-side line-item editor. Keeps an array of rows in state, renders a
 * product <select> + quantity + unitPrice per row, plus add/remove and a
 * running total. Serialises to a hidden `lines` input (JSON) so the parent
 * <form>'s server action can JSON.parse(formData.get("lines")).
 */
export function LineItemsEditor({
  products,
  initialLines,
}: {
  products: { id: number; name: string }[];
  initialLines?: { productId: number; quantity: number; unitPrice: number }[];
}) {
  const [rows, setRows] = useState<LineRow[]>(() =>
    initialLines?.length
      ? initialLines.map((l) => ({
          productId: String(l.productId),
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
        }))
      : [{ ...emptyRow }]
  );

  function update(i: number, patch: Partial<LineRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const total = rows.reduce((sum, r) => {
    const q = Number(r.quantity) || 0;
    const p = Number(r.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  // Only rows with a chosen product + positive qty are serialised.
  const serialised = JSON.stringify(
    rows
      .filter((r) => r.productId && Number(r.quantity) > 0)
      .map((r) => ({
        productId: Number(r.productId),
        quantity: Number(r.quantity),
        unitPrice: Number(r.unitPrice) || 0,
      }))
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name="lines" value={serialised} />
      <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        Kalemler *
      </Label>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:grid-cols-[1fr_100px_120px_auto] sm:items-end"
          >
            <div>
              <Select
                value={row.productId}
                onChange={(e) => update(i, { productId: e.target.value })}
              >
                <option value="" disabled>
                  Ürün seçin
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              type="number"
              step="1"
              min="0"
              placeholder="Miktar"
              value={row.quantity}
              onChange={(e) => update(i, { quantity: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Birim Fiyat"
              value={row.unitPrice}
              onChange={(e) => update(i, { unitPrice: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Satırı sil"
              aria-label="Satırı sil"
              onClick={() => removeRow(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Satır Ekle
        </Button>
        <span className="text-sm font-semibold tabular-nums text-indigo-700">
          Ara toplam: {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
