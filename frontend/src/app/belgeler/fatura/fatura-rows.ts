import type { InvoiceDoc } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

const DOC_TYPE: Record<string, string> = { SALES: "Satış", PURCHASE: "Alım" };
const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  ISSUED: "Kesildi",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

export function mapFaturaRows(invoices: InvoiceDoc[], partnerName: Map<number, string>) {
  return invoices.map((inv) => ({
    id: inv.id,
    faturaNo: inv.number?.trim() || "—",
    tarih: formatCalendarDate(inv.date),
    tur: DOC_TYPE[inv.docType] ?? inv.docType,
    cari: partnerName.get(inv.partnerId) ?? String(inv.partnerId),
    vade: inv.dueDate ? formatCalendarDate(inv.dueDate) : "—",
    durum: STATUS[inv.status] ?? inv.status,
    toplam: formatCurrency(inv.totalAmount),
    kdvDahil: formatCurrency(inv.vatIncludedAmount),
    notlar: inv.notes?.trim() || "",
    kalemSayisi: inv.lines.length,
    _date: inv.date,
    _dueDate: inv.dueDate,
    _docType: inv.docType,
    _partnerId: inv.partnerId,
    _status: inv.status,
    _number: inv.number ?? "",
    _totalAmount: inv.totalAmount,
    _vatIncludedAmount: inv.vatIncludedAmount,
    _notes: inv.notes ?? "",
    _lines: inv.lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
  }));
}

export type FaturaTableRow = ReturnType<typeof mapFaturaRows>[number];
