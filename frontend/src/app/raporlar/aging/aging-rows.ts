import type { AgingRow } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type AgingRisk = "Düşük" | "İzle" | "Orta" | "Yüksek";

export type AgingTableRow = {
  ad: string;
  risk: AgingRisk;
  d0_30: string;
  d31_60: string;
  d61_90: string;
  d90plus: string;
  toplam: string;
  _d0_30: number;
  _d31_60: number;
  _d61_90: number;
  _d90plus: number;
  _total: number;
};

export type AgingTotals = {
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d90plus: number;
  total: number;
  cariCount: number;
  risk90Count: number;
};

function resolveRisk(row: AgingRow): AgingRisk {
  if (row.d90plus > 0) return "Yüksek";
  if (row.d61_90 > 0) return "Orta";
  if (row.d31_60 > 0) return "İzle";
  return "Düşük";
}

export function buildAgingTotals(liste: AgingRow[]): AgingTotals {
  return liste.reduce(
    (acc, l) => ({
      d0_30: acc.d0_30 + l.d0_30,
      d31_60: acc.d31_60 + l.d31_60,
      d61_90: acc.d61_90 + l.d61_90,
      d90plus: acc.d90plus + l.d90plus,
      total: acc.total + l.total,
      cariCount: acc.cariCount + 1,
      risk90Count: acc.risk90Count + (l.d90plus > 0 ? 1 : 0),
    }),
    { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: 0, cariCount: 0, risk90Count: 0 }
  );
}

export function buildAgingTableRows(liste: AgingRow[]): AgingTableRow[] {
  return liste.map((l) => ({
    ad: l.name,
    risk: resolveRisk(l),
    d0_30: formatCurrency(l.d0_30),
    d31_60: formatCurrency(l.d31_60),
    d61_90: formatCurrency(l.d61_90),
    d90plus: formatCurrency(l.d90plus),
    toplam: formatCurrency(l.total),
    _d0_30: l.d0_30,
    _d31_60: l.d31_60,
    _d61_90: l.d61_90,
    _d90plus: l.d90plus,
    _total: l.total,
  }));
}
