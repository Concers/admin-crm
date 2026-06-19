import { AlertTriangle, BellRing, PackageMinus, ShoppingCart, TrendingDown } from "lucide-react";
import { ExpenseBreakdownPieChart, IncomeExpenseBarChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatQty } from "../stok/stok-rows";
import type { DusukStokTableRow, DusukStokTotals } from "./dusuk-stok-rows";

const URGENCY_CARDS = [
  {
    key: "kritik",
    label: "Kritik (Stok 0)",
    hint: "Acil sipariş gerekir",
    icon: PackageMinus,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    countKey: "kritikCount" as const,
  },
  {
    key: "uyari",
    label: "Uyarı",
    hint: "Min. seviyenin altında",
    icon: BellRing,
    card: "border-amber-100 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-800 ring-amber-200",
    value: "text-amber-900",
    countKey: "uyariCount" as const,
  },
  {
    key: "eksi",
    label: "Eksi Stok",
    hint: "Satış stoku aştı",
    icon: AlertTriangle,
    card: "border-red-200 bg-red-50/60",
    iconWrap: "bg-red-100 text-red-700 ring-red-200",
    value: "text-red-800",
    countKey: "eksiCount" as const,
  },
];

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function DusukStokRaporOzet({
  totals,
  rows,
}: {
  totals: DusukStokTotals;
  rows: DusukStokTableRow[];
}) {
  if (totals.urunCount === 0) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Tüm ürünler minimum seviyenin üzerinde</p>
            <p className="text-sm text-emerald-800/80">
              Şu an yeniden sipariş gerektiren ürün bulunmuyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Kritik", value: totals.kritikCount },
    { name: "Uyarı", value: totals.uyariCount },
    { name: "Eksi Stok", value: totals.eksiCount },
  ].filter((d) => d.value > 0);

  const deficitChart = [...rows]
    .filter((r) => r._eksik > 0)
    .sort((a, b) => b._eksik - a._eksik)
    .slice(0, 8)
    .map((r) => ({
      name: r.urun.length > 18 ? `${r.urun.slice(0, 18)}…` : r.urun,
      value: r._eksik,
    }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {URGENCY_CARDS.map((bucket) => {
          const Icon = bucket.icon;
          const count = totals[bucket.countKey];
          const share = pct(count, totals.urunCount);
          return (
            <Card
              key={bucket.key}
              className={`overflow-hidden border shadow-sm transition-shadow hover:shadow-md ${bucket.card}`}
            >
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {bucket.label}
                  </p>
                  <p className={`mt-1 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl ${bucket.value}`}>
                    {count} ürün
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    %{share} · {bucket.hint}
                  </p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${bucket.iconWrap}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <div className="border-b border-[var(--border)] bg-gradient-to-r from-amber-50/80 to-white px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-200">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Sipariş Özeti</h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Minimum stok seviyesine göre eksik miktarlar
                </p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Uyarılı Ürün
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-900">{totals.urunCount}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Min. seviye veya altı</p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-800/80">
                Toplam Eksik
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-800">
                {formatQty(totals.totalDeficit)}
              </p>
              <p className="mt-1 text-xs text-rose-700/80">Sipariş edilmesi önerilen</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800/80">
                Ort. Doluluk
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
                %{totals.avgFillPct}
              </p>
              <p className="mt-1 text-xs text-amber-800/70">Mevcut / min. stok</p>
            </div>
          </CardContent>
        </Card>

        {pieData.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Aciliyet Dağılımı</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                Kritik, uyarı ve eksi stok ürün sayıları
              </p>
              <ExpenseBreakdownPieChart data={pieData} />
            </CardContent>
          </Card>
        )}
      </div>

      {deficitChart.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">En Yüksek Eksik Miktar</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              Minimum stoka ulaşmak için gereken miktar (ilk 8 ürün)
            </p>
            <IncomeExpenseBarChart data={deficitChart} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
