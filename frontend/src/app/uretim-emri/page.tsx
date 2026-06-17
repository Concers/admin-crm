import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getProductionOrders, getProducts } from "@/lib/api";
import { formatDate } from "@/lib/calculations";
import { EmirForm } from "./emir-form";
import { EmirList, type EmirRow } from "./emir-list";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Üretimde",
  DONE: "Tamamlandı",
  CANCELLED: "İptal",
};

export default async function UretimEmriPage() {
  const [orders, products] = await Promise.all([
    getProductionOrders(),
    getProducts(),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));

  const rows: EmirRow[] = orders.map((o) => {
    const productId = Number(o.productId);
    const status = String(o.status ?? "");
    const startDate = o.startDate ? String(o.startDate) : "";
    return {
      id: Number(o.id),
      mamul: productName.get(productId) ?? String(o.productId ?? ""),
      miktar: String(o.quantity ?? ""),
      durum: STATUS[status] ?? status,
      baslangic: startDate ? formatDate(new Date(startDate)) : "—",
    };
  });

  return (
    <PageShell title="Üretim Emri">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Üretim Emri</h3>
          <EmirForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
        </CardContent>
      </Card>
      <EmirList rows={rows} />
    </PageShell>
  );
}
