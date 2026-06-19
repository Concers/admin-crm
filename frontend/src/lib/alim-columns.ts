/** Ürün alım tablosu sütunları. */
export const ALIM_TABLE_COLUMNS = [
  { key: "tarih", label: "Tarih" },
  { key: "urunAdi", label: "Ürün" },
  { key: "tedarikci", label: "Tedarikçi" },
  { key: "raf", label: "Raf" },
  { key: "birimAlimFiyati", label: "Birim Fiyat" },
  { key: "alimAdeti", label: "Adet" },
  { key: "toplamTutar", label: "Toplam" },
  { key: "kdvDahilTutar", label: "KDV Dahil" },
  { key: "pesinOdenen", label: "Peşin" },
] as const;

export const ALIM_PRIMARY_FILTER_KEYS = ["yil", "urunAdi", "tedarikci", "raf"] as const;
