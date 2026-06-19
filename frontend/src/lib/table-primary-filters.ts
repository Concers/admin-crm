/** Her tablo için önemli sütun filtreleri (toolbar'da gösterilir, en fazla 5). */

export const ISKONTO_PRIMARY_FILTER_KEYS = ["tur", "cari", "urun", "durum"] as const;

export const TAHSILAT_PRIMARY_FILTER_KEYS = ["musteriAdi", "hesap"] as const;

export const TEDARIKCI_ODEME_PRIMARY_FILTER_KEYS = ["tedarikciAdi", "hesap"] as const;

export const FIYAT_PRIMARY_FILTER_KEYS = ["paraBirimi", "segment", "durum"] as const;

export const FATURA_PRIMARY_FILTER_KEYS = ["tur", "cari", "durum"] as const;

export const SIPARIS_PRIMARY_FILTER_KEYS = ["tur", "cari", "durum"] as const;

export const TEKLIF_PRIMARY_FILTER_KEYS = ["cari", "durum"] as const;

export const IADE_PRIMARY_FILTER_KEYS = ["tur", "cari", "urun"] as const;

export const EMIR_PRIMARY_FILTER_KEYS = ["durum", "mamul", "recete"] as const;

export const RECETE_PRIMARY_FILTER_KEYS = ["mamul", "durum"] as const;

export const HAREKET_PRIMARY_FILTER_KEYS = ["urun", "tur", "depo"] as const;

export const DEPO_PRIMARY_FILTER_KEYS = ["depo", "lokasyon"] as const;

export const URUN_TAKIP_PRIMARY_FILTER_KEYS = [
  "urunAdi",
  "tedarikci",
  "sinif",
  "ureticiKim",
] as const;

export const CARI_TANIM_PRIMARY_FILTER_KEYS = ["tipLabel"] as const;

export const URUN_TANIM_PRIMARY_FILTER_KEYS = ["raf"] as const;

export const ISLEM_GECMISI_PRIMARY_FILTER_KEYS = ["kullanici", "islem", "kayit"] as const;

export const KULLANICI_PRIMARY_FILTER_KEYS = ["rol", "durum"] as const;

export const MUTABAKAT_OZET_PRIMARY_FILTER_KEYS = ["cari"] as const;

export const MUTABAKAT_FATURA_PRIMARY_FILTER_KEYS = ["tur", "durum"] as const;

export const MUTABAKAT_ODEME_PRIMARY_FILTER_KEYS = ["tur"] as const;

export const MUTABAKAT_TAHSIS_PRIMARY_FILTER_KEYS = ["fatura", "odeme"] as const;

export const STOK_RAPOR_PRIMARY_FILTER_KEYS = ["raf", "durum", "birim"] as const;

export const ABC_RAPOR_PRIMARY_FILTER_KEYS = ["sinif"] as const;

export const DUSUK_STOK_PRIMARY_FILTER_KEYS = ["aciliyet", "birim"] as const;

export const GELIR_GIDER_TABLO_PRIMARY_FILTER_KEYS = [
  "satisUrun",
  "alimUrun",
  "genelGiderTur",
] as const;

export const GIDER_MERKEZI_PRIMARY_FILTER_KEYS = ["trend"] as const;

export const MUSTERI_LISTE_PRIMARY_FILTER_KEYS = ["tip"] as const;

export const MUSTERI_ALACAK_PRIMARY_FILTER_KEYS = ["ad"] as const;

export const MUSTERI_KARLILIK_PRIMARY_FILTER_KEYS = ["durum"] as const;

export const SATIS_TEMSILCISI_PRIMARY_FILTER_KEYS = ["durum"] as const;

export const AGING_RAPOR_PRIMARY_FILTER_KEYS = ["risk", "ad"] as const;

export const NAKIT_AKIS_PRIMARY_FILTER_KEYS = ["durum"] as const;

export const OLU_STOK_PRIMARY_FILTER_KEYS = ["durum", "birim"] as const;

export const STOK_HAREKET_RAPOR_PRIMARY_FILTER_KEYS = ["tur", "yon", "neden"] as const;

export const TEDARIKCI_RAPOR_PRIMARY_FILTER_KEYS = ["tip"] as const;

export const TEDARIKCI_LISTE_PRIMARY_FILTER_KEYS = ["tip"] as const;

export const TEDARIKCI_BORC_PRIMARY_FILTER_KEYS = ["ad"] as const;

export const URUN_LISTE_PRIMARY_FILTER_KEYS = ["raf"] as const;

export const URUN_SATIS_PRIMARY_FILTER_KEYS = ["musteri"] as const;

export const URUN_ALIM_PRIMARY_FILTER_KEYS = ["tedarikci"] as const;

export const URUN_GIDER_PRIMARY_FILTER_KEYS = ["kategori", "tedarikci"] as const;
