import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { TrendLineChart } from "@/components/charts";
import { getProductReport, getProducts } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function UrunRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string }>;
}) {
  const sp = await searchParams;
  const urunAdi = sp.urun;
  const [rapor, urunler] = await Promise.all([
    getProductReport(urunAdi),
    getProducts(),
  ]);

  const aylikMap = new Map<string, number>();
  for (const satis of rapor.sales) {
    const d = new Date(satis.date);
    const ay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    aylikMap.set(ay, (aylikMap.get(ay) ?? 0) + satis.vatIncludedAmount);
  }
  const aylikSeri = [...aylikMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));

  return (
    <PageShell title="Ürün Raporu">
      <Card><CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Ürün Satış Tutarı (KDV Hariç)</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.saleAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Ürün Alım Tutarı</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.purchaseAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Kâr</p>
          <p className="text-xl font-semibold">{formatCurrency(rapor.profit)}</p>
        </div>
      </CardContent></Card>
      {urunAdi && aylikSeri.length > 0 && (
        <Card><CardContent>
          <h3 className="mb-4 font-semibold">Aylık Satış Trendi (KDV Dahil)</h3>
          <TrendLineChart data={aylikSeri} />
        </CardContent></Card>
      )}
      {!urunAdi && (
        <DataTable rows={urunler.map((u) => ({ ad: u.name }))} searchKeys={["ad"]} searchPlaceholder="Ürün ara…" defaultSort={{ key: "ad", asc: true }} columns={[
          { key: "ad", label: "Ürün (detay için URL'ye ?urun= eklenebilir)" },
        ]} />
      )}
    </PageShell>
  );
}
