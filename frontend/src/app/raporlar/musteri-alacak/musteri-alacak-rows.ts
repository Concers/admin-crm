import type { PartnerBalance } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export type MusteriAlacakRow = {
  ad: string;
  satisToplam: string;
  pesinOdenen: string;
  tahsilat: string;
  bizimBorc: string;
  netAlacak: string;
  _satis: number;
  _pesin: number;
  _tahsilat: number;
  _borc: number;
  _alacak: number;
};

export type MusteriAlacakOzet = {
  toplamAlacak: number;
  cariSayisi: number;
  toplamSatis: number;
  toplamTahsilat: number;
};

export function buildMusteriAlacakRows(liste: PartnerBalance[]): MusteriAlacakRow[] {
  return liste.map((l) => ({
    ad: l.name,
    satisToplam: formatCurrency(l.salesTotal),
    pesinOdenen: formatCurrency(l.salesUpfront),
    tahsilat: formatCurrency(l.collected),
    bizimBorc: formatCurrency(l.payable),
    netAlacak: formatCurrency(l.net),
    _satis: l.salesTotal,
    _pesin: l.salesUpfront,
    _tahsilat: l.collected,
    _borc: l.payable,
    _alacak: l.net,
  }));
}

export function buildMusteriAlacakOzet(liste: PartnerBalance[]): MusteriAlacakOzet {
  return {
    toplamAlacak: liste.reduce((s, l) => s + l.net, 0),
    cariSayisi: liste.length,
    toplamSatis: liste.reduce((s, l) => s + l.salesTotal, 0),
    toplamTahsilat: liste.reduce((s, l) => s + l.collected, 0),
  };
}
