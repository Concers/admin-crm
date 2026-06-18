import { PageShell } from "@/components/page-shell";
import { getStockReport } from "@/lib/api";
import { RafTakibiView } from "./raf-view";

export const dynamic = "force-dynamic";

export default async function RafTakibiPage() {
  const stok = await getStockReport();
  const rows = stok.map((s) => ({
    product: s.product,
    shelf: s.shelf,
    unit: s.unit,
    stock: s.stock,
  }));
  return (
    <PageShell title="Raf Takibi">
      <RafTakibiView rows={rows} />
    </PageShell>
  );
}
