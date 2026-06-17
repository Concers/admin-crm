import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ExpenseBreakdownPieChart } from "@/components/charts";
import { getExpenseReport } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ayAdi } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function GiderRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string; yil?: string }>;
}) {
  const sp = await searchParams;
  const ay = sp.ay ? Number(sp.ay) : undefined;
  const yil = sp.yil ? Number(sp.yil) : undefined;
  const giderler = await getExpenseReport(ay, yil);
  const toplam = giderler.reduce(
    (sum, g) => sum + g.paidAmount,
    0,
  );
  const kategoriMap = new Map<string, number>();
  for (const g of giderler) {
    kategoriMap.set(g.category, (kategoriMap.get(g.category) ?? 0) + g.totalAmount);
  }
  const kategoriDagilimi = [...kategoriMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const rows = giderler.map((g) => {
    const gunDate = new Date(g.date);
    return {
      gun: formatDate(gunDate),
      ay: ayAdi(gunDate.getMonth() + 1),
      yil: String(gunDate.getFullYear()),
      giderKategori: g.scope === "PRODUCT" ? "Ürün Gideri" : "Genel Gider",
      giderTuru: g.category,
      urunAdi: g.product?.name ?? "-",
      tedarikciAdi: g.partner?.name ?? "-",
      pesinOdenen: formatCurrency(g.paidAmount),
      aylikGiderPayi: g.monthlyShare != null
        ? formatCurrency(g.monthlyShare)
        : "-",
    };
  });
  return (
    <PageShell title="Gider Raporu">
      <Card><CardContent className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          {ay && yil ? `${ay}/${yil} filtresi` : "Tüm giderler"}
        </p>
        <p className="text-lg font-semibold">Toplam: {formatCurrency(toplam)}</p>
      </CardContent></Card>
      {kategoriDagilimi.length > 0 && (
        <Card><CardContent>
          <h3 className="mb-4 font-semibold">Kategori Bazlı Gider Dağılımı</h3>
          <ExpenseBreakdownPieChart data={kategoriDagilimi} />
        </CardContent></Card>
      )}
      <DataTable rows={rows} searchKeys={["giderTuru", "urunAdi", "ay"]} columns={[
        { key: "gun", label: "Gün" }, { key: "ay", label: "Ay" }, { key: "yil", label: "Yıl" },
        { key: "giderKategori", label: "Kategori" },
        { key: "giderTuru", label: "Gider Türü" }, { key: "urunAdi", label: "Ürün" },
        { key: "tedarikciAdi", label: "Tedarikçi" }, { key: "pesinOdenen", label: "Peşin" },
        { key: "aylikGiderPayi", label: "Aylık Pay" },
      ]} />
    </PageShell>
  );
}
