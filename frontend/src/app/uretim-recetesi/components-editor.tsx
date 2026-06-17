"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Row = { componentProductId: string; quantity: string };

const emptyRow: Row = { componentProductId: "", quantity: "1" };

/**
 * Client-side component editor for a BOM. Serialises rows to a hidden
 * `components` JSON input so the server action can JSON.parse it.
 */
export function ComponentsEditor({
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
      .filter((r) => r.componentProductId && Number(r.quantity) > 0)
      .map((r) => ({
        componentProductId: Number(r.componentProductId),
        quantity: Number(r.quantity),
      }))
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name="components" value={serialised} />
      <Label>Bileşenler *</Label>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto] sm:items-end"
          >
            <Select
              value={row.componentProductId}
              onChange={(e) => update(i, { componentProductId: e.target.value })}
            >
              <option value="" disabled>
                Bileşen seçin
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
              placeholder="Miktar"
              value={row.quantity}
              onChange={(e) => update(i, { quantity: e.target.value })}
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
        Bileşen Ekle
      </Button>
    </div>
  );
}
