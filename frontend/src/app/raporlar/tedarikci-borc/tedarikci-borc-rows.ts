import type { PartnerBalance } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type TedarikciBorcRow = {
  ad: string;
  alimToplam: string;
  digerGider: string;
  odenen: string;
  bizimAlacak: string;
  netBorc: string;
  _alim: number;
  _gider: number;
  _odenen: number;
  _alacak: number;
  _borc: number;
};

export type TedarikciBorcOzet = {
  toplamBorc: number;
  cariSayisi: number;
  toplamAlim: number;
  toplamGider: number;
};

export function buildTedarikciBorcRows(liste: (PartnerBalance & { debt: number })[]): TedarikciBorcRow[] {
  return liste.map((l) => ({
    ad: l.name,
    alimToplam: formatCurrency(l.purchaseTotal),
    digerGider: formatCurrency(l.expenseTotal),
    odenen: formatCurrency(l.paidToThem),
    bizimAlacak: formatCurrency(l.receivable),
    netBorc: formatCurrency(l.debt),
    _alim: l.purchaseTotal,
    _gider: l.expenseTotal,
    _odenen: l.paidToThem,
    _alacak: l.receivable,
    _borc: l.debt,
  }));
}

export function buildTedarikciBorcOzet(liste: (PartnerBalance & { debt: number })[]): TedarikciBorcOzet {
  return {
    toplamBorc: liste.reduce((s, l) => s + l.debt, 0),
    cariSayisi: liste.length,
    toplamAlim: liste.reduce((s, l) => s + l.purchaseTotal, 0),
    toplamGider: liste.reduce((s, l) => s + l.expenseTotal, 0),
  };
}
