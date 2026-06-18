import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getAgingReport } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function AgingRaporPage() {
  const liste = await getAgingReport();
  const rows = liste.map((l) => ({
    ad: l.name,
    d0_30: formatCurrency(l.d0_30),
    d31_60: formatCurrency(l.d31_60),
    d61_90: formatCurrency(l.d61_90),
    d90plus: formatCurrency(l.d90plus),
    toplam: formatCurrency(l.total),
  }));
  return (
    <PageShell title="Alacak Durum Raporu">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Açık alacaklar, vade/işlem tarihine göre yaş gruplarına ayrılır. 90+ gün sütununda
        biriken tutarlar tahsilat riski yüksek alacakları gösterir.
      </p>
      <DataTable
        rows={rows}
        searchKeys={["ad"]}
        searchPlaceholder="Cari ara…"
        columns={[
          { key: "ad", label: "Cari" },
          { key: "d0_30", label: "0-30 Gün" },
          { key: "d31_60", label: "31-60 Gün" },
          { key: "d61_90", label: "61-90 Gün" },
          { key: "d90plus", label: "90+ Gün" },
          { key: "toplam", label: "Toplam" },
        ]}
      />
    </PageShell>
  );
}
