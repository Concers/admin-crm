/** Türkiye e-fatura seri no kalıbı (ORA2025000000301 vb.) */
const E_FATURA_CODE = /[A-Z]{2,4}\d{10,16}/;

/**
 * Notlar alanından fatura numarasını çıkarır.
 * Excel'de iki format kullanılıyor:
 *   - "Fatura No: ORA2025000000301"
 *   - "... açıklama ... FN: ORA2025000000298"
 */
export function parseInvoiceNoFromNotes(notes: string | null | undefined): string | null {
  if (!notes?.trim()) return null;

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

  return null;
}
