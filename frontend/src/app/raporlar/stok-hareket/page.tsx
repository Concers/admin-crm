import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getProducts, getStockLedger } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { ProductSelect } from "./product-select";

export const dynamic = "force-dynamic";

export default async function StokHareketPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const sp = await searchParams;
  const urunler = await getProducts();
  const secili = sp.name ?? urunler[0]?.name;

  const ledger = secili ? await getStockLedger(secili) : null;
  const rows =
    ledger?.movements.map((m) => ({
      tarih: formatDate(new Date(m.date)),
      tur: m.type,
      giris: m.in,
      cikis: m.out,
      bakiye: m.balance,
      neden: m.reason ?? "-",
    })) ?? [];

  return (
    <PageShell title="Stok Hareket Dökümü">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Seçilen ürünün giriş/çıkış hareketleri ve yürüyen bakiyesi.
      </p>
      {urunler.length > 0 && (
        <div className="mb-4">
          <ProductSelect
            products={urunler.map((u) => u.name)}
            selected={secili ?? ""}
          />
        </div>
      )}
      {ledger && (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">Kapanış Bakiyesi</p>
            <p className="text-xl font-semibold">
              {formatCurrency(ledger.balance)}
            </p>
          </CardContent>
        </Card>
      )}
      <DataTable
        rows={rows}
        emptyText="Bu ürün için stok hareketi bulunamadı."
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "tur", label: "Tür" },
          { key: "giris", label: "Giriş" },
          { key: "cikis", label: "Çıkış" },
          { key: "bakiye", label: "Bakiye" },
          { key: "neden", label: "Açıklama" },
        ]}
      />
    </PageShell>
  );
}
