"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LineDraft = {
  productId: number | null;
  itemName: string;
  quantity: string;
  unit: string;
  note: string;
};

export const emptyLine = (): LineDraft => ({
  productId: null,
  itemName: "",
  quantity: "",
  unit: "",
  note: "",
});

export function LinesEditor({
  lines,
  onChange,
  products,
}: {
  lines: LineDraft[];
  onChange: (lines: LineDraft[]) => void;
  products: { id: number; name: string; unit?: string | null }[];
}) {
  const update = (i: number, patch: Partial<LineDraft>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const onNameChange = (i: number, name: string) => {
    const match = products.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());
    update(i, {
      itemName: name,
      productId: match?.id ?? null,
      ...(match?.unit && !lines[i].unit ? { unit: match.unit } : {}),
    });
  };

  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1fr_90px_90px_1fr_36px] gap-2 text-xs font-medium text-[var(--muted-foreground)] sm:grid">
        <span>Kalem</span>
        <span>Miktar</span>
        <span>Birim</span>
        <span>Not</span>
        <span />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px_90px_1fr_36px]">
          <Input
            list="talep-urun-list"
            value={l.itemName}
            onChange={(e) => onNameChange(i, e.target.value)}
            placeholder="Ürün/malzeme"
            required
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            value={l.quantity}
            onChange={(e) => update(i, { quantity: e.target.value })}
            placeholder="Miktar"
            required
          />
          <Input value={l.unit} onChange={(e) => update(i, { unit: e.target.value })} placeholder="Birim" />
          <Input value={l.note} onChange={(e) => update(i, { note: e.target.value })} placeholder="Not" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[var(--danger)]"
            onClick={() => onChange(lines.filter((_, idx) => idx !== i))}
            aria-label="Kalemi sil"
            disabled={lines.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <datalist id="talep-urun-list">
        {products.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...lines, emptyLine()])}>
        <Plus className="h-4 w-4" /> Kalem Ekle
      </Button>
    </div>
  );
}

/** Convert drafts to the API line shape, dropping empty/invalid rows. */
export function draftsToLines(lines: LineDraft[]) {
  return lines
    .filter((l) => l.itemName.trim() && Number(l.quantity) > 0)
    .map((l) => ({
      productId: l.productId,
      itemName: l.itemName.trim(),
      quantity: Number(l.quantity),
      unit: l.unit.trim() || null,
      note: l.note.trim() || null,
    }));
}
