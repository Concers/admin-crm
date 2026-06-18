import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import {
  Building2,
  FileText,
  Link2,
  Scale,
  Wallet,
} from "lucide-react";
import {
  getPartners,
  getReconciliation,
  getReconciliationSummary,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ReconcileWorkspace } from "./reconcile-workspace";
import { SummaryWorkspace, PartnerPickerHint } from "./summary-workspace";
import { mapCariOzetRows } from "./mutabakat-rows";

export const dynamic = "force-dynamic";

export default async function MutabakatPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string }>;
}) {
  const sp = await searchParams;
  const partnerId = sp.partnerId ? Number(sp.partnerId) : null;

  const [partners, summary, data] = await Promise.all([
    getPartners(),
    getReconciliationSummary(),
    partnerId ? getReconciliation(partnerId) : Promise.resolve(null),
  ]);

  const selectedPartner = partnerId
    ? partners.find((p) => p.id === partnerId)
    : null;
  const ozetRows = mapCariOzetRows(summary, partners);

  const globalOzet = {
    cariSayisi: ozetRows.length,
    toplamAcik: summary.reduce((acc, s) => acc + s.open, 0),
    toplamFaturalanan: summary.reduce((acc, s) => acc + s.invoiced, 0),
    toplamTahsis: summary.reduce((acc, s) => acc + s.allocated, 0),
  };

  const cariOzet = data
    ? {
        acikBakiye: data.invoices.reduce((acc, i) => acc + Math.max(0, i.balance), 0),
        dagitilmamis: data.cashFlows.reduce((acc, c) => acc + Math.max(0, c.unallocated), 0),
        tahsisSayisi: data.allocations.length,
        kapaliFatura: data.invoices.filter((i) => i.balance <= 0.01).length,
      }
    : null;

  return (
    <PageShell
      title="Ödeme Mutabakatı"
      description="Faturaları ödemeler ve tahsilatlarla eşleştirerek kısmi ödemeleri kapatın"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {cariOzet ? (
          <>
            <StatCard
              label="Açık Fatura Bakiyesi"
              value={formatCurrency(cariOzet.acikBakiye)}
              icon={FileText}
              accent="amber"
              subtext={selectedPartner?.name}
            />
            <StatCard
              label="Dağıtılmamış"
              value={formatCurrency(cariOzet.dagitilmamis)}
              icon={Wallet}
              accent="indigo"
            />
            <StatCard
              label="Tahsis Kaydı"
              value={cariOzet.tahsisSayisi}
              icon={Link2}
              accent="blue"
            />
            <StatCard
              label="Kapalı Fatura"
              value={cariOzet.kapaliFatura}
              icon={Scale}
              accent="emerald"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Cari (Faturalı)"
              value={globalOzet.cariSayisi}
              icon={Building2}
              accent="indigo"
            />
            <StatCard
              label="Toplam Açık Bakiye"
              value={formatCurrency(globalOzet.toplamAcik)}
              icon={FileText}
              accent="amber"
            />
            <StatCard
              label="Faturalanan"
              value={formatCurrency(globalOzet.toplamFaturalanan)}
              icon={Scale}
              accent="blue"
            />
            <StatCard
              label="Tahsis Edilen"
              value={formatCurrency(globalOzet.toplamTahsis)}
              icon={Wallet}
              accent="emerald"
            />
          </>
        )}
      </div>

      <PanelCard
        icon={Wallet}
        title="Cari Seçimi"
        description="Mutabakat yapılacak cariyi seçin — bir fatura birden çok ödemeyle, bir ödeme birden çok faturaya bölünebilir"
        accent="indigo"
        headerExtra={
          partnerId ? (
            <Link
              href="/mutabakat"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Temizle
            </Link>
          ) : undefined
        }
      >
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <Label htmlFor="partnerId">Cari</Label>
            <Select
              id="partnerId"
              name="partnerId"
              required
              defaultValue={partnerId ?? ""}
            >
              <option value="" disabled>
                Seçin
              </option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Getir
          </Button>
        </form>
      </PanelCard>

      {data && selectedPartner ? (
        <PanelCard
          icon={Link2}
          title={`${selectedPartner.name} — Mutabakat`}
          description="Açık faturalar, ödemeler/tahsilatlar ve mevcut tahsisler"
          accent="blue"
        >
          <ReconcileWorkspace data={data} />
        </PanelCard>
      ) : (
        <PanelCard
          icon={Building2}
          title="Cari Özet"
          description="Faturalanan tutar, tahsis ve açık bakiye — satırdan mutabakata geçin"
          accent="amber"
        >
          <div className="space-y-4">
            <PartnerPickerHint />
            <SummaryWorkspace rows={ozetRows} />
          </div>
        </PanelCard>
      )}
    </PageShell>
  );
}
