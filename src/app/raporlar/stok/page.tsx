import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getStokRaporu } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function StokRaporPage() {
  const stok = await getStokRaporu();
  const rows = stok.map((s) => ({
    urun: s.urun,
    toplamAlim: s.toplamAlim,
    toplamSatis: s.toplamSatis,
    stok: s.stok,
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
