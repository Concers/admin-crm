import type { SalesRepPerformanceRow } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type SatisTemsilcisiDurum = "Kârlı" | "Zararlı" | "Başabaş";

export type SatisTemsilcisiRow = {
  temsilci: string;
  ciro: string;
  maliyet: string;
  kar: string;
  marj: string;
  siparis: string;
  durum: SatisTemsilcisiDurum;
  _revenue: number;
  _cost: number;
  _profit: number;
  _marginPct: number;
  _orders: number;
};

export type SatisTemsilcisiTotals = {
  temsilciSayisi: number;
  toplamCiro: number;
  toplamMaliyet: number;
  toplamKar: number;
  toplamSiparis: number;
  karliCount: number;
  zararliCount: number;
};

function resolveDurum(profit: number): SatisTemsilcisiDurum {
  if (profit > 0) return "Kârlı";
  if (profit < 0) return "Zararlı";
  return "Başabaş";
}

export function buildSatisTemsilcisiTotals(data: SalesRepPerformanceRow[]): SatisTemsilcisiTotals {
  return {
    temsilciSayisi: data.length,
    toplamCiro: data.reduce((s, d) => s + d.revenue, 0),
    toplamMaliyet: data.reduce((s, d) => s + d.cost, 0),
    toplamKar: data.reduce((s, d) => s + d.profit, 0),
    toplamSiparis: data.reduce((s, d) => s + d.orders, 0),
    karliCount: data.filter((d) => d.profit > 0).length,
    zararliCount: data.filter((d) => d.profit < 0).length,
  };
}

export function buildSatisTemsilcisiRows(data: SalesRepPerformanceRow[]): SatisTemsilcisiRow[] {
  return data.map((d) => ({
    temsilci: d.rep,
    ciro: formatCurrency(d.revenue),
    maliyet: formatCurrency(d.cost),
    kar: formatCurrency(d.profit),
    marj: `${d.marginPct.toFixed(1)}%`,
    siparis: String(d.orders),
    durum: resolveDurum(d.profit),
    _revenue: d.revenue,
    _cost: d.cost,
    _profit: d.profit,
    _marginPct: d.marginPct,
    _orders: d.orders,
  }));
}

export function resolveSatisTemsilcisiDonem(donem?: string): { start?: string; end?: string; label: string } {
  const now = new Date();
  const end = toDateOnly(now);
  switch (donem) {
    case "ay": {
      const start = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
      return { start, end, label: "Bu ay" };
    }
    case "yil": {
      const start = toDateOnly(new Date(now.getFullYear(), 0, 1));
      return { start, end, label: "Bu yıl" };
    }
    case "12ay": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { start: toDateOnly(d), end, label: "Son 12 ay" };
    }
    default:
      return { label: "Tüm zamanlar" };
  }
}

function toDateOnly(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
