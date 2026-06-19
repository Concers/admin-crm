import type { LowStockRow } from "@/lib/api";
import { formatQty } from "../stok/stok-rows";

export type DusukStokAciliyet = "Kritik" | "Uyarı" | "Eksi Stok";

export type DusukStokTableRow = {
  urun: string;
  birim: string;
  aciliyet: DusukStokAciliyet;
  stok: string;
  minStok: string;
  eksik: string;
  doluluk: string;
  _stock: number;
  _minStock: number;
  _eksik: number;
  _doluluk: number;
};

export type DusukStokTotals = {
  urunCount: number;
  kritikCount: number;
  uyariCount: number;
  eksiCount: number;
  totalDeficit: number;
  avgFillPct: number;
};

function resolveAciliyet(stock: number): DusukStokAciliyet {
  if (stock < 0) return "Eksi Stok";
  if (stock === 0) return "Kritik";
  return "Uyarı";
}

function fillPct(stock: number, minStock: number) {
  if (minStock <= 0) return 0;
  return Math.round((stock / minStock) * 1000) / 10;
}

export function buildDusukStokTotals(liste: LowStockRow[]): DusukStokTotals {
  if (liste.length === 0) {
    return { urunCount: 0, kritikCount: 0, uyariCount: 0, eksiCount: 0, totalDeficit: 0, avgFillPct: 0 };
  }

  const acc = liste.reduce(
    (sum, row) => {
      const aciliyet = resolveAciliyet(row.stock);
      const eksik = Math.max(0, row.minStock - row.stock);
      return {
        urunCount: sum.urunCount + 1,
        kritikCount: sum.kritikCount + (aciliyet === "Kritik" ? 1 : 0),
        uyariCount: sum.uyariCount + (aciliyet === "Uyarı" ? 1 : 0),
        eksiCount: sum.eksiCount + (aciliyet === "Eksi Stok" ? 1 : 0),
        totalDeficit: sum.totalDeficit + eksik,
        fillSum: sum.fillSum + fillPct(row.stock, row.minStock),
      };
    },
    { urunCount: 0, kritikCount: 0, uyariCount: 0, eksiCount: 0, totalDeficit: 0, fillSum: 0 }
  );

  return {
    urunCount: acc.urunCount,
    kritikCount: acc.kritikCount,
    uyariCount: acc.uyariCount,
    eksiCount: acc.eksiCount,
    totalDeficit: acc.totalDeficit,
    avgFillPct: Math.round((acc.fillSum / acc.urunCount) * 10) / 10,
  };
}

export function buildDusukStokTableRows(liste: LowStockRow[]): DusukStokTableRow[] {
  return liste.map((row) => {
    const eksik = Math.max(0, row.minStock - row.stock);
    const doluluk = fillPct(row.stock, row.minStock);
    return {
      urun: row.product,
      birim: row.unit || "—",
      aciliyet: resolveAciliyet(row.stock),
      stok: formatQty(row.stock, row.unit),
      minStok: formatQty(row.minStock, row.unit),
      eksik: formatQty(eksik, row.unit),
      doluluk: `%${doluluk}`,
      _stock: row.stock,
      _minStock: row.minStock,
      _eksik: eksik,
      _doluluk: doluluk,
    };
  });
}
