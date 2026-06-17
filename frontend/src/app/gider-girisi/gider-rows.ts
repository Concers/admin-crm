import { ayAdi } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "@/lib/api";

function formatAyYil(ay: number | null, yil: number | null) {
  if (!ay && !yil) return "-";
  const ayStr = ay ? ayAdi(ay) : "-";
  return yil ? `${ayStr} ${yil}` : ayStr;
}

function formatKategori(scope: Expense["scope"]) {
  if (scope === "PRODUCT") return "Ürün Gideri";
  return "Genel Gider";
}

export function mapGiderRows(giderler: Expense[]) {
  return giderler.map((g) => {
    const baslangic = new Date(g.date);
    const baslangicAy = baslangic.getMonth() + 1;
    const baslangicYil = baslangic.getFullYear();

    let bitisAy: number | null = null;
    let bitisYil: number | null = null;
    let bitisTarihi: Date | null = null;
    if (g.durationMonths && g.durationMonths > 0) {
      const bitis = new Date(baslangic);
      bitis.setMonth(bitis.getMonth() + g.durationMonths - 1);
      bitisAy = bitis.getMonth() + 1;
      bitisYil = bitis.getFullYear();
      bitisTarihi = bitis;
    }

    return {
      id: g.id,
      gun: formatDate(baslangic),
      ay: ayAdi(baslangicAy),
      yil: String(baslangicYil),
      giderKategori: formatKategori(g.scope),
      giderTuru: g.category || "-",
      periyotAy: g.durationMonths ? String(g.durationMonths) : "-",
      urunAdi: g.product?.name ?? "-",
      tedarikciAdi: g.partner?.name ?? "-",
      toplamTutar: formatCurrency(g.totalAmount),
      pesinOdenen: formatCurrency(g.paidAmount),
      notlar: g.notes ?? "",
      aylikGiderPayi: g.monthlyShare != null ? formatCurrency(g.monthlyShare) : "-",
      baslangicDonem: formatAyYil(baslangicAy, baslangicYil),
      bitisDonem: formatAyYil(bitisAy, bitisYil),
      baslangicTarihi: formatDate(baslangic),
      bitisTarihi: bitisTarihi ? formatDate(bitisTarihi) : "-",
      // raw values for editing
      _date: g.date,
      _scope: g.scope,
      _category: g.category ?? "",
      _productName: g.product?.name ?? "",
      _partnerName: g.partner?.name ?? "",
      _totalAmount: g.totalAmount,
      _paidAmount: g.paidAmount,
      _durationMonths: g.durationMonths ?? null,
      _notes: g.notes ?? "",
    };
  });
}

export type GiderTableRow = ReturnType<typeof mapGiderRows>[number];
