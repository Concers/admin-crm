import type { CashFlow } from "@/lib/api";
import { formatCurrency, formatCalendarDate } from "@/lib/utils";

export function mapTahsilatRows(tahsilatlar: CashFlow[]) {
  return tahsilatlar.map((t) => ({
    id: t.id,
    tarih: formatCalendarDate(t.date),
    musteriAdi: t.partner.name,
    hesap: t.account?.name ?? "—",
    tahsilatTutari: formatCurrency(t.amount),
    notlar: t.notes?.trim() || "",
    _date: t.date,
    _partnerName: t.partner.name,
    _amount: t.amount,
    _notes: t.notes ?? "",
    _accountId: t.accountId ?? t.account?.id ?? null,
    _accountName: t.account?.name ?? "",
  }));
}

export type TahsilatTableRow = ReturnType<typeof mapTahsilatRows>[number];
