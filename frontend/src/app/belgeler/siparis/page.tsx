import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { ClipboardList, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { getOrders, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, calendarMonth, calendarYear } from "@/lib/utils";
import { SiparisWorkspace } from "./siparis-workspace";
import { mapSiparisRows } from "./siparis-rows";

export const dynamic = "force-dynamic";

export default async function SiparisPage() {
  const [orders, partners, products] = await Promise.all([
    getOrders(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));
  const partnerOpts = partners.map((p) => ({ id: p.id, name: p.name }));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const rows = mapSiparisRows(orders, partnerName);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: orders.length,
    toplamTutar: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    satisSayisi: orders.filter((o) => o.docType === "SALES").length,
    buAyTutar: orders
      .filter((o) => calendarMonth(o.date) === buAy && calendarYear(o.date) === buYil)
      .reduce((acc, o) => acc + o.totalAmount, 0),
  };

  return (
    <PageShell
      title="Siparişler"
      description="Satış ve alım siparişlerini kaydedin, takip edin ve düzenleyin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Sipariş Kaydı"
          value={ozet.kayit}
          icon={ClipboardList}
          accent="indigo"
          subtext={`${ozet.satisSayisi} satış siparişi`}
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="Bu Ay"
          value={formatCurrency(ozet.buAyTutar)}
          icon={ShoppingCart}
          accent="amber"
        />
        <StatCard
          label="Ortalama Sipariş"
          value={formatCurrency(ozet.kayit > 0 ? ozet.toplamTutar / ozet.kayit : 0)}
          icon={Package}
          accent="emerald"
        />
      </div>

      <PanelCard
        icon={ClipboardList}
        title="Sipariş Kayıtları"
        description="Tarih, cari, durum, kalemler ve tutarlar — satıra tıklayarak düzenleyin"
        accent="indigo"
      >
        <SiparisWorkspace rows={rows} partners={partnerOpts} products={productOpts} />
      </PanelCard>
    </PageShell>
  );
}
