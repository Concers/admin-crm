import type { CashFlow } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

export function mapOdemeRows(odemeler: CashFlow[]) {
  return odemeler.map((o) => ({
    id: o.id,
    tarih: formatCalendarDate(o.date),
    tedarikciAdi: o.partner.name,
    hesap: o.account?.name ?? "—",
    odenenTutar: formatCurrency(o.amount),
    notlar: o.notes?.trim() || "",
    _date: o.date,
    _partnerName: o.partner.name,
    _amount: o.amount,
    _notes: o.notes ?? "",
    _accountId: o.accountId ?? o.account?.id ?? null,
    _accountName: o.account?.name ?? "",
  }));
}

export type OdemeTableRow = ReturnType<typeof mapOdemeRows>[number];
