import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getSupplierDebtList } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function TedarikciBorcPage() {
  const liste = await getSupplierDebtList();
  const rows = liste.map((l) => ({
    ad: l.name,
    alimToplam: formatCurrency(l.purchaseTotal),
    odenen: formatCurrency(l.paidToThem),
    bizimAlacak: formatCurrency(l.receivable),
    netBorc: formatCurrency(l.debt),
  }));
  return (
    <PageShell title="Tedarikçi Borç Listesi">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Net borç = (alım − ödeme) − (o cariye satışlarımızdaki alacağımız). Bir firma hem satıcı
        hem alıcıysa bakiyeler birbirini netler; burada net borçlu olduğumuz cariler listelenir.
      </p>
      <DataTable
        rows={rows}
        searchKeys={["ad"]}
        columns={[
          { key: "ad", label: "Cari" },
          { key: "alimToplam", label: "Alım Toplamı" },
          { key: "odenen", label: "Ödenen" },
          { key: "bizimAlacak", label: "Bizim Alacağımız" },
          { key: "netBorc", label: "Net Borç" },
        ]}
      />
    </PageShell>
  );
}
