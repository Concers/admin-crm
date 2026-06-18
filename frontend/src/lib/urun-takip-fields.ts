/** Excel "Yeni Ürün takip" — form alan tanımları (50 satır). */
export type UrunTakipInputType = "text" | "date" | "number" | "bool" | "supplier";

export type UrunTakipFieldDef = {
  key: string;
  label: string;
  input: UrunTakipInputType;
  section: string;
  required?: boolean;
  wide?: boolean;
};

const SECTIONS = {
  urun: "Ürün bilgileri",
  siparis: "Sipariş & fiyat",
  analiz: "Analiz",
  spekt: "Spekt",
  ambalajTasarim: "Ambalaj & etiket tasarımı",
  ambalajBasim: "Ambalaj basımı",
  uretim: "Üretim",
  dolum: "Dolum",
  lojistik: "Sevkiyat & depo",
  yayin: "Fotoğraf & web",
} as const;

const RAW: Array<[string, string, keyof typeof SECTIONS, UrunTakipInputType?]> = [
  ["urunAdi", "Ürün Adı", "urun", "text"],
  ["baslangic", "İşlem Başlangıç Tarihi", "urun", "date"],
  ["tedarikci", "Tedarikçi", "urun", "supplier"],
  ["siparisAdedi", "Sipariş Adedi", "urun", "number"],
  ["sinif", "Hangi Sınıf", "urun", "text"],
  ["hammaddeMi", "Karışım Ürün mü / Hammadde mi?", "urun", "text"],
  ["siparisVerildi", "Ürün Siparişi Verildi mi?", "siparis", "bool"],
  ["fiyatAlindi", "Fiyat Alındı mı?", "siparis", "bool"],
  ["analizGerekiyor", "Analiz Gerekiyor mu?", "analiz", "bool"],
  ["hangiAnaliz", "Hangi Analiz Gerekiyor", "analiz", "text"],
  ["analizBaslangic", "Analiz Başlangıç Tarihi", "analiz", "date"],
  ["analizBitis", "Analiz Bitiş Tarihi", "analiz", "date"],
  ["analizUcreti", "Analiz Ücreti Ne Kadar", "analiz", "text"],
  ["spektHazirlandi", "Spekt Hazırlandı mı?", "spekt", "bool"],
  ["spektTeslimTarihi", "Spekt Teslim Tarihi", "spekt", "date"],
  ["spektKimTeslim", "Spekt'i Kim Teslim Ediyor?", "spekt", "text"],
  ["spektUcreti", "Spekt Ücreti Ne Kadar", "spekt", "text"],
  ["ambalajGerekiyor", "Ambalaj & Etiket Gerekiyor mu", "ambalajTasarim", "bool"],
  ["ambalajTasarimYapildi", "Ambalaj Tasarımı Yapıldı mı?", "ambalajTasarim", "bool"],
  ["ambalajTasarimTeslim", "Ambalaj & Etiket Tasarımı Teslim Tarihi", "ambalajTasarim", "date"],
  ["ambalajTasarimKim", "Kim Teslim Ediyor", "ambalajTasarim", "text"],
  ["ambalajTasarimUcreti", "Ambalaj Tasarım Ücreti Ne Kadar", "ambalajTasarim", "text"],
  ["ambalajTasarimOdendi", "Ambalaj Tasarım Ödemesi Yapıldı mı?", "ambalajTasarim", "bool"],
  ["ambalajBasimYapildi", "Ambalaj Basımı Yapıldı mı?", "ambalajBasim", "bool"],
  ["ambalajBasimTeslim", "Ambalaj Basım Teslim Tarihi", "ambalajBasim", "date"],
  ["ambalajBasimKim", "Kim Teslim Ediyor", "ambalajBasim", "text"],
  ["ambalajBasimUcreti", "Ambalaj Basım Ücreti Ne Kadar", "ambalajBasim", "text"],
  ["ambalajBasimOdendi", "Ambalaj Basım Ücreti Ödendi mi?", "ambalajBasim", "bool"],
  ["uretimeGecildi", "Üretime Geçildi mi?", "uretim", "bool"],
  ["ureticiKim", "Üretici Kim?", "uretim", "text"],
  ["uretimTamamlanmaTahmini", "Üretim Tamamlanma Tarihi Tahmini", "uretim", "date"],
  ["uretimMaliyeti", "Üretim Maliyeti Ne Kadar", "uretim", "text"],
  ["uretimUcretiOdendi", "Üretim Ücreti Ödendi mi?", "uretim", "bool"],
  ["dolumGerekiyor", "Dolum Gerekiyor mu?", "dolum", "bool"],
  ["dolumYapildi", "Dolum Yapıldı mı?", "dolum", "bool"],
  ["dolumVade", "Dolum Vadedilen Tarih", "dolum", "date"],
  ["dolumKim", "Dolumu Kim Yapıyor", "dolum", "text"],
  ["dolumUcreti", "Dolum Ücreti Ne Kadar", "dolum", "text"],
  ["dolumUcretiOdendi", "Dolum Ücreti Ödendi mi?", "dolum", "bool"],
  ["sevkiyatYapildi", "Sevkiyat Yapıldı mı", "lojistik", "bool"],
  ["nakliyeUcretiVar", "Nakliye Ücreti Var mı?", "lojistik", "bool"],
  ["nakliyeUcreti", "Nakliye Ücreti Ne Kadar", "lojistik", "text"],
  ["nakliyeOdendi", "Nakliye Ücreti Ödendi mi?", "lojistik", "bool"],
  ["depoyaGiris", "Depoya Giriş Yapıldı mı?", "lojistik", "bool"],
  ["depoyaGirisTarihi", "Depoya Giriş Tarihi", "lojistik", "date"],
  ["fotograflamaYapildi", "Fotoğraflama Yapıldı mı?", "yayin", "bool"],
  ["fotograflamaUcreti", "Fotoğraflama Ücreti", "yayin", "text"],
  ["fotografOdeme", "Ödeme Yapıldı mı?", "yayin", "bool"],
  ["webYuklendi", "Web Sitesine Yüklendi mi?", "yayin", "bool"],
  ["webYuklemeTarihi", "Tahmini Yüklenme / Yüklenme Tarihi", "yayin", "date"],
];

export const URUN_TAKIP_FIELDS: UrunTakipFieldDef[] = RAW.map(([key, label, section, input]) => ({
  key,
  label,
  section: SECTIONS[section],
  input: input ?? "text",
  required: key === "urunAdi",
  wide: key === "urunAdi" || key === "hangiAnaliz",
}));

export const URUN_TAKIP_TABLE_COLUMNS = URUN_TAKIP_FIELDS.map(({ key, label }) => ({ key, label }));

export const URUN_TAKIP_SECTION_ORDER = [
  SECTIONS.urun,
  SECTIONS.siparis,
  SECTIONS.analiz,
  SECTIONS.spekt,
  SECTIONS.ambalajTasarim,
  SECTIONS.ambalajBasim,
  SECTIONS.uretim,
  SECTIONS.dolum,
  SECTIONS.lojistik,
  SECTIONS.yayin,
];

export function isBoolColumn(key: string): boolean {
  return URUN_TAKIP_FIELDS.find((f) => f.key === key)?.input === "bool";
}

export function displayCellValue(_key: string, raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  return raw;
}
