import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, BarChart3, Plus, Receipt, Sparkles } from "lucide-react";
import { ExpenseBreakdownPieChart, IncomeExpenseBarChart, ProductBarChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { GiderMerkeziRow, GiderMerkeziTotals } from "./gider-merkezi-rows";

const TREND_CARDS = [
  {
    key: "artis",
    label: "Artış",
    hint: "Önceki döneme göre yükselen",
    icon: ArrowUp,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    countKey: "artisCount" as const,
  },
  {
    key: "azalis",
    label: "Azalış",
    hint: "Önceki döneme göre düşen",
    icon: ArrowDown,
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    countKey: "azalisCount" as const,
  },
  {
    key: "yeni",
    label: "Yeni kategori",
    hint: "Önceki dönemde yoktu",
    icon: Sparkles,
    card: "border-violet-100 bg-violet-50/60",
    iconWrap: "bg-violet-100 text-violet-700 ring-violet-200",
    value: "text-violet-800",
    countKey: "yeniCount" as const,
  },
];

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

export function GiderMerkeziOzet({
  totals,
  rows,
  donemLabel,
  oncekiLabel,
}: {
  totals: GiderMerkeziTotals;
  rows: GiderMerkeziRow[];
  donemLabel: string;
  oncekiLabel: string;
}) {
  if (totals.kategoriSayisi === 0) {
    return (
      <Card className="border-[var(--border)] bg-[var(--muted)]/20 shadow-sm">
        <CardContent className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          {donemLabel} için gider kaydı bulunmuyor.
        </CardContent>
      </Card>
    );
  }

  const pieData = rows
    .filter((r) => r._current > 0)
    .slice(0, 8)
    .map((r) => ({ name: r.kategori, value: r._current }));

  const karsilastirmaChart = [
    { name: donemLabel, value: totals.toplamBuDonem },
    { name: oncekiLabel, value: totals.toplamOncekiDonem },
  ].filter((d) => d.value > 0);

  const kategoriChart = [...rows]
    .filter((r) => r._current > 0)
    .sort((a, b) => b._current - a._current)
    .slice(0, 12)
    .map((r) => ({ name: r.kategori, value: r._current }));

  const degisimTone =
    totals.netDegisim > 0 ? "text-rose-900" : totals.netDegisim < 0 ? "text-emerald-900" : "text-[var(--foreground)]";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TREND_CARDS.map((bucket) => {
          const Icon = bucket.icon;
          const count = totals[bucket.countKey];
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
                    {count} kategori
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{bucket.hint}</p>
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
              <h2 className="text-base font-semibold tracking-tight">Gider Özeti</h2>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                {donemLabel} vs {oncekiLabel.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 2xl:grid-cols-4">
          <OzetStatBox
            label="Kategori"
            hint={`${totals.kategoriSayisi} gider türü`}
            className="border-[var(--border)] bg-white"
          >
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.kategoriSayisi}</p>
          </OzetStatBox>
          <OzetStatBox
            label={
              <span className="inline-flex items-center gap-1 text-violet-800/80">
                <Receipt className="h-3 w-3" />
                {donemLabel}
              </span>
            }
            hint="Seçili dönem toplamı"
            className="border-violet-100 bg-violet-50/50"
          >
            <OzetMoney value={totals.toplamBuDonem} className="text-violet-900" />
          </OzetStatBox>
          <OzetStatBox
            label={<span className="text-slate-700">{oncekiLabel}</span>}
            hint="Karşılaştırma dönemi"
            className="border-slate-200 bg-slate-50/80"
          >
            <OzetMoney value={totals.toplamOncekiDonem} className="text-slate-800" />
          </OzetStatBox>
          <OzetStatBox
            label={
              <span className="inline-flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Net değişim
              </span>
            }
            hint={
              <span className={degisimTone}>
                {totals.netDegisim >= 0 ? "+" : ""}
                {totals.netDegisimPct.toFixed(1)}%
              </span>
            }
            className="border-[var(--border)] bg-white"
          >
            <OzetMoney value={totals.netDegisim} className={degisimTone} />
          </OzetStatBox>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {karsilastirmaChart.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Dönem Karşılaştırması</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">Toplam gider — bu dönem vs önceki</p>
              <IncomeExpenseBarChart data={karsilastirmaChart} />
            </CardContent>
          </Card>
        )}
        {pieData.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Kategori Dağılımı</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">{donemLabel} — ilk 8 kategori</p>
              <ExpenseBreakdownPieChart data={pieData} />
            </CardContent>
          </Card>
        )}
      </div>

      {kategoriChart.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Kategori Bazında Gider</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              {donemLabel} tutarları — tam kategori adları solda
            </p>
            <ProductBarChart data={kategoriChart} barColor="#7c3aed" maxItems={15} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
