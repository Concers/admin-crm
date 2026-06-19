import type { AbcRow } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";
import { formatQty } from "../stok/stok-rows";

export type AbcSinif = "A" | "B" | "C";

export type AbcTableRow = {
  urun: string;
  ciro: string;
  adet: string;
  ciroPct: string;
  kumPct: string;
  sinif: AbcSinif;
  _revenue: number;
  _quantity: number;
  _revenuePct: number;
  _cumulativePct: number;
};

export type AbcSinifOzet = {
  count: number;
  ciro: number;
  ciroPay: number;
};

export type AbcTotals = {
  toplamCiro: number;
  urunSayisi: number;
  sinifA: AbcSinifOzet;
  sinifB: AbcSinifOzet;
  sinifC: AbcSinifOzet;
};

function sinifOzet(data: AbcRow[], sinif: AbcSinif, toplamCiro: number): AbcSinifOzet {
  const items = data.filter((d) => d.class === sinif);
  const ciro = items.reduce((s, d) => s + d.revenue, 0);
  return {
    count: items.length,
    ciro,
    ciroPay: toplamCiro > 0 ? (ciro / toplamCiro) * 100 : 0,
  };
}

export function buildAbcTableRows(data: AbcRow[]): AbcTableRow[] {
  return data.map((d) => ({
    urun: d.product,
    ciro: formatCurrency(d.revenue),
    adet: formatQty(d.quantity),
    ciroPct: `${d.revenuePct.toFixed(1)}%`,
    kumPct: `${d.cumulativePct.toFixed(1)}%`,
    sinif: d.class,
    _revenue: d.revenue,
    _quantity: d.quantity,
    _revenuePct: d.revenuePct,
    _cumulativePct: d.cumulativePct,
  }));
}

export function buildAbcTotals(data: AbcRow[]): AbcTotals {
  const toplamCiro = data.reduce((s, d) => s + d.revenue, 0);
  return {
    toplamCiro,
    urunSayisi: data.length,
    sinifA: sinifOzet(data, "A", toplamCiro),
    sinifB: sinifOzet(data, "B", toplamCiro),
    sinifC: sinifOzet(data, "C", toplamCiro),
  };
}
