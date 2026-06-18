/** Gider tablosu — Excel "Gider Girişi" başlık sırası + fatura no. */
export const GIDER_TABLE_COLUMNS = [
  { key: "gun", label: "Gün" },
  { key: "ay", label: "Ay" },
  { key: "yil", label: "Yıl" },
  { key: "giderKategori", label: "Ürün Gideri / Genel" },
  { key: "giderTuru", label: "Gider Türü" },
  { key: "periyotAy", label: "Gider Periyodu (Ay)" },
  { key: "urunAdi", label: "Ürün Adı" },
  { key: "tedarikciAdi", label: "Hizmet Veren / Tedarikçi" },
  { key: "faturaNo", label: "Fatura No" },
  { key: "toplamTutar", label: "Toplam Tutar" },
  { key: "pesinOdenen", label: "Peşin Ödenen Tutar" },
  { key: "notlar", label: "Notlar" },
  { key: "aylikGiderPayi", label: "Aylık Gider Payı" },
  { key: "baslangicAy", label: "Başlangıç Ay" },
  { key: "baslangicYil", label: "Başlangıç Yıl" },
  { key: "bitisAy", label: "Bitiş Ay" },
  { key: "bitisYil", label: "Bitiş Yıl" },
  { key: "baslangicTarihi", label: "Başlangıç Tarihi" },
  { key: "bitisTarihi", label: "Bitiş Tarihi" },
] as const;

const E_FATURA_CODE = /[A-Z]{2,4}\d{10,16}/;

/** Backend ile aynı mantık — notlardan fatura no çıkarımı. */
export function parseFaturaNoFromNotes(notes: string | null | undefined): string {
  if (!notes?.trim()) return "";

  const faturaMatch = notes.match(/fatura\s*no\s*[:：]?\s*([^\n;,]+)/i);
  if (faturaMatch) {
    const raw = faturaMatch[1].trim();
    const code = raw.match(E_FATURA_CODE);
    return code ? code[0] : raw;
  }

  const fnMatch = notes.match(/\bFN\s*[:：]\s*([A-Z0-9]+)/i);
  if (fnMatch) {
    const raw = fnMatch[1].trim();
    const code = raw.match(E_FATURA_CODE);
    return code ? code[0] : raw;
  }

  if (/fatura|\bFN\b/i.test(notes)) {
    const codes = [...notes.matchAll(new RegExp(`\\b(${E_FATURA_CODE.source})\\b`, "g"))].map((m) => m[1]);
    if (codes.length) return codes[codes.length - 1];
  }

  return "";
}
