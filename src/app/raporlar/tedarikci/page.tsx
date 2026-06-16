import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getTedarikciRaporu } from "@/lib/reports";
import { formatCurrency } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TedarikciRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const sp = await searchParams;
  const ad = sp.ad ?? (await prisma.tedarikci.findFirst())?.ad ?? "";
  const rapor = ad ? await getTedarikciRaporu(ad) : null;
  const tedarikciler = await prisma.tedarikci.findMany({ orderBy: { ad: "asc" } });
  return (
    <PageShell title="Tedarikçi Raporu">
      {rapor && (
        <Card><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div><p className="text-sm text-[var(--muted-foreground)]">Mal Alımı Tutarı</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.alimToplam)}</p></div>
          <div><p className="text-sm text-[var(--muted-foreground)]">Peşin Ödemeler</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.pesin)}</p></div>
          <div><p className="text-sm text-[var(--muted-foreground)]">Yapılan Ödemeler</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.odenen)}</p></div>
          <div><p className="text-sm text-[var(--muted-foreground)]">Borç</p>
            <p className="text-xl font-semibold">{formatCurrency(rapor.borc)}</p></div>
        </CardContent></Card>
      )}
      <DataTable rows={tedarikciler.map((t) => ({ ad: t.ad, tip: t.tip }))} searchKeys={["ad"]} columns={[
        { key: "ad", label: "Tedarikçi" }, { key: "tip", label: "Tip" },
      ]} />
    </PageShell>
  );
}
