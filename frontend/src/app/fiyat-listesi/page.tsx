import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getPriceLists, getProducts } from "@/lib/api";
import { FiyatForm } from "./fiyat-form";
import { FiyatList, type FiyatRow } from "./fiyat-list";

export const dynamic = "force-dynamic";

export default async function FiyatListesiPage() {
  const [priceLists, products] = await Promise.all([
    getPriceLists(),
    getProducts(),
  ]);

  const rows: FiyatRow[] = priceLists.map((pl) => {
    const items = Array.isArray(pl.items) ? pl.items : [];
    return {
      id: Number(pl.id),
      ad: String(pl.name ?? ""),
      paraBirimi: String(pl.currency ?? ""),
      kalemSayisi: items.length,
    };
  });

  return (
    <PageShell title="Fiyat Listesi">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Fiyat Listesi</h3>
          <FiyatForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
        </CardContent>
      </Card>
      <FiyatList rows={rows} />
    </PageShell>
  );
}
