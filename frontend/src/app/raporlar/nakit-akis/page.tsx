import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { TrendLineChart } from "@/components/charts";
import { getCashFlowProjection } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function NakitAkisPage() {
  const data = await getCashFlowProjection(6);

  const chartData = data.map((d) => ({ label: d.label, value: d.net }));

  const rows = data.map((d) => ({
    ay: d.label,
    giris: formatCurrency(d.inflow),
    cikis: formatCurrency(d.outflow),
    net: formatCurrency(d.net),
    kumulatif: formatCurrency(d.cumulative),
  }));

  return (
    <PageShell title="Nakit Akış Projeksiyonu">
      {chartData.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
            Aylık Net Nakit Akışı
          </h2>
          <TrendLineChart data={chartData} />
        </div>
      )}
      <DataTable
        rows={rows}
        searchKeys={["ay"]}
        searchPlaceholder="Ay ara…"
        columns={[
          { key: "ay", label: "Ay" },
          { key: "giris", label: "Giriş" },
          { key: "cikis", label: "Çıkış" },
          { key: "net", label: "Net" },
          { key: "kumulatif", label: "Kümülatif" },
        ]}
      />
    </PageShell>
  );
}
