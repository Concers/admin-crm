import type { CustomerProfitRow } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type KarlilikDurum = "Kârlı" | "Zararlı" | "Başabaş";

export type MusteriKarlilikRow = {
  musteri: string;
  durum: KarlilikDurum;
  ciro: string;
  maliyet: string;
  kar: string;
  marj: string;
  _revenue: number;
  _cost: number;
  _profit: number;
  _marginPct: number;
};

export type MusteriKarlilikTotals = {
  musteriSayisi: number;
  karliCount: number;
  zararliCount: number;
  basabasCount: number;
  toplamCiro: number;
  toplamMaliyet: number;
  toplamKar: number;
  ortMarj: number;
};

function resolveDurum(profit: number): KarlilikDurum {
  if (Math.abs(profit) < 0.01) return "Başabaş";
  return profit > 0 ? "Kârlı" : "Zararlı";
}

export function buildMusteriKarlilikTotals(data: CustomerProfitRow[]): MusteriKarlilikTotals {
  if (data.length === 0) {
    return {
      musteriSayisi: 0,
      karliCount: 0,
      zararliCount: 0,
      basabasCount: 0,
      toplamCiro: 0,
      toplamMaliyet: 0,
      toplamKar: 0,
      ortMarj: 0,
    };
  }

  const toplamCiro = data.reduce((s, d) => s + d.revenue, 0);
  const toplamMaliyet = data.reduce((s, d) => s + d.cost, 0);
  const toplamKar = data.reduce((s, d) => s + d.profit, 0);

  return {
    musteriSayisi: data.length,
    karliCount: data.filter((d) => d.profit > 0.01).length,
    zararliCount: data.filter((d) => d.profit < -0.01).length,
    basabasCount: data.filter((d) => Math.abs(d.profit) <= 0.01).length,
    toplamCiro,
    toplamMaliyet,
    toplamKar,
    ortMarj: toplamCiro > 0 ? (toplamKar / toplamCiro) * 100 : 0,
  };
}

export function buildMusteriKarlilikRows(data: CustomerProfitRow[]): MusteriKarlilikRow[] {
  return data.map((d) => ({
    musteri: d.customer,
    durum: resolveDurum(d.profit),
    ciro: formatCurrency(d.revenue),
    maliyet: formatCurrency(d.cost),
    kar: formatCurrency(d.profit),
    marj: `%${d.marginPct.toFixed(1)}`,
    _revenue: d.revenue,
    _cost: d.cost,
    _profit: d.profit,
    _marginPct: d.marginPct,
  }));
}
