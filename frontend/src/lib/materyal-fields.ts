// Materyal Detay sabitleri ve alan tanımları.
import type { Material, MaterialCategory, MaterialScope } from "@/lib/api";

export const MATERYAL_KATEGORILERI: { code: MaterialCategory; label: string }[] = [
  { code: "AMBALAJ", label: "Ambalaj" },
  { code: "ETIKET", label: "Etiket" },
  { code: "STICKER", label: "Sticker" },
  { code: "DIGER", label: "Materyal (Diğer)" },
];

export const MATERYAL_KATEGORI_ETIKET: Record<string, string> = Object.fromEntries(
  MATERYAL_KATEGORILERI.map((k) => [k.code, k.label]),
);

/** Ambalaj alt türleri — öneri listesi (serbest metin; panelden yenisi yazılabilir). */
export const AMBALAJ_ALT_TURLERI = [
  "Doypack",
  "Şişe",
  "Tüp",
  "Kartuş",
  "Şase",
  "Kutu",
  "Poşet",
];

export const MATERYAL_SCOPE: { code: MaterialScope; label: string }[] = [
  { code: "OWN", label: "Kendi Markamız" },
  { code: "B2B", label: "B2B" },
  { code: "BOTH", label: "Her İkisi" },
];

export const MATERYAL_SCOPE_ETIKET: Record<string, string> = Object.fromEntries(
  MATERYAL_SCOPE.map((s) => [s.code, s.label]),
);

type FieldDef = { key: keyof Material; label: string; textarea?: boolean };

/** Ortak künye alanları (Doypack/Şişe/Kartuş… için ortak; ör. Doypack: Model/Renk/Ölçü/Malzeme). */
export const MATERYAL_ALANLARI: FieldDef[] = [
  { key: "model", label: "Model" },
  { key: "color", label: "Renk" },
  { key: "size", label: "Ölçü" },
  { key: "material", label: "Malzemesi" },
  { key: "usageAreas", label: "Kullanım Alanları", textarea: true },
  { key: "notes", label: "Notlar", textarea: true },
];

/** Materyal kartı ek kategorileri (kategorili dosya kutuları). */
export const MATERYAL_EK_KATEGORILERI: { category: string; title: string }[] = [
  { category: "SERTIFIKA", title: "Sertifikalar" },
  { category: "GORSEL", title: "Görseller" },
];

export const MATERYAL_ROL_ETIKET: Record<string, string> = {
  SUPPLIER: "Tedarikçi",
  CUSTOMER: "Müşteri",
};
