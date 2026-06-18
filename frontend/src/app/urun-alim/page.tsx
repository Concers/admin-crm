import { PageShell } from "@/components/page-shell";
import { getPurchases, getProducts, getPartners } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExportButton } from "@/components/export-button";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Package, ShoppingCart, Receipt, Wallet } from "lucide-react";
import { AlimWorkspace } from "./alim-list";

export const dynamic = "force-dynamic";

/** Son ayın toplam tutarı ile bir önceki ayın değişimi (%). */
function monthlyTrend(items: { date: string | Date; totalAmount: number | null }[]): number | null {
  const byMonth = new Map<string, number>();
  for (const it of items) {
    const d = new Date(it.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + (it.totalAmount ?? 0));
  }
  const keys = [...byMonth.keys()].sort();
  if (keys.length < 2) return null;
  const last = byMonth.get(keys[keys.length - 1]) ?? 0;
  const prev = byMonth.get(keys[keys.length - 2]) ?? 0;
  if (prev === 0) return null;
  return ((last - prev) / prev) * 100;
}

export default async function UrunAlimPage() {
  const [alimlar, urunler, suppliers, serviceProviders] = await Promise.all([
    getPurchases(),
    getProducts(),
    getPartners("SUPPLIER"),
    getPartners("SERVICE_PROVIDER"),
  ]);

  const tedarikciler = [...suppliers, ...serviceProviders].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  const urunAdlari = urunler.map((u: { name: string }) => u.name);
  const tedarikciAdlari = tedarikciler.map((t: { name: string }) => t.name);

  const ozet = {
    kayit: alimlar.length,
    toplamAdet: alimlar.reduce((acc, a) => acc + a.quantity, 0),
    toplamTutar: alimlar.reduce((acc, a) => acc + (a.totalAmount ?? 0), 0),
    kdvDahil: alimlar.reduce((acc, a) => acc + (a.vatIncludedAmount ?? 0), 0),
    pesinOdenen: alimlar.reduce((acc, a) => acc + (a.paidAmount ?? 0), 0),
  };

  const rows = alimlar.map((a) => ({
    id: a.id,
    tarih: formatDate(a.date),
    urunAdi: a.product.name,
    tedarikci: a.supplier.name || "—",
    raf: a.shelfLocation ?? "",
    birimAlimFiyati: formatCurrency(a.unitPrice),
    alimAdeti: a.quantity,
    toplamTutar: formatCurrency(a.totalAmount),
    kdvDahilTutar: formatCurrency(a.vatIncludedAmount),
    pesinOdenen: a.paidAmount ? formatCurrency(a.paidAmount) : "—",
    _date: a.date,
    _productName: a.product.name,
    _supplierName: a.supplier.name,
    _quantity: a.quantity,
    _unitPrice: a.unitPrice,
    _vatRate: a.vatRate,
    _paidAmount: a.paidAmount,
    _totalAmount: a.totalAmount,
    _vatIncludedAmount: a.vatIncludedAmount,
    _shelfLocation: a.shelfLocation ?? "",
    _notes: a.notes ?? "",
  }));

  const trend = monthlyTrend(alimlar);

  return (
    <PageShell
      title="Ürün Alım Giriş"
      description="Tedarikçi alımlarını ve maliyetleri yönetin"
      actions={<ExportButton type="purchases" />}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Alım Kaydı"
          value={ozet.kayit}
          icon={ShoppingCart}
          accent="emerald"
          subtext={`${ozet.toplamAdet.toLocaleString("tr-TR")} adet toplam`}
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={Package}
          accent="blue"
          subtext="KDV hariç"
          trend={trend != null ? { value: trend, label: "önceki aya göre" } : undefined}
        />
        <StatCard
          label="KDV Dahil"
          value={formatCurrency(ozet.kdvDahil)}
          icon={Receipt}
          accent="indigo"
        />
        <StatCard
          label="Peşin Ödenen"
          value={formatCurrency(ozet.pesinOdenen)}
          icon={Wallet}
          accent="amber"
        />
      </div>

      <PanelCard
        icon={ShoppingCart}
        title="Alım Kayıtları"
        description="Filtreleyin, satıra tıklayarak düzenleyin veya yeni alım ekleyin"
        accent="emerald"
      >
        <AlimWorkspace rows={rows} urunler={urunAdlari} tedarikciler={tedarikciAdlari} />
      </PanelCard>
    </PageShell>
  );
}
