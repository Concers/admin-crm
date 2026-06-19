import type { CashFlow, Expense, Partner, Purchase, SupplierStatement } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";
import { partnerTypeLabel } from "@/lib/partner-types";

export type TedarikciListeRow = {
  ad: string;
  tip: string;
  alimToplam: string;
  pesinOdenen: string;
  digerGider: string;
  giderPesin: string;
  yapilanOdeme: string;
  borc: string;
  _alim: number;
  _pesin: number;
  _gider: number;
  _giderPesin: number;
  _odeme: number;
  _borc: number;
};

export type TedarikciRaporTotals = {
  purchaseTotal: number;
  upfront: number;
  expenseTotal: number;
  expenseUpfront: number;
  paid: number;
  debt: number;
  purchaseCount: number;
  paymentCount: number;
  expenseCount: number;
  totalQty: number;
};

export function buildTedarikciRaporTotals(rapor: SupplierStatement): TedarikciRaporTotals {
  return {
    purchaseTotal: rapor.purchaseTotal,
    upfront: rapor.upfront,
    expenseTotal: rapor.expenseTotal,
    expenseUpfront: rapor.expenseUpfront,
    paid: rapor.paid,
    debt: rapor.debt,
    purchaseCount: rapor.purchases.length,
    paymentCount: rapor.payments.length,
    expenseCount: rapor.expenses.length,
    totalQty: rapor.purchases.reduce((s, p) => s + p.quantity, 0),
  };
}

export function buildTedarikciListeRows(
  tedarikciler: Partner[],
  purchases: Purchase[],
  payments: CashFlow[],
  expenses: Expense[],
): TedarikciListeRow[] {
  const stats = new Map<
    number,
    { alim: number; pesin: number; gider: number; giderPesin: number; odeme: number }
  >();

  for (const p of purchases) {
    const id = p.supplier.id;
    const cur = stats.get(id) ?? { alim: 0, pesin: 0, gider: 0, giderPesin: 0, odeme: 0 };
    stats.set(id, {
      ...cur,
      alim: cur.alim + p.vatIncludedAmount,
      pesin: cur.pesin + p.paidAmount,
    });
  }
  for (const e of expenses) {
    if (!e.partner?.id) continue;
    const id = e.partner.id;
    const cur = stats.get(id) ?? { alim: 0, pesin: 0, gider: 0, giderPesin: 0, odeme: 0 };
    stats.set(id, {
      ...cur,
      gider: cur.gider + e.totalAmount,
      giderPesin: cur.giderPesin + e.paidAmount,
    });
  }
  for (const c of payments) {
    const id = c.partner.id;
    const cur = stats.get(id) ?? { alim: 0, pesin: 0, gider: 0, giderPesin: 0, odeme: 0 };
    stats.set(id, { ...cur, odeme: cur.odeme + c.amount });
  }

  return tedarikciler
    .map((t) => {
      const s = stats.get(t.id) ?? { alim: 0, pesin: 0, gider: 0, giderPesin: 0, odeme: 0 };
      const borc = s.alim - s.pesin + s.gider - s.giderPesin - s.odeme;
      return {
        ad: t.name,
        tip: partnerTypeLabel(t.type),
        alimToplam: formatCurrency(s.alim),
        pesinOdenen: formatCurrency(s.pesin),
        digerGider: formatCurrency(s.gider),
        giderPesin: formatCurrency(s.giderPesin),
        yapilanOdeme: formatCurrency(s.odeme),
        borc: formatCurrency(borc),
        _alim: s.alim,
        _pesin: s.pesin,
        _gider: s.gider,
        _giderPesin: s.giderPesin,
        _odeme: s.odeme,
        _borc: borc,
      };
    })
    .filter((r) => r._alim > 0 || r._gider > 0 || r._odeme > 0)
    .sort((a, b) => b._borc - a._borc || a.ad.localeCompare(b.ad, "tr"));
}
