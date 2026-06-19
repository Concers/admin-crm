import { Archive, Banknote, CalendarOff, Clock, PackageX, TrendingDown } from "lucide-react";
import { ExpenseBreakdownPieChart, ProductBarChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { formatQty } from "../stok/stok-rows";
import type { OluStokTableRow, OluStokTotals } from "./olu-stok-rows";

const DURUM_CARDS = [
  {
    key: "hic",
    label: "Hiç satılmamış",
    hint: "Stokta ama satış kaydı yok",
    icon: PackageX,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    countKey: "hicSatilmamisCount" as const,
  },
  {
    key: "uzun",
    label: "Uzun süredir bekliyor",
    hint: "Eşik süreden eski son satış",
    icon: CalendarOff,
    card: "border-amber-100 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-800 ring-amber-200",
    value: "text-amber-900",
    countKey: "uzunBekleyenCount" as const,
  },
];

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function OluStokRaporOzet({
  totals,
  rows,
}: {
  totals: OluStokTotals;
  rows: OluStokTableRow[];
}) {
  if (totals.urunCount === 0) {
    return (
      <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">
              {totals.gunEsik} günden uzun süredir satılmayan stok yok
            </p>
            <p className="text-sm text-emerald-800/80">
              Mevcut stoklar son dönemde hareket görmüş görünüyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Hiç satılmamış", value: totals.hicSatilmamisCount },
    { name: "Uzun süredir bekliyor", value: totals.uzunBekleyenCount },
  ].filter((d) => d.value > 0);

  const degerChart = [...rows]
    .sort((a, b) => b._value - a._value)
    .slice(0, 12)
    .map((r) => ({ name: r.urun, value: r._value }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {DURUM_CARDS.map((bucket) => {
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
          <div className="border-b border-[var(--border)] bg-gradient-to-r from-slate-50/80 to-white px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Ölü Stok Özeti</h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {totals.gunEsik} gün eşiğine göre hareketsiz stoklar
                </p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Ölü stok ürün
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.urunCount}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Stokta bekleyen</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-indigo-800/80">
                <Banknote className="h-3 w-3" />
                Toplam stok değeri
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-indigo-900">
                {formatCurrency(totals.toplamDeger)}
              </p>
              <p className="mt-1 text-xs text-indigo-800/70">Ağırlıklı alım maliyeti</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-amber-800/80">
                <Clock className="h-3 w-3" />
                Ort. bekleme
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-900">
                {totals.ortBekleme > 0 ? `${totals.ortBekleme} gün` : "—"}
              </p>
              <p className="mt-1 text-xs text-amber-800/70">
                Toplam stok: {formatQty(totals.toplamStok)}
              </p>
            </div>
          </CardContent>
        </Card>

        {pieData.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Durum Dağılımı</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                Hiç satılmamış vs uzun süredir bekleyen ürünler
              </p>
              <ExpenseBreakdownPieChart data={pieData} />
            </CardContent>
          </Card>
        )}
      </div>

      {degerChart.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">En Yüksek Ölü Stok Değeri</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              Stok değerine göre sıralı ürünler — tam ürün adları solda
            </p>
            <ProductBarChart data={degerChart} barColor="#64748b" maxItems={15} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
