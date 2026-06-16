import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getUrunRaporu } from "@/lib/reports";
import { formatCurrency } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UrunRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string }>;
}) {
  const sp = await searchParams;
  const urunAdi = sp.urun;
  const rapor = await getUrunRaporu(urunAdi);
  const urunler = await prisma.urun.findMany({ orderBy: { ad: "asc" } });
  return (
    <PageShell title="Ürün Raporu">
      <Card><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Ürün Satış Tutarı (KDV Hariç)</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.satisTutari)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Ürün Alım Tutarı</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.alimTutari)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Kâr</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.kar)}</p>
        </div>
      </CardContent></Card>
      {!urunAdi && (
        <DataTable rows={urunler.map((u) => ({ ad: u.ad }))} searchKeys={["ad"]} columns={[
          { key: "ad", label: "Ürün (detay için URL'ye ?urun= eklenebilir)" },
        ]} />
      )}
    </PageShell>
  );
}
