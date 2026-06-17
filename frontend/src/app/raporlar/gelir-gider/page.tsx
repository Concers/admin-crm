import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { IncomeExpenseBarChart, ExpenseBreakdownPieChart } from "@/components/charts";
import { getIncomeExpenseReport } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function GelirGiderRaporPage() {
  const baslangic = new Date(2025, 0, 1);
  const bitis = new Date();
  const rapor = await getIncomeExpenseReport(baslangic.toISOString(), bitis.toISOString());

  const karsilastirma = [
    { name: "Gelir", value: rapor.income },
    { name: "Gider", value: rapor.expense },
    { name: "Kâr", value: rapor.profit },
  ];
  const dagilim = [
    { name: "Gelir", value: rapor.income },
    { name: "Gider", value: rapor.expense },
  ];
  return (
    <PageShell title="Gelir-Gider Raporu">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">Yapılan Satış Toplamı</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">{formatCurrency(rapor.income)}</p>
        </CardContent></Card>
        <Card><CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">Toplam Gider</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{formatCurrency(rapor.expense)}</p>
        </CardContent></Card>
        <Card><CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">Net Kâr / Zarar</p>
          <p className={`mt-1 text-2xl font-semibold ${rapor.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(rapor.profit)}
          </p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardContent>
          <h3 className="mb-4 font-semibold">Gelir / Gider / Kâr</h3>
          <IncomeExpenseBarChart data={karsilastirma} />
        </CardContent></Card>
        <Card><CardContent>
          <h3 className="mb-4 font-semibold">Gelir - Gider Dağılımı</h3>
          <ExpenseBreakdownPieChart data={dagilim} />
        </CardContent></Card>
      </div>
    </PageShell>
  );
}
