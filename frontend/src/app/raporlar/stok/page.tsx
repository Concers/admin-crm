import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getStockReport } from "@/lib/api";
import { StokRaporOzet } from "./stok-rapor-ozet";
import { StokRaporTable } from "./stok-rapor-table";
import { buildStokTableRows, buildStokTotals } from "./stok-rows";

export const dynamic = "force-dynamic";

export default async function StokRaporPage() {
  const stok = await getStockReport();
  const totals = buildStokTotals(stok);
  const rows = buildStokTableRows(stok);

  return (
    <PageShell
      title="Stok Raporu"
      description="Ürün bazında alım, satış ve güncel stok seviyeleri"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                Her ürün için <strong className="text-[var(--foreground)]">toplam alım</strong>,{" "}
                <strong className="text-[var(--foreground)]">toplam satış</strong> ve{" "}
                <strong className="text-emerald-700">mevcut stok</strong> gösterilir. Stok; alım, satış,
                manuel hareketler, <strong className="text-[var(--foreground)]">iadeler</strong> ve{" "}
                <strong className="text-[var(--foreground)]">tamamlanan üretim emirleri</strong> ile hesaplanır
                (tek kaynak: stok hareketleri özeti).
              </p>
              <p className="mt-1">
                <span className="font-medium text-emerald-700">Yeşil</span> stokta,{" "}
                <span className="font-medium text-amber-800">turuncu</span> tükenmiş,{" "}
                <span className="font-medium text-rose-700">kırmızı</span> eksi stok anlamına gelir.
              </p>
            </div>
          </div>
          <Link
            href="/raporlar/dusuk-stok"
            className="shrink-0 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
          >
            Düşük stok uyarısı →
          </Link>
        </CardContent>
      </Card>

      <StokRaporOzet totals={totals} rows={rows} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Ürün Bazlı Detay</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Rafa, duruma veya miktara göre filtreleyin; ürün satırındaki bağlantıyla hareket dökümüne gidin
          </p>
        </div>
        <StokRaporTable rows={rows} />
      </div>
    </PageShell>
  );
}
