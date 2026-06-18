import type { ReturnDoc } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

const TYPE: Record<string, string> = {
  SALES_RETURN: "Satış İadesi",
  PURCHASE_RETURN: "Alım İadesi",
};

export function mapIadeRows(
  returns: ReturnDoc[],
  partnerName: Map<number, string>,
  productName: Map<number, string>
) {
  return returns.map((r) => ({
    id: r.id,
    tarih: formatCalendarDate(r.date),
    tur: TYPE[r.type] ?? r.type,
    cari: partnerName.get(r.partnerId) ?? String(r.partnerId),
    urun: productName.get(r.productId) ?? String(r.productId),
    miktar: String(r.quantity),
    tutar: formatCurrency(r.amount),
    sebep: r.reason?.trim() || "",
    notlar: r.notes?.trim() || "",
    _date: r.date,
    _type: r.type,
    _partnerId: r.partnerId,
    _productId: r.productId,
    _quantity: r.quantity,
    _amount: r.amount,
    _reason: r.reason ?? "",
    _notes: r.notes ?? "",
  }));
}

export type IadeTableRow = ReturnType<typeof mapIadeRows>[number];
