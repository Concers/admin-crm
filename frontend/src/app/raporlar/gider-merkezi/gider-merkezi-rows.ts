import type { CostCenterRow } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type GiderMerkeziTrend = "Artış" | "Azalış" | "Sabit" | "Yeni";

export type GiderMerkeziRow = {
  kategori: string;
  buDonem: string;
  oncekiDonem: string;
  degisim: string;
  trend: GiderMerkeziTrend;
  _current: number;
  _previous: number;
  _changePct: number;
};

export type GiderMerkeziTotals = {
  kategoriSayisi: number;
  toplamBuDonem: number;
  toplamOncekiDonem: number;
  netDegisim: number;
  netDegisimPct: number;
  artisCount: number;
  azalisCount: number;
  yeniCount: number;
};

function resolveTrend(current: number, previous: number, changePct: number): GiderMerkeziTrend {
  if (previous <= 0 && current > 0) return "Yeni";
  if (Math.abs(changePct) < 0.5) return "Sabit";
  return changePct > 0 ? "Artış" : "Azalış";
}

export function buildGiderMerkeziTotals(data: CostCenterRow[]): GiderMerkeziTotals {
  const toplamBuDonem = data.reduce((s, d) => s + d.current, 0);
  const toplamOncekiDonem = data.reduce((s, d) => s + d.previous, 0);
  const netDegisim = toplamBuDonem - toplamOncekiDonem;
  const netDegisimPct =
    toplamOncekiDonem > 0 ? (netDegisim / toplamOncekiDonem) * 100 : toplamBuDonem > 0 ? 100 : 0;

  return {
    kategoriSayisi: data.length,
    toplamBuDonem,
    toplamOncekiDonem,
    netDegisim,
    netDegisimPct,
    artisCount: data.filter((d) => d.changePct > 0.5 && d.previous > 0).length,
    azalisCount: data.filter((d) => d.changePct < -0.5 && d.current > 0).length,
    yeniCount: data.filter((d) => d.previous <= 0 && d.current > 0).length,
  };
}

export function buildGiderMerkeziRows(data: CostCenterRow[]): GiderMerkeziRow[] {
  return data.map((d) => {
    const trend = resolveTrend(d.current, d.previous, d.changePct);
    const sign = d.changePct > 0 ? "+" : "";
    return {
      kategori: d.category,
      buDonem: formatCurrency(d.current),
      oncekiDonem: formatCurrency(d.previous),
      degisim: `${sign}${d.changePct.toFixed(1)}%`,
      trend,
      _current: d.current,
      _previous: d.previous,
      _changePct: d.changePct,
    };
  });
}

export type GiderMerkeziDonem = "yil" | "ay" | "3ay" | "12ay";

export function resolveGiderMerkeziDonem(donem?: string): {
  key: GiderMerkeziDonem;
  start: string;
  end: string;
  label: string;
  oncekiLabel: string;
} {
  const now = new Date();
  const end = toDateOnly(now);

  switch (donem) {
    case "ay": {
      const start = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
      return { key: "ay", start, end, label: "Bu ay", oncekiLabel: "Geçen ay" };
    }
    case "3ay": {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      return { key: "3ay", start: toDateOnly(startDate), end, label: "Son 3 ay", oncekiLabel: "Önceki 3 ay" };
    }
    case "12ay": {
      const startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      return { key: "12ay", start: toDateOnly(startDate), end, label: "Son 12 ay", oncekiLabel: "Önceki 12 ay" };
    }
    default: {
      const start = toDateOnly(new Date(now.getFullYear(), 0, 1));
      return { key: "yil", start, end, label: "Bu yıl", oncekiLabel: "Geçen yıl (aynı süre)" };
    }
  }
}

function toDateOnly(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
