import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { CheckCircle2, Layers, Tags, Wallet } from "lucide-react";
import { getPriceLists, getProducts } from "@/lib/api";
import { FiyatWorkspace } from "./fiyat-workspace";
import { mapFiyatRows } from "./fiyat-rows";

export const dynamic = "force-dynamic";

export default async function FiyatListesiPage() {
  const [priceLists, products] = await Promise.all([getPriceLists(), getProducts()]);

  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const rows = mapFiyatRows(priceLists);

  const ozet = {
    kayit: priceLists.length,
    aktif: priceLists.filter((pl) => pl.isActive).length,
    kalem: priceLists.reduce((acc, pl) => acc + pl.items.length, 0),
    paraBirimi: new Set(priceLists.map((pl) => pl.currency)).size,
  };

  return (
    <PageShell
      title="Fiyat Listesi"
      description="Ürün fiyat listelerini oluşturun, segmentlere göre yönetin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Liste Kaydı"
          value={ozet.kayit}
          icon={Tags}
          accent="blue"
          subtext={`${ozet.aktif} aktif`}
        />
        <StatCard
          label="Toplam Kalem"
          value={ozet.kalem}
          icon={Layers}
          accent="indigo"
        />
        <StatCard
          label="Para Birimi"
          value={ozet.paraBirimi}
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
        icon={Tags}
        title="Fiyat Listeleri"
        description="Liste adı, para birimi, segment ve kalem sayısı — satıra tıklayarak düzenleyin"
        accent="blue"
      >
        <FiyatWorkspace rows={rows} products={productOpts} />
      </PanelCard>
    </PageShell>
  );
}
