import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getDeadStock } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function OluStokRaporPage() {
  const data = await getDeadStock(90);
  const rows = data.map((d) => ({
    product: d.product,
    stok: d.stock + " " + d.unit,
    sonSatis: d.lastSale ? formatDate(new Date(d.lastSale)) : "Hiç",
    bekleme: d.idleDays != null ? d.idleDays + " gün" : "—",
    deger: formatCurrency(d.value),
  }));

  return (
    <PageShell title="Ölü Stok">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        90 günden uzun süredir satılmayan, stokta bekleyen ürünler.
      </p>
      <DataTable
        rows={rows}
        searchKeys={["product"]}
        columns={[
          { key: "product", label: "Ürün" },
          { key: "stok", label: "Stok" },
          { key: "sonSatis", label: "Son Satış" },
          { key: "bekleme", label: "Bekleme" },
          { key: "deger", label: "Stok Değeri" },
        ]}
      />
    </PageShell>
  );
}
