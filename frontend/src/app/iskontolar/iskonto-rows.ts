import type { DiscountDoc } from "@/lib/api";
import { formatCalendarDate, formatCurrency } from "@/lib/utils";

type Lookups = {
  partnerName: (id: number | null | undefined) => string;
  productName: (id: number | null | undefined) => string;
};

function discountType(percent: number | null, amount: number | null): string {
  if (percent != null && amount != null) return "Karma";
  if (percent != null) return "Yüzde";
  if (amount != null) return "Tutar";
  return "—";
}

function formatValidity(from: string | null, to: string | null): string {
  if (!from && !to) return "Süresiz";
  const fromStr = from ? formatCalendarDate(from) : "—";
  const toStr = to ? formatCalendarDate(to) : "—";
  return `${fromStr} – ${toStr}`;
}

export function mapIskontoRows(discounts: DiscountDoc[], lookups: Lookups) {
  return discounts.map((d) => {
    const percent = d.percent != null ? Number(d.percent) : null;
    const amount = d.amount != null ? Number(d.amount) : null;

    let deger = "—";
    if (percent != null && amount != null) {
      deger = `%${percent} + ${formatCurrency(amount)}`;
    } else if (percent != null) {
      deger = `%${percent}`;
    } else if (amount != null) {
      deger = formatCurrency(amount);
    }

    return {
      id: d.id,
      ad: d.name,
      tur: discountType(percent, amount),
      deger,
      cari: d.partnerId ? lookups.partnerName(d.partnerId) : "—",
      urun: d.productId ? lookups.productName(d.productId) : "—",
      gecerlilik: formatValidity(d.validFrom, d.validTo),
      durum: d.isActive ? "Aktif" : "Pasif",
      _name: d.name,
      _percent: percent,
      _amount: amount,
      _productId: d.productId,
      _partnerId: d.partnerId,
      _validFrom: d.validFrom,
      _validTo: d.validTo,
      _isActive: d.isActive,
      _sortValue: percent ?? amount ?? 0,
    };
  });
}

export type IskontoTableRow = ReturnType<typeof mapIskontoRows>[number];
