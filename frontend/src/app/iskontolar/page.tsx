import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { CheckCircle2, Percent, Tag, Wallet } from "lucide-react";
import { getDiscounts, getPartners, getProducts } from "@/lib/api";
import { IskontoWorkspace } from "./iskonto-workspace";
import { mapIskontoRows } from "./iskonto-rows";

export const dynamic = "force-dynamic";

export default async function IskontolarPage() {
  const [discounts, partners, products] = await Promise.all([
    getDiscounts(),
    getPartners(),
    getProducts(),
  ]);

  const partnerMap = new Map(partners.map((p) => [p.id, p.name]));
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const rows = mapIskontoRows(discounts, {
    partnerName: (id) => (id ? partnerMap.get(id) ?? "—" : "—"),
    productName: (id) => (id ? productMap.get(id) ?? "—" : "—"),
  });

  const ozet = {
    kayit: discounts.length,
    aktif: discounts.filter((d) => d.isActive).length,
    yuzde: discounts.filter((d) => d.percent != null).length,
    tutar: discounts.filter((d) => d.amount != null).length,
  };

  const partnerOpts = partners.map((p) => ({ id: p.id, name: p.name }));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));

  return (
    <PageShell
      title="İskontolar"
      description="Yüzde ve tutar iskontolarını tanımlayın, cari ve ürün kapsamına göre yönetin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="İskonto Kaydı"
          value={ozet.kayit}
          icon={Percent}
          accent="rose"
          subtext={`${ozet.aktif} aktif`}
        />
        <StatCard
          label="Yüzdeli"
          value={ozet.yuzde}
          icon={Tag}
          accent="indigo"
        />
        <StatCard
          label="Tutarlı"
          value={ozet.tutar}
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          label="Aktif Oranı"
          value={ozet.kayit > 0 ? `%${Math.round((ozet.aktif / ozet.kayit) * 100)}` : "—"}
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      <PanelCard
        icon={Percent}
        title="İskonto Tanımları"
        description="Tür, değer, cari/ürün kapsamı ve geçerlilik — satıra tıklayarak düzenleyin"
        accent="rose"
      >
        <IskontoWorkspace rows={rows} partners={partnerOpts} products={productOpts} />
      </PanelCard>
    </PageShell>
  );
}
