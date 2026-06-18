import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getAbcAnalysis } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function AbcRaporPage() {
  const data = await getAbcAnalysis();
  const countA = data.filter((d) => d.class === "A").length;
  const countB = data.filter((d) => d.class === "B").length;
  const countC = data.filter((d) => d.class === "C").length;

  const rows = data.map((d) => ({
    product: d.product,
    ciro: formatCurrency(d.revenue),
    adet: d.quantity,
    ciroPct: d.revenuePct.toFixed(1) + "%",
    kumPct: d.cumulativePct.toFixed(1) + "%",
    sinif: d.class,
  }));

  return (
    <PageShell title="ABC Analizi">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        A sınıfı: {countA} ürün · B sınıfı: {countB} ürün · C sınıfı: {countC} ürün
      </p>
      <DataTable
        rows={rows}
        searchKeys={["product", "sinif"]}
        searchPlaceholder="Ürün veya sınıf ara…"
        defaultSort={{ key: "product", asc: true }}
        columns={[
          { key: "product", label: "Ürün" },
          { key: "ciro", label: "Ciro" },
          { key: "adet", label: "Adet" },
          { key: "ciroPct", label: "Ciro %" },
          { key: "kumPct", label: "Kümülatif %" },
          { key: "sinif", label: "Sınıf" },
        ]}
      />
    </PageShell>
  );
}
