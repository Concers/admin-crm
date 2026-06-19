import { BarChart3, Minus, ShoppingCart, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import { ExpenseBreakdownPieChart, IncomeExpenseBarChart, ProductBarChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { MusteriKarlilikRow, MusteriKarlilikTotals } from "./musteri-karlilik-rows";

const DURUM_CARDS = [
  {
    key: "karli",
    label: "Kârlı müşteri",
    hint: "Satış kârı pozitif",
    icon: TrendingUp,
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    countKey: "karliCount" as const,
  },
  {
    key: "zararli",
    label: "Zararlı müşteri",
    hint: "Maliyet ciroyu aşıyor",
    icon: TrendingDown,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    countKey: "zararliCount" as const,
  },
  {
    key: "basabas",
    label: "Başabaş",
    hint: "Kâr ≈ 0",
    icon: Minus,
    card: "border-slate-200 bg-slate-50/80",
    iconWrap: "bg-slate-100 text-slate-700 ring-slate-200",
    value: "text-slate-800",
    countKey: "basabasCount" as const,
  },
];

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function OzetMoney({ value, className }: { value: number; className?: string }) {
  const text = formatCurrency(value);
  return (
    <p
      className={cn(
        "mt-1 min-w-0 break-words text-sm font-semibold leading-snug tabular-nums sm:text-base lg:text-lg",
        className
      )}
      title={text}
    >
      {text}
    </p>
  );
}

function OzetStatBox({
  label,
  children,
  hint,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border px-4 py-3", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</div> : null}
    </div>
  );
}

export function MusteriKarlilikOzet({
  totals,
  rows,
}: {
  totals: MusteriKarlilikTotals;
  rows: MusteriKarlilikRow[];
}) {
  if (totals.musteriSayisi === 0) {
    return (
      <Card className="border-[var(--border)] bg-[var(--muted)]/20 shadow-sm">
        <CardContent className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          Kârlılık analizi için satış kaydı bulunmuyor.
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Kârlı", value: totals.karliCount },
    { name: "Zararlı", value: totals.zararliCount },
    { name: "Başabaş", value: totals.basabasCount },
  ].filter((d) => d.value > 0);

  const ozetChart = [
    { name: "Ciro", value: totals.toplamCiro },
    { name: "Maliyet", value: totals.toplamMaliyet },
    { name: "Kâr", value: Math.max(0, totals.toplamKar) },
  ].filter((d) => d.value > 0);

  const karChart = [...rows]
    .filter((r) => r._profit > 0)
    .sort((a, b) => b._profit - a._profit)
    .slice(0, 12)
    .map((r) => ({ name: r.musteri, value: r._profit }));

  const zararChart = [...rows]
    .filter((r) => r._profit < 0)
    .sort((a, b) => a._profit - b._profit)
    .slice(0, 8)
    .map((r) => ({ name: r.musteri, value: Math.abs(r._profit) }));

  const karTone = totals.toplamKar >= 0 ? "text-emerald-900" : "text-rose-900";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DURUM_CARDS.map((bucket) => {
          const Icon = bucket.icon;
          const count = totals[bucket.countKey];
          const share = pct(count, totals.musteriSayisi);
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
                    {count} müşteri
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    %{share} · {bucket.hint}
                  </p>
                </div>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", bucket.iconWrap)}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden border-[var(--border)] shadow-sm">
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/50 to-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Genel Kârlılık Özeti</h2>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                Tüm müşterilerde ciro, maliyet ve net kâr
              </p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 2xl:grid-cols-4">
          <OzetStatBox
            label="Müşteri"
            hint={
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                Satışı olan cariler
              </span>
            }
            className="border-[var(--border)] bg-white"
          >
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.musteriSayisi}</p>
          </OzetStatBox>
          <OzetStatBox
            label={
              <span className="inline-flex items-center gap-1 text-blue-800/80">
                <ShoppingCart className="h-3 w-3" />
                Toplam ciro
              </span>
            }
            hint={<span className="text-blue-800/70">KDV hariç</span>}
            className="border-blue-100 bg-blue-50/50"
          >
            <OzetMoney value={totals.toplamCiro} className="text-blue-900" />
          </OzetStatBox>
          <OzetStatBox
            label={<span className="text-amber-800/80">Toplam maliyet</span>}
            hint={<span className="text-amber-800/70">Birim maliyet × adet</span>}
            className="border-amber-100 bg-amber-50/50"
          >
            <OzetMoney value={totals.toplamMaliyet} className="text-amber-900" />
          </OzetStatBox>
          <OzetStatBox
            label={<span className="text-emerald-800/80">Net kâr / marj</span>}
            hint={
              <span className="text-emerald-800/70">Ort. marj %{totals.ortMarj.toFixed(1)}</span>
            }
            className="border-emerald-100 bg-emerald-50/50"
          >
            <OzetMoney value={totals.toplamKar} className={karTone} />
          </OzetStatBox>
        </CardContent>
      </Card>

      {pieData.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm lg:max-w-md">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Müşteri Dağılımı</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">Kârlı, zararlı ve başabaş müşteriler</p>
            <ExpenseBreakdownPieChart data={pieData} />
          </CardContent>
        </Card>
      )}

      {ozetChart.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Ciro — Maliyet — Kâr</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">Tüm müşterilerde toplam finansal özet</p>
            <IncomeExpenseBarChart data={ozetChart} />
          </CardContent>
        </Card>
      )}

      {karChart.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">En Kârlı Müşteriler</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              Net kâra göre sıralı — tam müşteri adları solda
            </p>
            <ProductBarChart data={karChart} barColor="#059669" maxItems={15} />
          </CardContent>
        </Card>
      )}

      {zararChart.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Zarar Ettiren Müşteriler</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              Maliyeti aşan satışlar — zarar tutarına göre
            </p>
            <ProductBarChart data={zararChart} barColor="#e11d48" maxItems={10} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
