"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Row = { productId: string; price: string };

const emptyRow: Row = { productId: "", price: "" };

/** Client-side price-list item editor; serialises to a hidden `items` JSON input. */
export function ItemsEditor({
  products,
}: {
  products: { id: number; name: string }[];
}) {
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);

  function update(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const serialised = JSON.stringify(
    rows
      .filter((r) => r.productId && Number(r.price) > 0)
      .map((r) => ({ productId: Number(r.productId), price: Number(r.price) }))
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name="items" value={serialised} />
      <Label>Kalemler *</Label>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto] sm:items-end"
          >
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
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Fiyat"
              value={row.price}
              onChange={(e) => update(i, { price: e.target.value })}
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
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Kalem Ekle
      </Button>
    </div>
  );
}
