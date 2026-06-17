import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getStockMovements, getProducts } from "@/lib/api";
import { formatDate } from "@/lib/calculations";
import { HareketForm } from "./hareket-form";

export const dynamic = "force-dynamic";

const TUR_LABEL: Record<string, string> = {
  IN: "Giriş",
  OUT: "Çıkış",
  ADJUSTMENT: "Düzeltme",
  TRANSFER: "Transfer",
  WASTE: "Fire",
};

export default async function StokHareketleriPage() {
  const [movements, products] = await Promise.all([
    getStockMovements(),
    getProducts(),
  ]);
  const urunler = products
    .map((p) => p.name)
    .sort((a, b) => a.localeCompare(b, "tr"));
  const rows = movements.map((m) => ({
    tarih: formatDate(new Date(m.date)),
    urun: m.product?.name ?? "-",
    tur: TUR_LABEL[m.type] ?? m.type,
    miktar: m.quantity,
    aciklama: m.reason ?? "",
  }));

  return (
    <PageShell title="Stok Hareketleri">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Hareket</h3>
        <HareketForm urunler={urunler} />
      </CardContent></Card>
      <DataTable
        rows={rows}
        searchKeys={["urun", "tur", "aciklama"]}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "urun", label: "Ürün" },
          { key: "tur", label: "Tür" },
          { key: "miktar", label: "Miktar" },
          { key: "aciklama", label: "Açıklama" },
        ]}
      />
    </PageShell>
  );
}
