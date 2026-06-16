import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getMusteriRaporu } from "@/lib/reports";
import { formatCurrency } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MusteriRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const sp = await searchParams;
  const ad = sp.ad ?? "Orvelife - Musa Bey";
  const rapor = await getMusteriRaporu(ad);
  const musteriler = [...new Set((await prisma.urunSatis.findMany()).map((s) => s.musteri))];
  return (
    <PageShell title="Müşteri Raporu">
      <Card><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div><p className="text-sm text-[var(--muted-foreground)]">Satış Toplam (KDV Hariç)</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.satisToplam)}</p></div>
        <div><p className="text-sm text-[var(--muted-foreground)]">KDV'li Toplam</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.kdvliToplam)}</p></div>
        <div><p className="text-sm text-[var(--muted-foreground)]">Tahsilat</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.tahsil)}</p></div>
        <div><p className="text-sm text-[var(--muted-foreground)]">Alacak</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.alacak)}</p></div>
      </CardContent></Card>
      <DataTable rows={musteriler.map((m) => ({ ad: m }))} searchKeys={["ad"]} columns={[
        { key: "ad", label: "Müşteri" },
      ]} />
    </PageShell>
  );
}
