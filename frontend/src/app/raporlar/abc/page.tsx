import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getAbcAnalysis } from "@/lib/api";
import { AbcRaporOzet } from "./abc-rapor-ozet";
import { AbcRaporTable } from "./abc-rapor-table";
import { buildAbcTableRows, buildAbcTotals } from "./abc-rows";

export const dynamic = "force-dynamic";

export default async function AbcRaporPage() {
  const data = await getAbcAnalysis();
  const totals = buildAbcTotals(data);
  const rows = buildAbcTableRows(data);

  return (
    <PageShell
      title="ABC Analizi"
      description="Ürünleri satış cirosuna göre A / B / C sınıflarına ayırır"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-emerald-700">A sınıfı</strong> — kümülatif cirosu ilk %80&apos;i oluşturan
                ürünler.{" "}
                <strong className="text-amber-800">B sınıfı</strong> — sonraki %15.{" "}
                <strong className="text-slate-700">C sınıfı</strong> — kalan %5.
              </p>
              <p className="mt-1">Ciro, KDV hariç satış tutarına göre hesaplanır; ürünler büyükten küçüğe sıralanır.</p>
            </div>
          </div>
          <Link
            href="/raporlar/urun?liste=1"
            className="shrink-0 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
          >
            Ürün raporu →
          </Link>
        </CardContent>
      </Card>

      <AbcRaporOzet totals={totals} rows={rows} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Ürün Sınıflandırması</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Ciroya göre sıralı liste — sınıf veya ürün adına göre filtreleyin
          </p>
        </div>
        <AbcRaporTable rows={rows} />
      </div>
    </PageShell>
  );
}
