import type { StockLedger, StockLedgerEntry } from "@/lib/api";
import { formatDate } from "@/lib/calculations";
import { TUR_LABEL } from "@/app/stok-hareketleri/hareket-rows";
import { formatQty } from "../stok/stok-rows";

const LEDGER_TUR_LABEL: Record<string, string> = {
  ...TUR_LABEL,
  ALIM: "Alım",
  SATIŞ: "Satış",
};

export type HareketYon = "Giriş" | "Çıkış";

export type HareketDokumTableRow = {
  tarih: string;
  tur: string;
  yon: HareketYon;
  giris: string;
  cikis: string;
  bakiye: string;
  neden: string;
  _date: string;
  _type: string;
  _in: number;
  _out: number;
  _balance: number;
};

export type HareketDokumTotals = {
  hareketCount: number;
  totalIn: number;
  totalOut: number;
  closingBalance: number;
  alimCount: number;
  satisCount: number;
  manualCount: number;
};

function turLabel(type: string) {
  return LEDGER_TUR_LABEL[type] ?? type;
}

function resolveYon(entry: StockLedgerEntry): HareketYon {
  return entry.in > 0 ? "Giriş" : "Çıkış";
}

export function buildHareketDokumTotals(ledger: StockLedger | null): HareketDokumTotals {
  if (!ledger?.movements.length) {
    return {
      hareketCount: 0,
      totalIn: 0,
      totalOut: 0,
      closingBalance: ledger?.balance ?? 0,
      alimCount: 0,
      satisCount: 0,
      manualCount: 0,
    };
  }

  return ledger.movements.reduce(
    (acc, m) => ({
      hareketCount: acc.hareketCount + 1,
      totalIn: acc.totalIn + m.in,
      totalOut: acc.totalOut + m.out,
      closingBalance: ledger.balance,
      alimCount: acc.alimCount + (m.type === "ALIM" ? 1 : 0),
      satisCount: acc.satisCount + (m.type === "SATIŞ" ? 1 : 0),
      manualCount:
        acc.manualCount + (m.type !== "ALIM" && m.type !== "SATIŞ" ? 1 : 0),
    }),
    {
      hareketCount: 0,
      totalIn: 0,
      totalOut: 0,
      closingBalance: ledger.balance,
      alimCount: 0,
      satisCount: 0,
      manualCount: 0,
    }
  );
}

export function buildHareketDokumTableRows(
  ledger: StockLedger | null,
  unit?: string
): HareketDokumTableRow[] {
  if (!ledger) return [];

  return ledger.movements.map((m) => ({
    tarih: formatDate(new Date(m.date)),
    tur: turLabel(m.type),
    yon: resolveYon(m),
    giris: m.in > 0 ? formatQty(m.in, unit) : "—",
    cikis: m.out > 0 ? formatQty(m.out, unit) : "—",
    bakiye: formatQty(m.balance, unit),
    neden: m.reason?.trim() || "—",
    _date: m.date,
    _type: m.type,
    _in: m.in,
    _out: m.out,
    _balance: m.balance,
  }));
}

export function buildBakiyeTrend(ledger: StockLedger | null) {
  if (!ledger?.movements.length) return [];
  const dateCounts = new Map<string, number>();
  return ledger.movements.map((m) => {
    const d = formatDate(new Date(m.date));
    const n = (dateCounts.get(d) ?? 0) + 1;
    dateCounts.set(d, n);
    const label = n > 1 ? `${d} (${n})` : d;
    return { label, value: m.balance };
  });
}
