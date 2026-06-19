import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Building2, TrendingDown, Wallet } from "lucide-react";
import { getAccounts, getCashFlows, getPartners } from "@/lib/api";
import { formatCurrency, calendarMonth, calendarYear } from "@/lib/utils";
import { OdemeWorkspace } from "./odeme-workspace";
import { mapOdemeRows } from "./odeme-rows";

export const dynamic = "force-dynamic";

export default async function TedarikciOdemePage({
  searchParams,
}: {
  searchParams: Promise<{ hesap?: string }>;
}) {
  const sp = await searchParams;
  const accountId = sp.hesap ? Number(sp.hesap) : undefined;
  const validAccountId = accountId && Number.isInteger(accountId) ? accountId : undefined;

  const [odemeler, suppliers, serviceProviders, accounts] = await Promise.all([
    getCashFlows("PAYMENT", validAccountId),
    getPartners("SUPPLIER"),
    getPartners("SERVICE_PROVIDER"),
    getAccounts(),
  ]);

  const tedarikciler = [...suppliers, ...serviceProviders].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );
  const tedarikciAdlari = tedarikciler.map((t) => t.name);
  const rows = mapOdemeRows(odemeler);

  const now = new Date();
  const buAy = now.getMonth() + 1;
  const buYil = now.getFullYear();

  const ozet = {
    kayit: odemeler.length,
    toplamOdenen: odemeler.reduce((acc, o) => acc + o.amount, 0),
    tedarikciSayisi: new Set(odemeler.map((o) => o.partner.name)).size,
    buAyOdenen: odemeler
      .filter((o) => calendarMonth(o.date) === buAy && calendarYear(o.date) === buYil)
      .reduce((acc, o) => acc + o.amount, 0),
  };

  const accountOpts = accounts.map((a) => ({ id: a.id, name: a.name }));

  return (
    <PageShell
      title="Tedarikçi Ödeme"
      description="Tedarikçi ve hizmet sağlayıcı ödemelerini kaydedin ve takip edin"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Ödeme Kaydı"
          value={ozet.kayit}
          icon={Wallet}
          accent="rose"
          subtext={`${ozet.tedarikciSayisi} farklı tedarikçi`}
        />
        <StatCard
          label="Toplam Ödenen"
          value={formatCurrency(ozet.toplamOdenen)}
          icon={TrendingDown}
          accent="amber"
        />
        <StatCard
          label="Bu Ay Ödenen"
          value={formatCurrency(ozet.buAyOdenen)}
          icon={Building2}
          accent="indigo"
        />
        <StatCard
          label="Ortalama Ödeme"
          value={formatCurrency(ozet.kayit > 0 ? ozet.toplamOdenen / ozet.kayit : 0)}
          icon={Wallet}
          accent="blue"
        />
      </div>

      <PanelCard
        icon={Wallet}
        title="Ödeme Kayıtları"
        description="Excel ile aynı sütunlar — tarih, tedarikçi, tutar ve notlar"
        accent="rose"
      >
        <OdemeWorkspace rows={rows} tedarikciler={tedarikciAdlari} accounts={accountOpts} />
      </PanelCard>
    </PageShell>
  );
}
