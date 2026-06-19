import type { CashFlow, CustomerStatement, Partner, Sale } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";
import { partnerTypeLabel } from "@/lib/partner-types";

export type MusteriListeRow = {
  ad: string;
  tip: string;
  satisToplam: string;
  kdvliToplam: string;
  pesinOdenen: string;
  tahsilat: string;
  alacak: string;
  _satis: number;
  _kdvli: number;
  _pesin: number;
  _tahsilat: number;
  _alacak: number;
};

export type MusteriRaporTotals = {
  saleTotal: number;
  vatIncludedTotal: number;
  upfront: number;
  collected: number;
  receivable: number;
  saleCount: number;
  collectionCount: number;
  totalQty: number;
};

export function buildMusteriRaporTotals(rapor: CustomerStatement): MusteriRaporTotals {
  return {
    saleTotal: rapor.saleTotal,
    vatIncludedTotal: rapor.vatIncludedTotal,
    upfront: rapor.upfront,
    collected: rapor.collected,
    receivable: rapor.receivable,
    saleCount: rapor.sales.length,
    collectionCount: rapor.collections.length,
    totalQty: rapor.sales.reduce((s, x) => s + x.quantity, 0),
  };
}

export function buildMusteriListeRows(
  partners: Partner[],
  sales: Sale[],
  collections: CashFlow[],
): MusteriListeRow[] {
  const stats = new Map<
    number,
    { satis: number; kdvli: number; pesin: number; tahsilat: number }
  >();

  for (const s of sales) {
    const id = s.customer.id;
    const cur = stats.get(id) ?? { satis: 0, kdvli: 0, pesin: 0, tahsilat: 0 };
    stats.set(id, {
      ...cur,
      satis: cur.satis + s.totalAmount,
      kdvli: cur.kdvli + s.vatIncludedAmount,
      pesin: cur.pesin + s.paidAmount,
    });
  }
  for (const c of collections) {
    const id = c.partner.id;
    const cur = stats.get(id) ?? { satis: 0, kdvli: 0, pesin: 0, tahsilat: 0 };
    stats.set(id, { ...cur, tahsilat: cur.tahsilat + c.amount });
  }

  return partners
    .map((p) => {
      const s = stats.get(p.id) ?? { satis: 0, kdvli: 0, pesin: 0, tahsilat: 0 };
      const alacak = s.kdvli - s.pesin - s.tahsilat;
      return {
        ad: p.name,
        tip: partnerTypeLabel(p.type),
        satisToplam: formatCurrency(s.satis),
        kdvliToplam: formatCurrency(s.kdvli),
        pesinOdenen: formatCurrency(s.pesin),
        tahsilat: formatCurrency(s.tahsilat),
        alacak: formatCurrency(alacak),
        _satis: s.satis,
        _kdvli: s.kdvli,
        _pesin: s.pesin,
        _tahsilat: s.tahsilat,
        _alacak: alacak,
      };
    })
    .filter((r) => r._kdvli > 0 || r._tahsilat > 0)
    .sort((a, b) => b._alacak - a._alacak || a.ad.localeCompare(b.ad, "tr"));
}
