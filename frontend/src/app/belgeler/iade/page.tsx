import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Package, RotateCcw, TrendingDown, Undo2 } from "lucide-react";
import { getReturns, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, calendarMonth, calendarYear } from "@/lib/utils";
import { IadeWorkspace } from "./iade-workspace";
import { mapIadeRows } from "./iade-rows";

export const dynamic = "force-dynamic";

export default async function IadePage() {
  const [returns, partners, products] = await Promise.all([
    getReturns(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));
  const productName = new Map(products.map((p) => [p.id, p.name]));
  const partnerOpts = partners.map((p) => ({ id: p.id, name: p.name }));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const rows = mapIadeRows(returns, partnerName, productName);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: returns.length,
    toplamTutar: returns.reduce((acc, r) => acc + r.amount, 0),
    satisIade: returns.filter((r) => r.type === "SALES_RETURN").length,
    buAyTutar: returns
      .filter((r) => calendarMonth(r.date) === buAy && calendarYear(r.date) === buYil)
      .reduce((acc, r) => acc + r.amount, 0),
  };

  return (
    <PageShell
      title="İadeler"
      description="Satış ve alım iadelerini kaydedin, takip edin ve düzenleyin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="İade Kaydı"
          value={ozet.kayit}
          icon={RotateCcw}
          accent="amber"
          subtext={`${ozet.satisIade} satış iadesi`}
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={TrendingDown}
          accent="rose"
        />
        <StatCard
          label="Bu Ay"
          value={formatCurrency(ozet.buAyTutar)}
          icon={Undo2}
          accent="indigo"
        />
        <StatCard
          label="Ortalama İade"
          value={formatCurrency(ozet.kayit > 0 ? ozet.toplamTutar / ozet.kayit : 0)}
          icon={Package}
          accent="blue"
        />
      </div>

      <PanelCard
        icon={RotateCcw}
        title="İade Kayıtları"
        description="Tarih, cari, ürün, miktar ve tutar — satıra tıklayarak düzenleyin"
        accent="amber"
      >
        <IadeWorkspace rows={rows} partners={partnerOpts} products={productOpts} />
      </PanelCard>
    </PageShell>
  );
}
