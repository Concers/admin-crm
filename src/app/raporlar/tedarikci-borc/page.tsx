import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getTedarikciBorcListesi } from "@/lib/reports";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function TedarikciBorcPage() {
  const liste = await getTedarikciBorcListesi();
  const rows = liste.map((l) => ({
    ad: l.ad,
    tip: l.tip,
    alimBorc: formatCurrency(l.alimBorc),
    odenen: formatCurrency(l.odenen),
    borc: formatCurrency(l.borc),
  }));
  return (
    <PageShell title="Tedarikçi Borç Listesi">
      <DataTable rows={rows} searchKeys={["ad"]} columns={[
        { key: "ad", label: "Tedarikçi" }, { key: "tip", label: "Tip" },
        { key: "alimBorc", label: "Alım Borcu" }, { key: "odenen", label: "Ödenen" },
        { key: "borc", label: "Kalan Borç" },
      ]} />
    </PageShell>
  );
}
