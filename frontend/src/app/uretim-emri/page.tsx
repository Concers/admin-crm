import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { CheckCircle2, Cog, Factory, Package } from "lucide-react";
import { getBoms, getProductionOrders, getProducts } from "@/lib/api";
import { EmirWorkspace } from "./emir-workspace";
import { mapEmirRows, mapReceteOptions } from "./emir-rows";

export const dynamic = "force-dynamic";

export default async function UretimEmriPage() {
  const [orders, products, boms] = await Promise.all([
    getProductionOrders(),
    getProducts(),
    getBoms(),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));
  const bomName = new Map(boms.map((b) => [b.id, b.name]));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const receteler = mapReceteOptions(boms);
  const rows = mapEmirRows(orders, productName, bomName);

  const ozet = {
    kayit: orders.length,
    uretimde: orders.filter((o) => o.status === "IN_PROGRESS").length,
    tamamlanan: orders.filter((o) => o.status === "DONE").length,
    toplamMiktar: orders.reduce((acc, o) => acc + o.quantity, 0),
  };

  return (
    <PageShell
      title="Üretim Emri"
      description="Üretim emirlerini planlayın, takip edin ve durumlarını güncelleyin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Emir Kaydı"
          value={ozet.kayit}
          icon={Factory}
          accent="indigo"
          subtext={`${ozet.uretimde} üretimde`}
        />
        <StatCard
          label="Tamamlanan"
          value={ozet.tamamlanan}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Toplam Miktar"
          value={ozet.toplamMiktar.toLocaleString("tr-TR")}
          icon={Package}
          accent="blue"
        />
        <StatCard
          label="Üretimde"
          value={ozet.uretimde}
          icon={Cog}
          accent="amber"
        />
      </div>

      <PanelCard
        icon={Factory}
        title="Üretim Emirleri"
        description="Mamul, reçete, miktar ve durum — satıra tıklayarak düzenleyin"
        accent="indigo"
      >
        <EmirWorkspace rows={rows} products={productOpts} receteler={receteler} />
      </PanelCard>
    </PageShell>
  );
}
