import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getStockReport } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function StokRaporPage() {
  const stok = await getStockReport();
  const rows = stok.map((s) => ({
    urun: s.product,
    toplamAlim: s.purchased,
    toplamSatis: s.sold,
    stok: s.stock,
  }));
  return (
    <PageShell title="Stok Raporu">
      <DataTable rows={rows} searchKeys={["urun"]} columns={[
        { key: "urun", label: "Ürün" },
        { key: "toplamAlim", label: "Toplam Alım" },
        { key: "toplamSatis", label: "Toplam Satış" },
        { key: "stok", label: "Stok" },
      ]} />
    </PageShell>
  );
}
