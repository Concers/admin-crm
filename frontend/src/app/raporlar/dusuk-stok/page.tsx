import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getLowStockReport } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DusukStokPage() {
  const liste = await getLowStockReport();
  const rows = liste.map((l) => ({
    urun: l.product,
    stok: l.stock,
    minStok: l.minStock,
    birim: l.unit,
  }));
  return (
    <PageShell title="Düşük Stok Uyarısı">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Bu liste, mevcut stoğu yeniden sipariş (minimum) seviyesinde veya altında olan ürünleri
        gösterir.
      </p>
      <DataTable
        rows={rows}
        searchKeys={["urun"]}
        searchPlaceholder="Ürün ara…"
        emptyText="Minimum stok seviyesinin altında ürün yok."
        columns={[
          { key: "urun", label: "Ürün" },
          { key: "stok", label: "Mevcut Stok" },
          { key: "minStok", label: "Min. Stok" },
          { key: "birim", label: "Birim" },
        ]}
      />
    </PageShell>
  );
}
