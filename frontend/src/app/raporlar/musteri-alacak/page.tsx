import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getCustomerReceivableList } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function MusteriAlacakPage() {
  const liste = await getCustomerReceivableList();
  const rows = liste.map((l) => ({
    ad: l.name,
    satisToplam: formatCurrency(l.salesTotal),
    tahsil: formatCurrency(l.collected),
    bizimBorc: formatCurrency(l.payable),
    netAlacak: formatCurrency(l.net),
  }));
  return (
    <PageShell title="Müşteri Alacak Listesi">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Net alacak = (satış − tahsilat) − (o cariden alımlarımızdaki borcumuz). Bir firma hem
        alıcı hem satıcıysa bakiyeler birbirini netler; burada net alacaklı cariler listelenir.
      </p>
      <DataTable
        rows={rows}
        searchKeys={["ad"]}
        columns={[
          { key: "ad", label: "Cari" },
          { key: "satisToplam", label: "Satış Toplamı" },
          { key: "tahsil", label: "Tahsilat" },
          { key: "bizimBorc", label: "Bizim Borcumuz" },
          { key: "netAlacak", label: "Net Alacak" },
        ]}
      />
    </PageShell>
  );
}
