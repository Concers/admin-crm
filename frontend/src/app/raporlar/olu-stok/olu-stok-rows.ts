import type { DeadStockRow } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { formatQty } from "../stok/stok-rows";

export type OluStokDurum = "Hiç satılmamış" | "Uzun süredir bekliyor";

export type OluStokTableRow = {
  urun: string;
  birim: string;
  durum: OluStokDurum;
  stok: string;
  sonSatis: string;
  bekleme: string;
  deger: string;
  _stock: number;
  _idleDays: number | null;
  _value: number;
  _lastSale: string | null;
};

export type OluStokTotals = {
  urunCount: number;
  hicSatilmamisCount: number;
  uzunBekleyenCount: number;
  toplamStok: number;
  toplamDeger: number;
  ortBekleme: number;
  gunEsik: number;
};

function resolveDurum(lastSale: string | null): OluStokDurum {
  return lastSale ? "Uzun süredir bekliyor" : "Hiç satılmamış";
}

export function buildOluStokTotals(liste: DeadStockRow[], gunEsik: number): OluStokTotals {
  if (liste.length === 0) {
    return {
      urunCount: 0,
      hicSatilmamisCount: 0,
      uzunBekleyenCount: 0,
      toplamStok: 0,
      toplamDeger: 0,
      ortBekleme: 0,
      gunEsik,
    };
  }

  const idleWithDays = liste.filter((r) => r.idleDays != null);
  const ortBekleme =
    idleWithDays.length > 0
      ? Math.round(idleWithDays.reduce((s, r) => s + (r.idleDays ?? 0), 0) / idleWithDays.length)
      : 0;

  return {
    urunCount: liste.length,
    hicSatilmamisCount: liste.filter((r) => !r.lastSale).length,
    uzunBekleyenCount: liste.filter((r) => r.lastSale).length,
    toplamStok: liste.reduce((s, r) => s + r.stock, 0),
    toplamDeger: liste.reduce((s, r) => s + r.value, 0),
    ortBekleme,
    gunEsik,
  };
}

export function buildOluStokTableRows(liste: DeadStockRow[]): OluStokTableRow[] {
  return liste.map((row) => ({
    urun: row.product,
    birim: row.unit || "—",
    durum: resolveDurum(row.lastSale),
    stok: formatQty(row.stock, row.unit),
    sonSatis: row.lastSale ? formatDate(new Date(row.lastSale)) : "Hiç satılmamış",
    bekleme: row.idleDays != null ? `${row.idleDays} gün` : "—",
    deger: formatCurrency(row.value),
    _stock: row.stock,
    _idleDays: row.idleDays,
    _value: row.value,
    _lastSale: row.lastSale,
  }));
}
