import { AlertTriangle, Clock, Scale, ShieldCheck, Timer } from "lucide-react";
import { ExpenseBreakdownPieChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { AgingTotals } from "./aging-rows";

const BUCKETS = [
  {
    key: "d0_30" as const,
    label: "0–30 Gün",
    hint: "Güncel alacak",
    icon: ShieldCheck,
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    chart: "#7a7d52",
  },
  {
    key: "d31_60" as const,
    label: "31–60 Gün",
    hint: "Takip edilmeli",
    icon: Clock,
    card: "border-blue-100 bg-blue-50/60",
    iconWrap: "bg-blue-100 text-blue-700 ring-blue-200",
    value: "text-blue-800",
    chart: "#3383a3",
  },
  {
    key: "d61_90" as const,
    label: "61–90 Gün",
    hint: "Gecikme riski",
    icon: Timer,
    card: "border-amber-100 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-800 ring-amber-200",
    value: "text-amber-900",
    chart: "#BF8F36",
  },
  {
    key: "d90plus" as const,
    label: "90+ Gün",
    hint: "Yüksek tahsilat riski",
    icon: AlertTriangle,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    chart: "#8B3A2A",
  },
];

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function AgingRaporOzet({ totals }: { totals: AgingTotals }) {
  const overdue = totals.d31_60 + totals.d61_90 + totals.d90plus;
  const overduePct = pct(overdue, totals.total);
  const risk90Pct = pct(totals.d90plus, totals.total);

  const chartData = BUCKETS.map((b) => ({
    name: b.label,
    value: totals[b.key],
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {BUCKETS.map((bucket) => {
          const Icon = bucket.icon;
          const amount = totals[bucket.key];
          const share = pct(amount, totals.total);
          return (
            <Card
              key={bucket.key}
              className={cn("overflow-hidden border shadow-sm transition-shadow hover:shadow-md", bucket.card)}
            >
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {bucket.label}
                  </p>
                  <p className={cn("mt-1 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl", bucket.value)}>
                    {formatCurrency(amount)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {share}% · {bucket.hint}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                    bucket.iconWrap
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/50 to-white px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Genel Özet</h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Açık alacakların yaş dağılımı ve risk görünümü
                </p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Toplam Açık Alacak
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                {formatCurrency(totals.total)}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{totals.cariCount} cari</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800/80">31+ Gün (Geciken)</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
                {formatCurrency(overdue)}
              </p>
              <p className="mt-1 text-xs text-amber-800/70">Toplamın %{overduePct}&apos;i</p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-800/80">90+ Gün Riski</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-800">
                {formatCurrency(totals.d90plus)}
              </p>
              <p className="mt-1 text-xs text-rose-700/80">
                {totals.risk90Count} cari · %{risk90Pct}
              </p>
            </div>
          </CardContent>
        </Card>

        {chartData.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Yaş Dağılımı</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                Her dilimdeki toplam alacak tutarı
              </p>
              <ExpenseBreakdownPieChart data={chartData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
