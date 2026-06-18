import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Banknote, FileText, Receipt, TrendingUp } from "lucide-react";
import { getInvoices, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, calendarMonth, calendarYear } from "@/lib/utils";
import { FaturaWorkspace } from "./fatura-workspace";
import { mapFaturaRows } from "./fatura-rows";

export const dynamic = "force-dynamic";

export default async function FaturaPage() {
  const [invoices, partners, products] = await Promise.all([
    getInvoices(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));
  const partnerOpts = partners.map((p) => ({ id: p.id, name: p.name }));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name }));
  const rows = mapFaturaRows(invoices, partnerName);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: invoices.length,
    toplamTutar: invoices.reduce((acc, inv) => acc + inv.totalAmount, 0),
    odenenSayisi: invoices.filter((inv) => inv.status === "PAID").length,
    buAyTutar: invoices
      .filter((inv) => calendarMonth(inv.date) === buAy && calendarYear(inv.date) === buYil)
      .reduce((acc, inv) => acc + inv.totalAmount, 0),
  };

  return (
    <PageShell
      title="Faturalar"
      description="Satış ve alım faturalarını kaydedin, takip edin ve düzenleyin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Fatura Kaydı"
          value={ozet.kayit}
          icon={FileText}
          accent="blue"
          subtext={`${ozet.odenenSayisi} ödendi`}
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={TrendingUp}
          accent="indigo"
        />
        <StatCard
          label="Bu Ay"
          value={formatCurrency(ozet.buAyTutar)}
          icon={Receipt}
          accent="amber"
        />
        <StatCard
          label="Ortalama Fatura"
          value={formatCurrency(ozet.kayit > 0 ? ozet.toplamTutar / ozet.kayit : 0)}
          icon={Banknote}
          accent="emerald"
        />
      </div>

      <PanelCard
        icon={FileText}
        title="Fatura Kayıtları"
        description="Fatura no, tarih, cari, vade, durum ve tutarlar — satıra tıklayarak düzenleyin"
        accent="blue"
      >
        <FaturaWorkspace rows={rows} partners={partnerOpts} products={productOpts} />
      </PanelCard>
    </PageShell>
  );
}
