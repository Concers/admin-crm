import { PageShell } from "@/components/page-shell";
import { getShelves, getStockReport } from "@/lib/api";
import { RafTakibiView } from "./raf-view";

export const dynamic = "force-dynamic";

export default async function RafTakibiPage() {
  const [stok, shelves] = await Promise.all([getStockReport(), getShelves()]);
  const rows = stok.map((s) => ({
    product: s.product,
    shelf: s.shelf,
    unit: s.unit,
    stock: s.stock,
  }));
  const occupiedCodes = new Set(
    rows.map((r) => r.shelf?.trim()).filter((s): s is string => Boolean(s)),
  );
  const emptyShelves = shelves
    .filter((s) => s.isActive && !occupiedCodes.has(s.code))
    .map((s) => ({ id: s.id, code: s.code, location: s.location, notes: s.notes }));

  return (
    <PageShell title="Raf Takibi">
      <RafTakibiView rows={rows} emptyShelves={emptyShelves} />
    </PageShell>
  );
}
