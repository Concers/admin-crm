// Ürün Detay (ürün kartı) alan tanımları — form ve görünüm bu listeden üretilir.
import type { Product } from "@/lib/api";

/** Ürün sektörü — çoklu seçim. Kod ↔ etiket. (Panelden sonradan genişletilebilir.) */
export const URUN_SEKTORLERI: { code: string; label: string }[] = [
  { code: "GIDA", label: "Gıda" },
  { code: "KOZMETIK", label: "Kozmetik" },
  { code: "TICARI", label: "Ticari Emtia" },
  { code: "TEG", label: "Takviye Edici Gıda" },
];

/** Ürün kartında en az bir künye alanı doldurulmuş mu? (Alım sırasında açılan
 *  boş kartları "eksik" olarak ayırt etmek için.) */
export function isProductDetailFilled(p: Partial<Product>): boolean {
  const keys: (keyof Product)[] = [
    "productCode",
    "sectors",
    "gtipCode",
    "hsCode",
    "unCode",
    "botanicalName",
    "englishName",
    "casNo",
    "inciNo",
    "origin",
    "chemotype",
    "genotype",
    "variety",
    "geoPopulation",
    "plantPart",
    "productionMethod",
    "der",
    "history",
    "usageAreas",
    "description",
  ];
  return keys.some((k) => {
    const v = p[k];
    return typeof v === "string" && v.trim() !== "";
  });
}

export function sektorLabels(csv: string | null | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => URUN_SEKTORLERI.find((s) => s.code === c)?.label ?? c);
}

export type ProductFieldKey = keyof Product;
type FieldDef = { key: ProductFieldKey; label: string; textarea?: boolean };

/** Künye alanları (sektör/kod/barkod hariç düz metin alanları). */
export const URUN_DETAY_ALANLARI: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Kimlik & Kodlar",
    fields: [
      { key: "productCode", label: "Ürün Kodu" },
      { key: "barcode", label: "Barkod" },
      { key: "gtipCode", label: "GTİP Kodu" },
      { key: "hsCode", label: "HS Kodu" },
      { key: "unCode", label: "UN Kodu" },
      { key: "casNo", label: "CAS No" },
      { key: "inciNo", label: "INCI No" },
    ],
  },
  {
    title: "Botanik & Menşe",
    fields: [
      { key: "botanicalName", label: "Botanik Adı" },
      { key: "englishName", label: "İngilizce Adı" },
      { key: "origin", label: "Menşei" },
      { key: "chemotype", label: "Kemotip" },
      { key: "genotype", label: "Genotip" },
      { key: "variety", label: "Varyete" },
      { key: "geoPopulation", label: "Coğrafi Popülasyon" },
      { key: "plantPart", label: "Bitkinin Hangi Bölümü" },
      { key: "productionMethod", label: "Üretim Şekli" },
      { key: "der", label: "DER" },
    ],
  },
  {
    title: "Açıklamalar",
    fields: [
      { key: "usageAreas", label: "Kullanım Alanları", textarea: true },
      { key: "history", label: "Tarihçe", textarea: true },
      { key: "description", label: "Açıklamalar", textarea: true },
    ],
  },
];

/** Ürün kartı ek kategorileri — kategorili dosya kutuları. */
export const URUN_EK_KATEGORILERI: { category: string; title: string }[] = [
  { category: "ANALIZ", title: "Teknik Analizler" },
  { category: "SERTIFIKA", title: "Ürün Sertifikaları" },
  { category: "GORSEL", title: "Ürün Görselleri" },
  { category: "ETIKET", title: "Nihai Etiket Formu" },
];

export const PARTNER_ROL_ETIKET: Record<string, string> = {
  SUPPLIER: "Tedarikçi",
  POTENTIAL_SUPPLIER: "Potansiyel Tedarikçi",
  CUSTOMER: "Müşteri",
};
