import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, BarChart3, Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { CashFlowInOutBarChart, IncomeExpenseBarChart, TrendLineChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { NakitAkisRow, NakitAkisTotals } from "./nakit-akis-rows";

const DURUM_CARDS = [
  {
    key: "pozitif",
    label: "Pozitif ay",
    hint: "Giriş > çıkış",
    icon: TrendingUp,
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    countKey: "pozitifAyCount" as const,
  },
  {
    key: "negatif",
    label: "Negatif ay",
    hint: "Çıkış > giriş",
    icon: TrendingDown,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    countKey: "negatifAyCount" as const,
  },
  {
    key: "dengede",
    label: "Dengede",
    hint: "Giriş = çıkış",
    icon: Scale,
    card: "border-amber-100 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-700 ring-amber-200",
    value: "text-amber-800",
    countKey: "dengedeAyCount" as const,
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

export function NakitAkisOzet({
  totals,
  rows,
  horizonLabel,
}: {
  totals: NakitAkisTotals;
  rows: NakitAkisRow[];
  horizonLabel: string;
}) {
  const hasMovement = totals.toplamGiris > 0 || totals.toplamCikis > 0;

  if (!hasMovement) {
    return (
      <Card className="border-[var(--border)] bg-[var(--muted)]/20 shadow-sm">
        <CardContent className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          Önümüzdeki {horizonLabel} için beklenen nakit hareketi bulunmuyor (tüm alacak/borçlar tahsil/ödendi
          sayılabilir).
        </CardContent>
      </Card>
    );
  }

  const inOutChart = rows.map((r) => ({
    name: r.ay,
    giris: r._inflow,
    cikis: r._outflow,
  }));

  const netChart = rows.map((r) => ({ label: r.ay, value: r._net }));
  const kumulatifChart = rows.map((r) => ({ label: r.ay, value: r._cumulative }));

  const toplamKarsilastirma = [
    { name: "Toplam giriş", value: totals.toplamGiris },
    { name: "Toplam çıkış", value: totals.toplamCikis },
  ].filter((d) => d.value > 0);

  const netTone =
    totals.sonKumulatif > 0 ? "text-emerald-900" : totals.sonKumulatif < 0 ? "text-rose-900" : "text-[var(--foreground)]";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DURUM_CARDS.map((bucket) => {
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
                    {count} ay
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
              <h2 className="text-base font-semibold tracking-tight">Nakit Özeti</h2>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                Önümüzdeki {horizonLabel} — vadesi gelen tahsilat ve ödemeler
              </p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 2xl:grid-cols-4">
          <OzetStatBox
            label="Dönem"
            hint={`${totals.aySayisi} aylık projeksiyon`}
            className="border-[var(--border)] bg-white"
          >
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.aySayisi}</p>
          </OzetStatBox>
          <OzetStatBox
            label={
              <span className="inline-flex items-center gap-1 text-emerald-800/80">
                <ArrowDownLeft className="h-3 w-3" />
                Toplam giriş
              </span>
            }
            hint={totals.enYuksekGirisAy ? `En yoğun: ${totals.enYuksekGirisAy}` : "Tahsil edilecek alacaklar"}
            className="border-emerald-100 bg-emerald-50/50"
          >
            <OzetMoney value={totals.toplamGiris} className="text-emerald-900" />
          </OzetStatBox>
          <OzetStatBox
            label={
              <span className="inline-flex items-center gap-1 text-rose-800/80">
                <ArrowUpRight className="h-3 w-3" />
                Toplam çıkış
              </span>
            }
            hint={totals.enYuksekCikisAy ? `En yoğun: ${totals.enYuksekCikisAy}` : "Ödenecek borç ve giderler"}
            className="border-rose-100 bg-rose-50/50"
          >
            <OzetMoney value={totals.toplamCikis} className="text-rose-900" />
          </OzetStatBox>
          <OzetStatBox
            label={
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Dönem sonu kümülatif
              </span>
            }
            hint={`Net: ${formatCurrency(totals.toplamNet)}`}
            className="border-[var(--border)] bg-white"
          >
            <OzetMoney value={totals.sonKumulatif} className={netTone} />
          </OzetStatBox>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {toplamKarsilastirma.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Giriş vs Çıkış</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">Tüm dönem toplamları</p>
              <IncomeExpenseBarChart data={toplamKarsilastirma} />
            </CardContent>
          </Card>
        )}
        {inOutChart.some((d) => d.giris > 0 || d.cikis > 0) && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm lg:col-span-2">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Aylık Giriş / Çıkış</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">Vade tarihine göre aylık dağılım</p>
              <CashFlowInOutBarChart data={inOutChart} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {netChart.some((d) => d.value !== 0) && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Aylık Net Akış</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">Giriş − çıkış</p>
              <TrendLineChart data={netChart} stroke="#996888" />
            </CardContent>
          </Card>
        )}
        {kumulatifChart.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Kümülatif Nakit</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">Ay ay biriken net pozisyon</p>
              <TrendLineChart data={kumulatifChart} stroke="#86a59c" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
