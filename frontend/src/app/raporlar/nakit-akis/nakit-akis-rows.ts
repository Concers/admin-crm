import type { CashFlowRow } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type NakitAkisDurum = "Pozitif" | "Negatif" | "Dengede";

export type NakitAkisRow = {
  ay: string;
  ayKey: string;
  giris: string;
  cikis: string;
  net: string;
  kumulatif: string;
  durum: NakitAkisDurum;
  _inflow: number;
  _outflow: number;
  _net: number;
  _cumulative: number;
};

export type NakitAkisTotals = {
  aySayisi: number;
  toplamGiris: number;
  toplamCikis: number;
  toplamNet: number;
  sonKumulatif: number;
  pozitifAyCount: number;
  negatifAyCount: number;
  dengedeAyCount: number;
  enYuksekGirisAy: string | null;
  enYuksekCikisAy: string | null;
};

export type NakitAkisHorizon = 3 | 6 | 9 | 12;

const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"] as const;

export function formatAyLabel(key: string): string {
  const [y, m] = key.split("-");
  const idx = Number(m) - 1;
  if (idx < 0 || idx > 11 || !y) return key;
  return `${AYLAR[idx]} ${y}`;
}

function resolveDurum(net: number): NakitAkisDurum {
  if (net > 0) return "Pozitif";
  if (net < 0) return "Negatif";
  return "Dengede";
}

export function resolveNakitAkisHorizon(ay?: string): { months: NakitAkisHorizon; label: string } {
  switch (ay) {
    case "3":
      return { months: 3, label: "3 ay" };
    case "9":
      return { months: 9, label: "9 ay" };
    case "12":
      return { months: 12, label: "12 ay" };
    default:
      return { months: 6, label: "6 ay (varsayılan)" };
  }
}

export function buildNakitAkisTotals(data: CashFlowRow[]): NakitAkisTotals {
  const toplamGiris = data.reduce((s, d) => s + d.inflow, 0);
  const toplamCikis = data.reduce((s, d) => s + d.outflow, 0);
  const toplamNet = data.reduce((s, d) => s + d.net, 0);
  const sonKumulatif = data.length > 0 ? data[data.length - 1].cumulative : 0;

  const enYuksekGiris = [...data].sort((a, b) => b.inflow - a.inflow)[0];
  const enYuksekCikis = [...data].sort((a, b) => b.outflow - a.outflow)[0];

  return {
    aySayisi: data.length,
    toplamGiris,
    toplamCikis,
    toplamNet,
    sonKumulatif,
    pozitifAyCount: data.filter((d) => d.net > 0).length,
    negatifAyCount: data.filter((d) => d.net < 0).length,
    dengedeAyCount: data.filter((d) => d.net === 0).length,
    enYuksekGirisAy: enYuksekGiris && enYuksekGiris.inflow > 0 ? formatAyLabel(enYuksekGiris.key) : null,
    enYuksekCikisAy: enYuksekCikis && enYuksekCikis.outflow > 0 ? formatAyLabel(enYuksekCikis.key) : null,
  };
}

export function buildNakitAkisRows(data: CashFlowRow[]): NakitAkisRow[] {
  return data.map((d) => ({
    ay: formatAyLabel(d.key),
    ayKey: d.key,
    giris: formatCurrency(d.inflow),
    cikis: formatCurrency(d.outflow),
    net: formatCurrency(d.net),
    kumulatif: formatCurrency(d.cumulative),
    durum: resolveDurum(d.net),
    _inflow: d.inflow,
    _outflow: d.outflow,
    _net: d.net,
    _cumulative: d.cumulative,
  }));
}
