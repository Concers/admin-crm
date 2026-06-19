import type { StockRow } from "@/lib/api";

export type StokDurum = "Stokta" | "Tükendi" | "Eksi Stok";

export type StokTableRow = {
  urun: string;
  raf: string;
  birim: string;
  durum: StokDurum;
  toplamAlim: string;
  toplamSatis: string;
  stok: string;
  _purchased: number;
  _sold: number;
  _stock: number;
};

export type StokTotals = {
  urunCount: number;
  stoktaCount: number;
  tukendiCount: number;
  eksiCount: number;
  rafCount: number;
  totalPurchased: number;
  totalSold: number;
  totalStock: number;
};

const qtyFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

export function formatQty(value: number, unit?: string) {
  const n = qtyFmt.format(value);
  return unit ? `${n} ${unit}` : n;
}

function resolveDurum(stock: number): StokDurum {
  if (stock < 0) return "Eksi Stok";
  if (stock === 0) return "Tükendi";
  return "Stokta";
}

export function buildStokTotals(liste: StockRow[]): StokTotals {
  const raflar = new Set<string>();
  return liste.reduce(
    (acc, row) => {
      if (row.shelf?.trim()) raflar.add(row.shelf.trim());
      const durum = resolveDurum(row.stock);
      return {
        urunCount: acc.urunCount + 1,
        stoktaCount: acc.stoktaCount + (durum === "Stokta" ? 1 : 0),
        tukendiCount: acc.tukendiCount + (durum === "Tükendi" ? 1 : 0),
        eksiCount: acc.eksiCount + (durum === "Eksi Stok" ? 1 : 0),
        rafCount: raflar.size,
        totalPurchased: acc.totalPurchased + row.purchased,
        totalSold: acc.totalSold + row.sold,
        totalStock: acc.totalStock + row.stock,
      };
    },
    {
      urunCount: 0,
      stoktaCount: 0,
      tukendiCount: 0,
      eksiCount: 0,
      rafCount: 0,
      totalPurchased: 0,
      totalSold: 0,
      totalStock: 0,
    }
  );
}

export function buildStokTableRows(liste: StockRow[]): StokTableRow[] {
  return liste.map((row) => ({
    urun: row.product,
    raf: row.shelf?.trim() || "—",
    birim: row.unit || "—",
    durum: resolveDurum(row.stock),
    toplamAlim: formatQty(row.purchased, row.unit),
    toplamSatis: formatQty(row.sold, row.unit),
    stok: formatQty(row.stock, row.unit),
    _purchased: row.purchased,
    _sold: row.sold,
    _stock: row.stock,
  }));
}
