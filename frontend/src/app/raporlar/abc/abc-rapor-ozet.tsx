import { BarChart3, Package, TrendingUp } from "lucide-react";
import { ExpenseBreakdownPieChart, IncomeExpenseBarChart, ProductBarChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { AbcSinif, AbcTableRow, AbcTotals } from "./abc-rows";

const SINIF_CARDS = [
  {
    sinif: "A" as const,
    label: "A Sınıfı",
    hint: "İlk %80 kümülatif ciro",
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    badge: "bg-emerald-600 text-white",
    barColor: "#059669",
  },
  {
    sinif: "B" as const,
    label: "B Sınıfı",
    hint: "Sonraki %15 (80–95)",
    card: "border-amber-100 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-800 ring-amber-200",
    value: "text-amber-900",
    badge: "bg-amber-600 text-white",
    barColor: "#d97706",
  },
  {
    sinif: "C" as const,
    label: "C Sınıfı",
    hint: "Kalan %5 ciro",
    card: "border-slate-200 bg-slate-50/80",
    iconWrap: "bg-slate-100 text-slate-700 ring-slate-200",
    value: "text-slate-800",
    badge: "bg-slate-500 text-white",
    barColor: "#64748b",
  },
];

function sinifUrunChartData(rows: AbcTableRow[], sinif: AbcSinif) {
  return rows
    .filter((r) => r.sinif === sinif)
    .sort((a, b) => b._revenue - a._revenue)
    .map((r) => ({ name: r.urun, value: r._revenue }));
}

export function AbcRaporOzet({ totals, rows }: { totals: AbcTotals; rows: AbcTableRow[] }) {
  const sinifMap = { A: totals.sinifA, B: totals.sinifB, C: totals.sinifC };

  const sinifChartData = SINIF_CARDS.map((c) => ({
    name: c.label,
    value: sinifMap[c.sinif].ciro,
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SINIF_CARDS.map((bucket) => {
          const ozet = sinifMap[bucket.sinif];
          return (
            <Card
              key={bucket.sinif}
              className={cn("overflow-hidden border shadow-sm transition-shadow hover:shadow-md", bucket.card)}
            >
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                        bucket.badge
                      )}
                    >
                      {bucket.sinif}
                    </span>
                    {bucket.label}
                  </p>
                  <p className={cn("mt-1 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl", bucket.value)}>
                    {ozet.count} ürün
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    %{ozet.ciroPay.toFixed(1)} ciro · {bucket.hint}
                  </p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-[var(--foreground)]">
                    {formatCurrency(ozet.ciro)}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                    bucket.iconWrap
                  )}
                >
                  <Package className="h-5 w-5" />
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
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Genel Özet</h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Satış cirosuna göre ürün sınıflandırması
                </p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Ciro kayıtlı ürün
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.urunSayisi}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Satışı olan ürünler</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-indigo-800/80">
                <TrendingUp className="h-3 w-3" />
                Toplam ciro
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-indigo-900">
                {formatCurrency(totals.toplamCiro)}
              </p>
              <p className="mt-1 text-xs text-indigo-800/70">KDV hariç satış tutarı</p>
            </div>
          </CardContent>
        </Card>

        {sinifChartData.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Sınıf Bazında Ciro</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">A / B / C sınıflarının toplam cirosu</p>
              <ExpenseBreakdownPieChart data={sinifChartData} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-1">
        {SINIF_CARDS.map((bucket) => {
          const urunData = sinifUrunChartData(rows, bucket.sinif);
          return (
            <Card key={bucket.sinif} className="overflow-hidden border-[var(--border)] shadow-sm">
              <CardContent className="pt-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                          bucket.badge
                        )}
                      >
                        {bucket.sinif}
                      </span>
                      {bucket.label} — Ürün Ciroları
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      {urunData.length > 0
                        ? `${urunData.length} ürün, ciroya göre sıralı — tam ürün adları solda`
                        : "Bu sınıfta satışı olan ürün yok"}
                    </p>
                  </div>
                  {urunData.length > 0 && (
                    <p className="text-sm font-medium tabular-nums text-[var(--muted-foreground)]">
                      {formatCurrency(sinifMap[bucket.sinif].ciro)}
                    </p>
                  )}
                </div>
                {urunData.length > 0 ? (
                  <ProductBarChart data={urunData} barColor={bucket.barColor} maxItems={20} />
                ) : (
                  <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                    {bucket.label} için grafik verisi bulunmuyor.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
