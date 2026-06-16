import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getMusteriAlacakListesi } from "@/lib/reports";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function MusteriAlacakPage() {
  const liste = await getMusteriAlacakListesi();
  const rows = liste.map((l) => ({
    ad: l.ad,
    satisToplam: formatCurrency(l.satisToplam),
    tahsil: formatCurrency(l.tahsil),
    alacak: formatCurrency(l.alacak),
  }));
  return (
    <PageShell title="Müşteri Alacak Listesi">
      <DataTable rows={rows} searchKeys={["ad"]} columns={[
        { key: "ad", label: "Müşteri" },
        { key: "satisToplam", label: "Satış Toplamı" },
        { key: "tahsil", label: "Tahsilat" },
        { key: "alacak", label: "Alacak" },
      ]} />
    </PageShell>
  );
}
