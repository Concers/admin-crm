import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, Package, Warehouse } from "lucide-react";
import { IncomeExpenseBarChart, ProductBarChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatQty, type StokTableRow, type StokTotals } from "./stok-rows";

const STATUS_CARDS = [
  {
    key: "stokta" as const,
    label: "Stokta",
    hint: "Mevcut stok > 0",
    icon: Package,
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    countKey: "stoktaCount" as const,
  },
  {
    key: "tukendi" as const,
    label: "Tükendi",
    hint: "Stok sıfır",
    icon: Boxes,
    card: "border-amber-100 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-800 ring-amber-200",
    value: "text-amber-900",
    countKey: "tukendiCount" as const,
  },
  {
    key: "eksi" as const,
    label: "Eksi Stok",
    hint: "Satış > stok",
    icon: AlertTriangle,
    card: "border-rose-100 bg-rose-50/70",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    countKey: "eksiCount" as const,
  },
];

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function StokRaporOzet({
  totals,
  rows,
}: {
  totals: StokTotals;
  rows: StokTableRow[];
}) {
  const chartData = [...rows]
    .filter((r) => r._stock > 0)
    .sort((a, b) => b._stock - a._stock)
    .slice(0, 8)
    .map((r) => ({ name: r.urun, value: r._stock }));

  const hareketData = [
    { name: "Toplam Alım", value: totals.totalPurchased },
    { name: "Toplam Satış", value: totals.totalSold },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {STATUS_CARDS.map((bucket) => {
          const Icon = bucket.icon;
          const count = totals[bucket.countKey];
          const share = pct(count, totals.urunCount);
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
                    {count} ürün
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    %{share} · {bucket.hint}
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
                <Warehouse className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">Genel Özet</h2>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  Alım, satış ve mevcut stok hareketleri
                </p>
              </div>
            </div>
          </div>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Kayıtlı Ürün
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{totals.urunCount}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{totals.rafCount} farklı raf</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-blue-800/80">
                <ArrowDownToLine className="h-3 w-3" />
                Toplam Alım
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-blue-900">
                {formatQty(totals.totalPurchased)}
              </p>
              <p className="mt-1 text-xs text-blue-800/70">Giriş hareketleri</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-indigo-800/80">
                <ArrowUpFromLine className="h-3 w-3" />
                Toplam Satış
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-indigo-900">
                {formatQty(totals.totalSold)}
              </p>
              <p className="mt-1 text-xs text-indigo-800/70">Çıkış hareketleri</p>
            </div>
          </CardContent>
        </Card>

        {hareketData.length > 0 && (
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Alım vs Satış</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                Tüm ürünlerde toplam giriş ve çıkış miktarları
              </p>
              <IncomeExpenseBarChart data={hareketData} />
            </CardContent>
          </Card>
        )}
      </div>

      {chartData.length > 0 && (
        <Card className="overflow-hidden border-[var(--border)] shadow-sm">
          <CardContent className="pt-5">
            <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">En Yüksek Stoklu Ürünler</h2>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              Mevcut stok miktarına göre ilk 8 ürün — tam ürün adları solda
            </p>
            <ProductBarChart
              data={chartData}
              maxItems={8}
              barColor="#86a59c"
              valueFormat="qty"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
