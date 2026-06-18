import type { PriceListDoc } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export function mapFiyatRows(lists: PriceListDoc[]) {
  return lists.map((pl) => {
    const avgPrice =
      pl.items.length > 0
        ? pl.items.reduce((acc, i) => acc + i.price, 0) / pl.items.length
        : 0;
    return {
      id: pl.id,
      ad: pl.name,
      paraBirimi: pl.currency,
      segment: pl.tier?.trim() || "—",
      kalemSayisi: pl.items.length,
      ortalamaFiyat: pl.items.length > 0 ? formatCurrency(avgPrice) : "—",
      durum: pl.isActive ? "Aktif" : "Pasif",
      _name: pl.name,
      _currency: pl.currency,
      _tier: pl.tier ?? "",
      _isActive: pl.isActive,
      _avgPrice: avgPrice,
      _items: pl.items.map((i) => ({ productId: i.productId, price: i.price })),
    };
  });
}

export type FiyatTableRow = ReturnType<typeof mapFiyatRows>[number];
