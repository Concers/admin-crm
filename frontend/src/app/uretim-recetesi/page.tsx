import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { BarChart3, CheckCircle2, ClipboardList, Layers, Package } from "lucide-react";
import { getBoms, getProducts, getPurchases, getProductionOrders } from "@/lib/api";
import { ReceteWorkspace } from "./recete-workspace";
import { mapReceteRows } from "./recete-rows";
import { buildReceteAnaliz } from "./analiz-data";
import { ReceteAnalizPano } from "./recete-analiz";

export const dynamic = "force-dynamic";

export default async function UretimRecetesiPage() {
  const [boms, products, purchases, orders] = await Promise.all([
    getBoms(),
    getProducts(),
    getPurchases(),
    getProductionOrders(),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const rows = mapReceteRows(boms, productName);
  const analiz = buildReceteAnaliz(boms, products, purchases, orders);

  const ozet = {
    kayit: boms.length,
    aktif: boms.filter((b) => b.isActive).length,
    bilesen: boms.reduce((acc, b) => acc + b.components.length, 0),
    mamul: new Set(boms.map((b) => b.productId)).size,
  };

  return (
    <PageShell
      title="Ürün Reçetesi"
      description="BOM reçetelerini oluşturun, mamul ve bileşenleri yönetin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Reçete Kaydı"
          value={ozet.kayit}
          icon={ClipboardList}
          accent="emerald"
          subtext={`${ozet.aktif} aktif`}
        />
        <StatCard
          label="Toplam Bileşen"
          value={ozet.bilesen}
          icon={Layers}
          accent="blue"
        />
        <StatCard
          label="Farklı Mamul"
          value={ozet.mamul}
          icon={Package}
          accent="indigo"
        />
        <StatCard
          label="Aktif Oranı"
          value={ozet.kayit > 0 ? `%${Math.round((ozet.aktif / ozet.kayit) * 100)}` : "—"}
          icon={CheckCircle2}
          accent="amber"
        />
      </div>

      <PanelCard
        icon={Layers}
        title="Reçete Kayıtları"
        description="Reçete adı, mamul, bileşen sayısı ve durum — satıra tıklayarak düzenleyin"
        accent="emerald"
      >
        <ReceteWorkspace rows={rows} products={productOpts} />
      </PanelCard>

      <PanelCard
        icon={BarChart3}
        title="Maliyet & Tüketim Analizi"
        description=""
        accent="blue"
      >
        <ReceteAnalizPano analiz={analiz} />
      </PanelCard>
    </PageShell>
  );
}
