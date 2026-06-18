import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { CheckCircle2, Clock, PackageSearch, Sparkles } from "lucide-react";
import { getPartners, getProductDevelopments } from "@/lib/api";
import { UrunTakipWorkspace } from "./urun-takip-workspace";
import { mapUrunTakipRows } from "./urun-takip-rows";

export const dynamic = "force-dynamic";

export default async function YeniUrunTakipPage() {
  const [kayitlar, suppliers, serviceProviders] = await Promise.all([
    getProductDevelopments(),
    getPartners("SUPPLIER"),
    getPartners("SERVICE_PROVIDER"),
  ]);

  const tedarikciler = [
    ...new Set([
      ...suppliers.map((s) => s.name),
      ...serviceProviders.map((s) => s.name),
      ...kayitlar.map((k) => k.supplierName).filter(Boolean) as string[],
    ]),
  ].sort((a, b) => a.localeCompare(b, "tr"));

  const rows = mapUrunTakipRows(kayitlar);

  const ozet = {
    toplam: kayitlar.length,
    uretimBitti: kayitlar.filter((k) => k.productionDone === true).length,
    devamEden: kayitlar.filter((k) => k.productionDone !== true).length,
    siparisVerildi: kayitlar.filter((k) => k.orderPlaced === true).length,
  };

  return (
    <PageShell
      title="Yeni Ürün Takip"
      description="Ar-Ge ve yeni ürün geliştirme süreçlerini aşama aşama takip edin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Takip Kaydı"
          value={ozet.toplam}
          icon={PackageSearch}
          accent="indigo"
        />
        <StatCard
          label="Üretimi Biten"
          value={ozet.uretimBitti}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Devam Eden"
          value={ozet.devamEden}
          icon={Clock}
          accent="amber"
        />
        <StatCard
          label="Sipariş Verildi"
          value={ozet.siparisVerildi}
          icon={Sparkles}
          accent="indigo"
        />
      </div>

      <PanelCard
        icon={PackageSearch}
        title="Ürün Geliştirme Kayıtları"
        description="Excel’deki 50 süreç satırı — her ürün bir sütun olarak içe aktarılır"
        accent="indigo"
      >
        <UrunTakipWorkspace rows={rows} tedarikciler={tedarikciler} />
      </PanelCard>
    </PageShell>
  );
}
