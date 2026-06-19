import { FileBarChart } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getAgingReport } from "@/lib/api";
import { AgingRaporOzet } from "./aging-rapor-ozet";
import { AgingRaporTable } from "./aging-rapor-table";
import { buildAgingTableRows, buildAgingTotals } from "./aging-rows";

export const dynamic = "force-dynamic";

export default async function AgingRaporPage() {
  const liste = await getAgingReport();
  const totals = buildAgingTotals(liste);
  const rows = buildAgingTableRows(liste);

  return (
    <PageShell
      title="Alacak Durum Raporu"
      description="Açık alacakların vade yaşına göre dağılımı ve tahsilat riski"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <FileBarChart className="h-5 w-5" />
          </div>
          <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            <p>
              Açık alacaklar, vade veya işlem tarihine göre <strong className="text-[var(--foreground)]">0–30</strong>,{" "}
              <strong className="text-[var(--foreground)]">31–60</strong>, <strong className="text-[var(--foreground)]">61–90</strong> ve{" "}
              <strong className="text-rose-700">90+ gün</strong> dilimlerine ayrılır.
            </p>
            <p className="mt-1">
              <span className="font-medium text-emerald-700">Yeşil</span> güncel,{" "}
              <span className="font-medium text-amber-800">sarı/turuncu</span> gecikme riski,{" "}
              <span className="font-medium text-rose-700">kırmızı</span> yüksek tahsilat riski anlamına gelir.
            </p>
          </div>
        </CardContent>
      </Card>

      <AgingRaporOzet totals={totals} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Cari Bazlı Detay</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Risk seviyesine veya tutara göre filtreleyerek takip edin
          </p>
        </div>
        <AgingRaporTable rows={rows} />
      </div>
    </PageShell>
  );
}
