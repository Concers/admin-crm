// Cari (Partner) detay alanları — tipe göre alan seti ve etiketler (§5).
import type { Partner, PartnerType } from "@/lib/api";

export type CariField = { key: keyof Partner; label: string; textarea?: boolean };

const SUPPLIER: CariField[] = [
  { key: "name", label: "Firma İsmi" },
  { key: "taxNumber", label: "Vergi No" },
  { key: "mersisNo", label: "Mersis No" },
  { key: "website", label: "Web Sitesi" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-posta" },
  { key: "address", label: "Adres", textarea: true },
  { key: "contactInfo", label: "İletişim (serbest not)" },
];

const CUSTOMER: CariField[] = [
  { key: "name", label: "Adı Soyadı" },
  { key: "tcNo", label: "TC" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "Mail" },
  { key: "address", label: "Adresi", textarea: true },
  { key: "shopName", label: "Dükkan Bilgileri" },
  { key: "shopAddress", label: "Dükkan Adresi" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "priceTier", label: "Fiyat Segmenti" },
];

const SERVICE_PROVIDER: CariField[] = [
  { key: "name", label: "Adı Soyadı" },
  { key: "tcNo", label: "TC" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "Mail" },
  { key: "address", label: "Adresi", textarea: true },
  { key: "companyName", label: "Firma İsmi" },
  { key: "companyAddress", label: "Firma Adresi" },
  { key: "website", label: "Web Sitesi" },
  { key: "taxNumber", label: "VKN" },
  { key: "mersisNo", label: "Mersis" },
  { key: "sector", label: "Sektörü" },
  { key: "serviceAreas", label: "Hizmet Alanları", textarea: true },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
];

const BASIC: CariField[] = [
  { key: "name", label: "Ad / Ünvan" },
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-posta" },
  { key: "address", label: "Adres", textarea: true },
  { key: "contactInfo", label: "İletişim (serbest not)" },
];

export const CARI_FIELDS: Record<PartnerType, CariField[]> = {
  SUPPLIER,
  CUSTOMER,
  SERVICE_PROVIDER,
  OWNER: BASIC,
  OTHER: BASIC,
};

export const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
  CUSTOMER: "Müşteri",
  SUPPLIER: "Tedarikçi",
  SERVICE_PROVIDER: "Hizmet Veren",
  OWNER: "Şirket Sahibi",
  OTHER: "Diğer",
};

/** All editable field keys across every type (for form submission). */
export const ALL_CARI_KEYS: (keyof Partner)[] = [
  "name",
  "contactInfo",
  "phone",
  "email",
  "address",
  "priceTier",
  "taxNumber",
  "mersisNo",
  "website",
  "tcNo",
  "companyName",
  "companyAddress",
  "shopName",
  "shopAddress",
  "sector",
  "serviceAreas",
  "instagram",
  "youtube",
  "linkedin",
];
