import type { OrderDoc } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

const DOC_TYPE: Record<string, string> = { SALES: "Satış", PURCHASE: "Alım" };
const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  CONFIRMED: "Onaylı",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

export function mapSiparisRows(orders: OrderDoc[], partnerName: Map<number, string>) {
  return orders.map((o) => ({
    id: o.id,
    tarih: formatCalendarDate(o.date),
    tur: DOC_TYPE[o.docType] ?? o.docType,
    cari: partnerName.get(o.partnerId) ?? String(o.partnerId),
    durum: STATUS[o.status] ?? o.status,
    toplam: formatCurrency(o.totalAmount),
    kdvDahil: formatCurrency(o.vatIncludedAmount),
    notlar: o.notes?.trim() || "",
    kalemSayisi: o.lines.length,
    _date: o.date,
    _docType: o.docType,
    _partnerId: o.partnerId,
    _status: o.status,
    _totalAmount: o.totalAmount,
    _vatIncludedAmount: o.vatIncludedAmount,
    _notes: o.notes ?? "",
    _lines: o.lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
  }));
}

export type SiparisTableRow = ReturnType<typeof mapSiparisRows>[number];
