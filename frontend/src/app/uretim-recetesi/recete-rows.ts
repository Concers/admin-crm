import type { BomDoc } from "@/lib/api";

export function mapReceteRows(boms: BomDoc[], productName: Map<number, string>) {
  return boms.map((b) => ({
    id: b.id,
    ad: b.name,
    mamul: productName.get(b.productId) ?? String(b.productId),
    bilesenSayisi: b.components.length,
    durum: b.isActive ? "Aktif" : "Pasif",
    _productId: b.productId,
    _name: b.name,
    _isActive: b.isActive,
    _components: b.components.map((c) => ({
      componentProductId: c.componentProductId,
      quantity: c.quantity,
    })),
  }));
}

export type ReceteTableRow = ReturnType<typeof mapReceteRows>[number];
