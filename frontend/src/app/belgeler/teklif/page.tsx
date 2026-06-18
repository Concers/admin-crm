import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { CheckCircle2, FileSignature, Send, TrendingUp } from "lucide-react";
import { getQuotes, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, calendarMonth, calendarYear } from "@/lib/utils";
import { TeklifWorkspace } from "./teklif-workspace";
import { mapTeklifRows } from "./teklif-rows";

export const dynamic = "force-dynamic";

export default async function TeklifPage() {
  const [quotes, partners, products] = await Promise.all([
    getQuotes(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));
  const partnerOpts = partners.map((p) => ({ id: p.id, name: p.name }));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const rows = mapTeklifRows(quotes, partnerName);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: quotes.length,
    toplamTutar: quotes.reduce((acc, q) => acc + q.totalAmount, 0),
    kabulSayisi: quotes.filter((q) => q.status === "ACCEPTED").length,
    buAyTutar: quotes
      .filter((q) => calendarMonth(q.date) === buAy && calendarYear(q.date) === buYil)
      .reduce((acc, q) => acc + q.totalAmount, 0),
  };

  return (
    <PageShell
      title="Teklifler"
      description="Müşteri tekliflerini oluşturun, takip edin ve düzenleyin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Teklif Kaydı"
          value={ozet.kayit}
          icon={FileSignature}
          accent="emerald"
          subtext={`${ozet.kabulSayisi} kabul edildi`}
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="Bu Ay"
          value={formatCurrency(ozet.buAyTutar)}
          icon={Send}
          accent="indigo"
        />
        <StatCard
          label="Ortalama Teklif"
          value={formatCurrency(ozet.kayit > 0 ? ozet.toplamTutar / ozet.kayit : 0)}
          icon={CheckCircle2}
          accent="amber"
        />
      </div>

      <PanelCard
        icon={FileSignature}
        title="Teklif Kayıtları"
        description="Tarih, cari, geçerlilik, durum ve tutarlar — satıra tıklayarak düzenleyin"
        accent="emerald"
      >
        <TeklifWorkspace rows={rows} partners={partnerOpts} products={productOpts} />
      </PanelCard>
    </PageShell>
  );
}
