import type { QuoteDoc } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  ACCEPTED: "Kabul",
  REJECTED: "Reddedildi",
};

export function mapTeklifRows(quotes: QuoteDoc[], partnerName: Map<number, string>) {
  return quotes.map((q) => ({
    id: q.id,
    tarih: formatCalendarDate(q.date),
    cari: partnerName.get(q.partnerId) ?? String(q.partnerId),
    gecerlilik: q.validUntil ? formatCalendarDate(q.validUntil) : "—",
    durum: STATUS[q.status] ?? q.status,
    toplam: formatCurrency(q.totalAmount),
    kdvDahil: formatCurrency(q.vatIncludedAmount),
    notlar: q.notes?.trim() || "",
    kalemSayisi: q.lines.length,
    _date: q.date,
    _validUntil: q.validUntil,
    _partnerId: q.partnerId,
    _status: q.status,
    _totalAmount: q.totalAmount,
    _vatIncludedAmount: q.vatIncludedAmount,
    _notes: q.notes ?? "",
    _lines: q.lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
  }));
}

export type TeklifTableRow = ReturnType<typeof mapTeklifRows>[number];
