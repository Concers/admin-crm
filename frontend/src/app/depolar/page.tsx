import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { ArrowLeftRight, MapPin, Package, Warehouse } from "lucide-react";
import { getStockMovements, getWarehouses } from "@/lib/api";
import { DepoWorkspace } from "./depo-workspace";
import { mapDepoRows } from "./depo-rows";

export const dynamic = "force-dynamic";

export default async function DepolarPage() {
  const [warehouses, movements] = await Promise.all([
    getWarehouses(),
    getStockMovements(),
  ]);

  const hareketSayisi = new Map<number, number>();
  for (const m of movements) {
    if (m.warehouseId) {
      hareketSayisi.set(m.warehouseId, (hareketSayisi.get(m.warehouseId) ?? 0) + 1);
    }
  }

  const rows = mapDepoRows(warehouses, hareketSayisi);

  const ozet = {
    kayit: warehouses.length,
    lokasyonlu: warehouses.filter((w) => w.location?.trim()).length,
    aktif: hareketSayisi.size,
    toplamHareket: movements.filter((m) => m.warehouseId).length,
  };

  return (
    <PageShell
      title="Depolar"
      description="Depo ve lokasyon tanımlarını yönetin, stok hareketlerine bağlayın"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Depo Kaydı"
          value={ozet.kayit}
          icon={Warehouse}
          accent="indigo"
        />
        <StatCard
          label="Lokasyon Tanımlı"
          value={ozet.lokasyonlu}
          icon={MapPin}
          accent="blue"
          subtext={`${ozet.kayit - ozet.lokasyonlu} lokasyonsuz`}
        />
        <StatCard
          label="Hareketli Depo"
          value={ozet.aktif}
          icon={ArrowLeftRight}
          accent="amber"
        />
        <StatCard
          label="Depo Hareketi"
          value={ozet.toplamHareket}
          icon={Package}
          accent="emerald"
        />
      </div>

      <PanelCard
        icon={Warehouse}
        title="Depo Listesi"
        description="Depo adı, lokasyon ve stok hareketi sayısı — satıra tıklayarak düzenleyin"
        accent="indigo"
      >
        <DepoWorkspace rows={rows} />
      </PanelCard>
    </PageShell>
  );
}
