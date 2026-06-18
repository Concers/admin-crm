import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Banknote, TrendingUp, Users } from "lucide-react";
import { getCashFlows, getPartners } from "@/lib/api";
import { formatCurrency, calendarMonth, calendarYear } from "@/lib/utils";
import { TahsilatWorkspace } from "./tahsilat-workspace";
import { mapTahsilatRows } from "./tahsilat-rows";

export const dynamic = "force-dynamic";

export default async function MusteriTahsilatPage() {
  const [tahsilatlar, musteriler] = await Promise.all([
    getCashFlows("COLLECTION"),
    getPartners("CUSTOMER"),
  ]);

  const musteriAdlari = [
    ...new Set([...musteriler.map((m) => m.name), ...tahsilatlar.map((t) => t.partner.name)]),
  ].sort((a, b) => a.localeCompare(b, "tr"));
  const rows = mapTahsilatRows(tahsilatlar);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: tahsilatlar.length,
    toplamTahsilat: tahsilatlar.reduce((acc, t) => acc + t.amount, 0),
    musteriSayisi: new Set(tahsilatlar.map((t) => t.partner.name)).size,
    buAyTahsilat: tahsilatlar
      .filter((t) => calendarMonth(t.date) === buAy && calendarYear(t.date) === buYil)
      .reduce((acc, t) => acc + t.amount, 0),
  };

  return (
    <PageShell
      title="Müşteri Tahsilat"
      description="Müşteri tahsilatlarını kaydedin ve nakit girişlerini takip edin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Tahsilat Kaydı"
          value={ozet.kayit}
          icon={Banknote}
          accent="emerald"
          subtext={`${ozet.musteriSayisi} farklı müşteri`}
        />
        <StatCard
          label="Toplam Tahsilat"
          value={formatCurrency(ozet.toplamTahsilat)}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="Bu Ay Tahsilat"
          value={formatCurrency(ozet.buAyTahsilat)}
          icon={Users}
          accent="indigo"
        />
        <StatCard
          label="Ortalama Tahsilat"
          value={formatCurrency(ozet.kayit > 0 ? ozet.toplamTahsilat / ozet.kayit : 0)}
          icon={Banknote}
          accent="amber"
        />
      </div>

      <PanelCard
        icon={Banknote}
        title="Tahsilat Kayıtları"
        description="Excel ile aynı sütunlar — tarih, müşteri, tutar ve notlar"
        accent="emerald"
      >
        <TahsilatWorkspace rows={rows} musteriler={musteriAdlari} />
      </PanelCard>
    </PageShell>
  );
}
