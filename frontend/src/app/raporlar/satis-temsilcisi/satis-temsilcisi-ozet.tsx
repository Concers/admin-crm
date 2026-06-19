import { Card, CardContent } from "@/components/ui/card";
import { ProductBarChart } from "@/components/charts";
import { formatCurrency } from "@/lib/calculations";
import type { SatisTemsilcisiRow, SatisTemsilcisiTotals } from "./satis-temsilcisi-rows";

export function SatisTemsilcisiOzet({
  totals,
  rows,
}: {
  totals: SatisTemsilcisiTotals;
  rows: SatisTemsilcisiRow[];
}) {
  const chart = rows.slice(0, 12).map((r) => ({ name: r.temsilci, value: r._profit }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border shadow-sm">
          <CardContent className="py-4">
            <p className="text-xs uppercase text-[var(--muted-foreground)]">Temsilci</p>
            <p className="text-2xl font-semibold">{totals.temsilciSayisi}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
          <CardContent className="py-4">
            <p className="text-xs uppercase text-emerald-800/70">Toplam ciro</p>
            <p className="text-lg font-semibold text-emerald-900">{formatCurrency(totals.toplamCiro)}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="py-4">
            <p className="text-xs uppercase text-[var(--muted-foreground)]">Net kâr</p>
            <p className="text-lg font-semibold">{formatCurrency(totals.toplamKar)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{totals.toplamSiparis} sipariş</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="py-4">
            <p className="text-xs uppercase text-[var(--muted-foreground)]">Kârlı / zararlı</p>
            <p className="text-lg font-semibold">
              {totals.karliCount} / {totals.zararliCount}
            </p>
          </CardContent>
        </Card>
      </div>
      {chart.length > 0 && (
        <Card className="border shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-4 text-sm font-semibold">Temsilci bazında net kâr</h2>
            <ProductBarChart data={chart} barColor="#022E40" maxItems={15} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
