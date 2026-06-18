import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getCostCenter } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function GiderMerkeziPage() {
  const data = await getCostCenter();
  const rows = data.map((d) => ({
    category: d.category,
    buDonem: formatCurrency(d.current),
    oncekiDonem: formatCurrency(d.previous),
    degisim: (d.changePct > 0 ? "+" : "") + d.changePct.toFixed(0) + "%",
  }));

  return (
    <PageShell title="Gider Merkezi Dağılımı">
      <DataTable
        rows={rows}
        searchKeys={["category"]}
        searchPlaceholder="Kategori ara…"
        columns={[
          { key: "category", label: "Kategori" },
          { key: "buDonem", label: "Bu Dönem" },
          { key: "oncekiDonem", label: "Önceki Dönem" },
          { key: "degisim", label: "Değişim" },
        ]}
      />
    </PageShell>
  );
}
