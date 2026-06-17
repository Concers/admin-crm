import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getBoms, getProducts } from "@/lib/api";
import { ReceteForm } from "./recete-form";
import { ReceteList, type ReceteRow } from "./recete-list";

export const dynamic = "force-dynamic";

export default async function UretimRecetesiPage() {
  const [boms, products] = await Promise.all([getBoms(), getProducts()]);

  const productName = new Map(products.map((p) => [p.id, p.name]));

  const rows: ReceteRow[] = boms.map((b) => {
    const productId = Number(b.productId);
    const components = Array.isArray(b.components) ? b.components : [];
    return {
      id: Number(b.id),
      ad: String(b.name ?? ""),
      mamul: productName.get(productId) ?? String(b.productId ?? ""),
      bilesenSayisi: components.length,
    };
  });

  return (
    <PageShell title="Ürün Reçetesi (BOM)">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Reçete</h3>
          <ReceteForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
        </CardContent>
      </Card>
      <ReceteList rows={rows} />
    </PageShell>
  );
}
