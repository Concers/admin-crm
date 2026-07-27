import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getProducts, getStockLedger } from "@/lib/api";
import { HareketDokumOzet } from "./hareket-dokum-ozet";
import { HareketDokumTable } from "./hareket-dokum-table";
import {
  buildHareketDokumTableRows,
  buildHareketDokumTotals,
} from "./hareket-dokum-rows";
import { ProductSelect } from "./product-select";

export const dynamic = "force-dynamic";

export default async function StokHareketPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const sp = await searchParams;
  const urunler = await getProducts();
  const secili = sp.name ?? urunler[0]?.name ?? "";
  const seciliUrun = urunler.find((u) => u.name === secili);

  const ledger = secili ? await getStockLedger(secili) : null;
  const totals = buildHareketDokumTotals(ledger);
  const birim = seciliUrun?.unit ?? undefined;
  const rows = buildHareketDokumTableRows(ledger, birim);

  return (
    <PageShell
      title="Stok Hareket Dökümü"
      description="Seçilen ürünün alım, satış ve manuel hareketleri ile yürüyen bakiyesi"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <ScrollText className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                Her satır bir stok hareketini gösterir:{" "}
                <strong className="text-emerald-700">alım/giriş</strong> stoğu artırır,{" "}
                <strong className="text-rose-700">satış/çıkış</strong> azaltır.{" "}
                <strong className="text-[var(--foreground)]">Bakiye</strong> sütunu o ana kadarki
                yürüyen toplamı verir.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/stok"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              ← Stok raporu
            </Link>
            <Link
              href="/stok-hareketleri"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Manuel hareket ekle →
            </Link>
          </div>
        </CardContent>
      </Card>

      {urunler.length > 0 ? (
        <ProductSelect products={urunler.map((u) => u.name)} selected={secili} />
      ) : (
        <Card className="border-amber-100 bg-amber-50/50">
          <CardContent className="py-5 text-sm text-amber-900">
            Henüz tanımlı ürün yok. Önce Tanımlama bölümünden ürün ekleyin.
          </CardContent>
        </Card>
      )}

      {secili && ledger && (
        <>
          <HareketDokumOzet
            productName={secili}
            unit={birim}
            totals={totals}
            ledger={ledger}
          />

          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Hareket Listesi</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Türe, yöne veya miktara göre filtreleyebilirsiniz
              </p>
            </div>
            <HareketDokumTable rows={rows} />
          </div>
        </>
      )}
    </PageShell>
  );
}
