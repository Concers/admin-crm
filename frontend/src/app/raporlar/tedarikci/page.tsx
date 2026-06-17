import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getSupplierStatement, getPartners } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function TedarikciRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const sp = await searchParams;
  const partners = await getPartners();
  const tedarikciler = partners
    .filter((p) => p.type === "SUPPLIER" || p.type === "SERVICE_PROVIDER")
    .sort((a, b) => a.name.localeCompare(b.name));
  const ad = sp.ad ?? tedarikciler[0]?.name ?? "";
  const rapor = ad ? await getSupplierStatement(ad) : null;
  return (
    <PageShell title="Tedarikçi Raporu">
      {rapor && (
        <Card><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div><p className="text-sm text-[var(--muted-foreground)]">Mal Alımı Tutarı</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.purchaseTotal)}</p></div>
          <div><p className="text-sm text-[var(--muted-foreground)]">Peşin Ödemeler</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.upfront)}</p></div>
          <div><p className="text-sm text-[var(--muted-foreground)]">Yapılan Ödemeler</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.paid)}</p></div>
          <div><p className="text-sm text-[var(--muted-foreground)]">Borç</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.debt)}</p></div>
        </CardContent></Card>
      )}
      <DataTable
        rows={tedarikciler.map((t) => ({ ad: t.name, tip: t.type }))}
        searchKeys={["ad"]}
        columns={[
          { key: "ad", label: "Tedarikçi" },
          { key: "tip", label: "Tip" },
        ]}
      />
    </PageShell>
  );
}
