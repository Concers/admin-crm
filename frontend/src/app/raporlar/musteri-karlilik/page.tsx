import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomerProfitability } from "@/lib/api";
import { MusteriKarlilikOzet } from "./musteri-karlilik-ozet";
import { MusteriKarlilikTable } from "./musteri-karlilik-table";
import { buildMusteriKarlilikRows, buildMusteriKarlilikTotals } from "./musteri-karlilik-rows";

export const dynamic = "force-dynamic";

export default async function MusteriKarlilikPage() {
  const data = await getCustomerProfitability();
  const totals = buildMusteriKarlilikTotals(data);
  const rows = buildMusteriKarlilikRows(data);

  return (
    <PageShell
      title="Müşteri Kârlılık Analizi"
      description="Müşteri bazında ciro, maliyet, net kâr ve marj oranı"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-emerald-50/40 shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">Kâr</strong> = ciro − maliyet (birim maliyet × adet).
                Maliyet; alım, üretim ve genel gider paylarını içerir.
              </p>
              <p className="mt-1">
                <span className="font-medium text-emerald-700">Kârlı</span>,{" "}
                <span className="font-medium text-rose-700">zararlı</span> ve{" "}
                <span className="font-medium text-slate-700">başabaş</span> müşteriler ayrı renklendirilir.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/musteri"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Müşteri raporu →
            </Link>
            <Link
              href="/raporlar/abc"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              ABC analizi →
            </Link>
          </div>
        </CardContent>
      </Card>

      <MusteriKarlilikOzet totals={totals} rows={rows} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Müşteri Bazında Kârlılık</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Net kâra göre sıralı — durum veya tutara göre filtreleyebilirsiniz
          </p>
        </div>
        <MusteriKarlilikTable rows={rows} />
      </div>
    </PageShell>
  );
}
