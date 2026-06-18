/** Satış tablosu — Excel "Ürün Satış Giriş" başlık sırası. */
export const SATIS_TABLE_COLUMNS = [
  { key: "gun", label: "Gün" },
  { key: "ay", label: "Ay" },
  { key: "yil", label: "Yıl" },
  { key: "urunAdi", label: "Ürün Adı" },
  { key: "musteri", label: "Müşteri / Tedarikçi" },
  { key: "birimSatisFiyati", label: "Birim Satış Fiyatı" },
  { key: "satisAdeti", label: "Satış Adedi" },
  { key: "toplamTutar", label: "Toplam Tutar" },
  { key: "kdvOrani", label: "KDV Oranı" },
  { key: "kdvDahilTutar", label: "KDV Dahil Tutar" },
  { key: "pesinOdenen", label: "Peşin Ödenen" },
  { key: "raf", label: "Hangi Raf" },
  { key: "notlar", label: "Notlar" },
  { key: "alimBirimMaliyeti", label: "Alım Birim Maliyeti" },
  { key: "uretimBirimMaliyeti", label: "Üretim Birim Maliyeti" },
  { key: "genelGiderMaliyeti", label: "Genel Gider Maliyeti" },
  { key: "toplamBirimMaliyeti", label: "Toplam Birim Maliyeti" },
  { key: "karYuzdesi", label: "Kâr %" },
] as const;

export function formatKdvOrani(rate: number): string {
  const pct = rate * 100;
  return Number.isInteger(pct) ? `%${pct}` : `%${pct.toFixed(1)}`;
}
