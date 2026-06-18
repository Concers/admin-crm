import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { getStockMovements, getProducts, getWarehouses } from "@/lib/api";
import { calendarMonth, calendarYear } from "@/lib/utils";
import { HareketWorkspace } from "./hareket-workspace";
import { mapHareketRows } from "./hareket-rows";

export const dynamic = "force-dynamic";

export default async function StokHareketleriPage() {
  const [movements, products, warehouses] = await Promise.all([
    getStockMovements(),
    getProducts(),
    getWarehouses(),
  ]);

  const urunler = products.map((p) => p.name).sort((a, b) => a.localeCompare(b, "tr"));
  const depolar = warehouses.map((w) => ({ id: w.id, name: w.name }));
  const rows = mapHareketRows(movements);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: movements.length,
    giris: movements
      .filter((m) => m.type === "IN")
      .reduce((acc, m) => acc + m.quantity, 0),
    cikis: movements
      .filter((m) => m.type === "OUT" || m.type === "WASTE")
      .reduce((acc, m) => acc + m.quantity, 0),
    buAy: movements.filter(
      (m) => calendarMonth(m.date) === buAy && calendarYear(m.date) === buYil
    ).length,
  };

  return (
    <PageShell
      title="Stok Hareketleri"
      description="Stok giriş, çıkış, transfer ve düzeltme kayıtlarını takip edin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Hareket Kaydı"
          value={ozet.kayit}
          icon={ArrowLeftRight}
          accent="amber"
          subtext={`${ozet.buAy} bu ay`}
        />
        <StatCard
          label="Toplam Giriş"
          value={ozet.giris.toLocaleString("tr-TR")}
          icon={ArrowDownLeft}
          accent="emerald"
        />
        <StatCard
          label="Toplam Çıkış"
          value={ozet.cikis.toLocaleString("tr-TR")}
          icon={ArrowUpRight}
          accent="rose"
        />
        <StatCard
          label="Farklı Ürün"
          value={new Set(movements.map((m) => m.productId)).size}
          icon={Package}
          accent="blue"
        />
      </div>

      <PanelCard
        icon={ArrowLeftRight}
        title="Hareket Kayıtları"
        description="Tarih, ürün, tür, depo ve miktar — yeni hareket eklemek için üstteki butonu kullanın"
        accent="amber"
      >
        <HareketWorkspace rows={rows} urunler={urunler} depolar={depolar} />
      </PanelCard>
    </PageShell>
  );
}
