import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getCustomerStatement, getPartners } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function MusteriRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const sp = await searchParams;
  const ad = sp.ad ?? "Orvelife - Musa Bey";
  const [rapor, musteriler] = await Promise.all([
    getCustomerStatement(ad),
    getPartners(), // B2B: any partner can be a customer
  ]);
  return (
    <PageShell title="Müşteri Raporu">
      <Card><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div><p className="text-sm text-[var(--muted-foreground)]">Satış Toplam (KDV Hariç)</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.saleTotal)}</p></div>
        <div><p className="text-sm text-[var(--muted-foreground)]">KDV'li Toplam</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.vatIncludedTotal)}</p></div>
        <div><p className="text-sm text-[var(--muted-foreground)]">Tahsilat</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.collected)}</p></div>
        <div><p className="text-sm text-[var(--muted-foreground)]">Alacak</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.receivable)}</p></div>
      </CardContent></Card>
      <DataTable rows={musteriler.map((m) => ({ ad: m.name }))} searchKeys={["ad"]} searchPlaceholder="Müşteri ara…" defaultSort={{ key: "ad", asc: true }} columns={[
        { key: "ad", label: "Müşteri" },
      ]} />
    </PageShell>
  );
}
