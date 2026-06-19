import type { CustomerStatement, SupplierStatement } from "@/lib/api";

export type EkstreLine = {
  date: Date;
  label: string;
  debit: number;
  credit: number;
};

export function buildMusteriEkstreLines(rapor: CustomerStatement): EkstreLine[] {
  const lines: EkstreLine[] = [];
  for (const s of rapor.sales) {
    lines.push({
      date: new Date(s.date),
      label: `Satış — ${s.product.name}`,
      debit: s.vatIncludedAmount,
      credit: 0,
    });
    if (s.paidAmount > 0) {
      lines.push({
        date: new Date(s.date),
        label: `Peşin ödeme — ${s.product.name}`,
        debit: 0,
        credit: s.paidAmount,
      });
    }
  }
  for (const c of rapor.collections) {
    lines.push({
      date: new Date(c.date),
      label: c.notes?.trim() || "Tahsilat",
      debit: 0,
      credit: c.amount,
    });
  }
  return lines.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function buildTedarikciEkstreLines(rapor: SupplierStatement): EkstreLine[] {
  const lines: EkstreLine[] = [];
  for (const p of rapor.purchases) {
    lines.push({
      date: new Date(p.date),
      label: `Alım — ${p.product.name}`,
      debit: p.vatIncludedAmount,
      credit: 0,
    });
    if (p.paidAmount > 0) {
      lines.push({
        date: new Date(p.date),
        label: `Peşin ödeme — ${p.product.name}`,
        debit: 0,
        credit: p.paidAmount,
      });
    }
  }
  for (const e of rapor.expenses) {
    lines.push({
      date: new Date(e.date),
      label: `Gider — ${e.category}`,
      debit: e.totalAmount,
      credit: 0,
    });
    if (e.paidAmount > 0) {
      lines.push({
        date: new Date(e.date),
        label: `Gider peşin — ${e.category}`,
        debit: 0,
        credit: e.paidAmount,
      });
    }
  }
  for (const pay of rapor.payments) {
    lines.push({
      date: new Date(pay.date),
      label: pay.notes?.trim() || "Ödeme",
      debit: 0,
      credit: pay.amount,
    });
  }
  return lines.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function withRunningBalance(lines: EkstreLine[]) {
  let balance = 0;
  return lines.map((line) => {
    balance += line.debit - line.credit;
    return { ...line, balance };
  });
}

export type EkstreTotals = {
  debit: number;
  credit: number;
  balance: number;
};

export function musteriTotals(rapor: CustomerStatement): EkstreTotals {
  return {
    debit: rapor.vatIncludedTotal,
    credit: rapor.upfront + rapor.collected,
    balance: rapor.receivable,
  };
}

export function tedarikciTotals(rapor: SupplierStatement): EkstreTotals {
  return {
    debit: rapor.purchaseTotal + rapor.expenseTotal,
    credit: rapor.upfront + rapor.expenseUpfront + rapor.paid,
    balance: rapor.debt,
  };
}
