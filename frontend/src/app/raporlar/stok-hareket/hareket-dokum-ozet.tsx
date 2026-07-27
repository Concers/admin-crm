import {
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Package,
  Scale,
  Shuffle,
} from "lucide-react";
import type { StockLedger } from "@/lib/api";
import { IncomeExpenseBarChart, TrendLineChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatQty } from "../stok/stok-rows";
import { buildBakiyeTrend, type HareketDokumTotals } from "./hareket-dokum-rows";

const SUMMARY_CARDS = [
  {
    key: "in",
    label: "Toplam Giriş",
    hint: "Alım ve giriş hareketleri",
    icon: ArrowDownLeft,
    card: "border-emerald-100 bg-emerald-50/60",
    iconWrap: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    value: "text-emerald-800",
    getValue: (t: HareketDokumTotals) => t.totalIn,
    asCount: false,
  },
  {
    key: "out",
    label: "Toplam Çıkış",
    hint: "Satış ve çıkış hareketleri",
    icon: ArrowUpRight,
    card: "border-rose-100 bg-rose-50/60",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200",
    value: "text-rose-800",
    getValue: (t: HareketDokumTotals) => t.totalOut,
    asCount: false,
  },
  {
    key: "count",
    label: "Hareket Sayısı",
    hint: "Kayıtlı satır",
    icon: Layers,
    card: "border-blue-100 bg-blue-50/60",
    iconWrap: "bg-blue-100 text-blue-700 ring-blue-200",
    value: "text-blue-900",
    getValue: (t: HareketDokumTotals) => t.hareketCount,
    asCount: true,
  },
] as const;

export function HareketDokumOzet({
  productName,
  unit,
  totals,
  ledger,
}: {
  productName: string;
  unit?: string;
  totals: HareketDokumTotals;
  ledger: StockLedger | null;
}) {
  const trend = buildBakiyeTrend(ledger);
  const hareketData = [
    { name: "Giriş", value: totals.totalIn },
    { name: "Çıkış", value: totals.totalOut },
  ].filter((d) => d.value > 0);

  const balanceTone =
    totals.closingBalance < 0
      ? "text-rose-800"
      : totals.closingBalance === 0
        ? "text-amber-900"
        : "text-emerald-800";

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-[var(--border)] shadow-sm">
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/50 to-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Seçili ürün
                </p>
                <h2 className="text-base font-semibold tracking-tight">{productName}</h2>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Kapanış bakiyesi
              </p>
              <p className={cn("text-xl font-semibold tabular-nums", balanceTone)}>
                {formatQty(totals.closingBalance, unit)}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
          {SUMMARY_CARDS.map((bucket) => {
            const Icon = bucket.icon;
            const raw = bucket.getValue(totals);
            const display = bucket.asCount ? String(raw) : formatQty(raw, unit);
            return (
              <div
                key={bucket.key}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-xl border p-3",
                  bucket.card
                )}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {bucket.label}
                  </p>
                  <p className={cn("mt-1 text-lg font-semibold tabular-nums", bucket.value)}>
                    {display}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{bucket.hint}</p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                    bucket.iconWrap
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {totals.hareketCount > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden border-[var(--border)] shadow-sm">
            <CardContent className="pt-5">
              <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
                <Shuffle className="h-4 w-4 text-[var(--primary)]" />
                Kaynak Dağılımı
              </h3>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                {totals.alimCount} alım · {totals.satisCount} satış · {totals.manualCount} manuel hareket
              </p>
              {hareketData.length > 0 && <IncomeExpenseBarChart data={hareketData} />}
            </CardContent>
          </Card>

          {trend.length > 1 && (
            <Card className="overflow-hidden border-[var(--border)] shadow-sm">
              <CardContent className="pt-5">
                <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
                  <Scale className="h-4 w-4 text-[var(--primary)]" />
                  Yürüyen Bakiye
                </h3>
                <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                  Hareketler sonrası stok seviyesi değişimi
                </p>
                <TrendLineChart data={trend} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
