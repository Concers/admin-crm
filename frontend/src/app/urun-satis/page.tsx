import { PageShell } from "@/components/page-shell";
import { getSales, getProducts, getPartners } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ExportButton } from "@/components/export-button";
import { ImportButton } from "@/components/import-button";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { ShoppingCart, TrendingUp, Receipt, Users } from "lucide-react";
import { SatisWorkspace } from "./satis-list";
import { mapSatisRows } from "./satis-rows";

export const dynamic = "force-dynamic";

export default async function UrunSatisPage() {
  const [satislar, urunler, musteriler] = await Promise.all([
    getSales(),
    getProducts(),
    getPartners(),
  ]);

  const urunAdlari = urunler.map((u: { name: string }) => u.name);
  const musteriAdlari = musteriler.map((t: { name: string }) => t.name);
  const rows = mapSatisRows(satislar);

  const ozet = {
    kayit: satislar.length,
    toplamAdet: satislar.reduce((acc, s) => acc + s.quantity, 0),
    toplamTutar: satislar.reduce((acc, s) => acc + (s.totalAmount ?? 0), 0),
    kdvDahil: satislar.reduce((acc, s) => acc + (s.vatIncludedAmount ?? 0), 0),
    pesinTahsil: satislar.reduce((acc, s) => acc + (s.paidAmount ?? 0), 0),
  };

  return (
    <PageShell
      title="Ürün Satış Giriş"
      description="Müşteri satışlarını kaydedin, ciro ve kârlılığı takip edin"
      actions={
        <>
          <ImportButton type="sales" />
          <ExportButton type="sales" />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Satış Kaydı"
          value={ozet.kayit}
          icon={ShoppingCart}
          accent="blue"
          subtext={`${ozet.toplamAdet.toLocaleString("tr-TR")} adet toplam`}
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={TrendingUp}
          accent="emerald"
          subtext="KDV hariç"
        />
        <StatCard
          label="KDV Dahil"
          value={formatCurrency(ozet.kdvDahil)}
          icon={Receipt}
          accent="indigo"
        />
        <StatCard
          label="Peşin Tahsilat"
          value={formatCurrency(ozet.pesinTahsil)}
          icon={Users}
          accent="amber"
        />
      </div>

      <PanelCard
        icon={TrendingUp}
        title="Satış Kayıtları"
        description="Excel ile aynı sütunlar — kaydırarak tüm alanları görebilirsiniz"
        accent="blue"
      >
        <SatisWorkspace rows={rows} urunler={urunAdlari} musteriler={musteriAdlari} />
      </PanelCard>
    </PageShell>
  );
}
