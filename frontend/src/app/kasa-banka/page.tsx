import { PageShell } from "@/components/page-shell";
import { PanelCard, StatCard } from "@/components/ui/stat-card";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { getAccountBalances, getAccounts, getCashFlows } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { HesapFilter, HesapWorkspace } from "./hesap-workspace";
import { KasaHareketWorkspace } from "./hareket-workspace";
import { mapHesapRows, mapKasaHareketRows } from "./kasa-rows";

export const dynamic = "force-dynamic";

export default async function KasaBankaPage({
  searchParams,
}: {
  searchParams: Promise<{ hesap?: string }>;
}) {
  const sp = await searchParams;
  const accountId = sp.hesap ? Number(sp.hesap) : undefined;
  const validAccountId = accountId && Number.isInteger(accountId) ? accountId : undefined;

  const [accounts, balances, flows] = await Promise.all([
    getAccounts(),
    getAccountBalances(),
    getCashFlows(undefined, validAccountId),
  ]);

  const hesapRows = mapHesapRows(accounts, balances);
  const hareketRows = mapKasaHareketRows(flows);
  const accountOpts = accounts.map((a) => ({ id: a.id, name: a.name }));

  const toplamBakiye = balances.reduce((s, b) => s + b.balance, 0);
  const toplamTahsilat = flows.filter((f) => f.type === "COLLECTION").reduce((s, f) => s + f.amount, 0);
  const toplamOdeme = flows.filter((f) => f.type === "PAYMENT").reduce((s, f) => s + f.amount, 0);

  return (
    <PageShell title="Kasa / Banka" description="Hesap tanımları ve nakit hareketleri">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatCard label="Hesap" value={accounts.length} icon={Wallet} accent="indigo" />
        <StatCard label="Toplam bakiye" value={formatCurrency(toplamBakiye)} icon={ArrowDownLeft} accent="emerald" />
        <StatCard
          label="Hareket (filtreli)"
          value={hareketRows.length}
          icon={ArrowUpRight}
          accent="blue"
          subtext={`↑ ${formatCurrency(toplamTahsilat)} / ↓ ${formatCurrency(toplamOdeme)}`}
        />
      </div>

      <PanelCard icon={Wallet} title="Hesaplar" description="Kasa ve banka hesap tanımları" accent="indigo">
        <HesapWorkspace rows={hesapRows} />
      </PanelCard>

      <PanelCard icon={Wallet} title="Nakit Hareketleri" description="Tahsilat ve ödemeler — hesaba göre filtreleyin" accent="blue">
        <HesapFilter accounts={accountOpts} selectedId={validAccountId} />
        <KasaHareketWorkspace rows={hareketRows} accounts={accountOpts} />
      </PanelCard>
    </PageShell>
  );
}
