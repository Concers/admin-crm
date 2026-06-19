/** Map backend error codes to user-friendly Turkish messages. */
export function friendlyApiError(e: unknown, fallback: string): string {
  const msg = e instanceof Error ? e.message : fallback;
  if (msg.includes("period_locked") || msg.includes("423")) {
    return "Bu tarih kilitli bir döneme ait. Kayıt eklenemez veya değiştirilemez. Sistem → Dönem Kapatma ayarlarını kontrol edin.";
  }
  if (msg.includes("duplicate_number") || msg.includes("409")) {
    return "Bu belge numarası zaten kullanılıyor. Farklı bir numara girin.";
  }
  return msg || fallback;
}
