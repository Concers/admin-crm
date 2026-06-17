import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { IncomeExpenseBarChart } from "@/components/charts";
import { getCustomerProfitability } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function MusteriKarlilikPage() {
  const data = await getCustomerProfitability();

  const chartData = [...data]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)
    .map((d) => ({ name: d.customer, value: d.profit }));

  const rows = data.map((d) => ({
    customer: d.customer,
    ciro: formatCurrency(d.revenue),
    maliyet: formatCurrency(d.cost),
    kar: formatCurrency(d.profit),
    marj: d.marginPct.toFixed(1) + "%",
  }));

  return (
    <PageShell title="Müşteri Kârlılık Analizi">
      {chartData.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
            En Kârlı Müşteriler
          </h2>
          <IncomeExpenseBarChart data={chartData} />
        </div>
      )}
      <DataTable
        rows={rows}
        searchKeys={["customer"]}
        columns={[
          { key: "customer", label: "Müşteri" },
          { key: "ciro", label: "Ciro" },
          { key: "maliyet", label: "Maliyet" },
          { key: "kar", label: "Kâr" },
          { key: "marj", label: "Marj %" },
        ]}
      />
    </PageShell>
  );
}
