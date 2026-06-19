import { Target } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getBudgetTargets, getBudgetVariance, getExpenseCategories } from "@/lib/api";
import { ButceHedefPanel } from "./butce-hedef-panel";
import { ButceOzet, ButceTable } from "./butce-rapor";
import { ButceYilSecici } from "./butce-yil-secici";

export const dynamic = "force-dynamic";

function resolveYear(raw?: string) {
  const y = raw ? Number(raw) : new Date().getFullYear();
  return Number.isFinite(y) && y >= 2000 && y <= 2100 ? y : new Date().getFullYear();
}

export default async function ButcePage({
  searchParams,
}: {
  searchParams: Promise<{ yil?: string }>;
}) {
  const sp = await searchParams;
  const year = resolveYear(sp.yil);

  const [report, targets, categories] = await Promise.all([
    getBudgetVariance(year),
    getBudgetTargets(year),
    getExpenseCategories("GENERAL"),
  ]);

  const categoryNames = [...new Set(categories.map((c) => c.name))].sort();

  return (
    <PageShell
      title="Bütçe vs Gerçekleşen"
      description="Aylık satış ve gider hedeflerini tanımlayın, sapmayı izleyin"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-emerald-50/40 shadow-sm">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
            <Target className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            Satış hedefleri <strong className="text-[var(--foreground)]">KDV hariç ciro</strong> üzerinden,
            gider hedefleri <strong className="text-[var(--foreground)]">gider girişi tutarları</strong> üzerinden karşılaştırılır.
            Pozitif satış sapması hedefin üstünde, pozitif gider sapması bütçe aşımı anlamına gelir.
          </p>
        </CardContent>
      </Card>

      <ButceYilSecici selected={year} />
      <ButceOzet report={report} />
      <ButceHedefPanel year={year} targets={targets} categories={categoryNames} />
      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight">Aylık sapma tablosu</h2>
        <ButceTable report={report} />
      </div>
    </PageShell>
  );
}
