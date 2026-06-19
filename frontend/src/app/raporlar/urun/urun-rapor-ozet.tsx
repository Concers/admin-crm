import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Package,
  Percent,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { IncomeExpenseBarChart, TrendLineChart } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { formatQty } from "../stok/stok-rows";
import type { TrendDatum, UrunRaporTotals } from "./urun-rapor-rows";

export function UrunRaporOzet({
  productName,
  totals,
  aylikTrend,
  allProducts,
}: {
  productName?: string;
  totals: UrunRaporTotals;
  aylikTrend: TrendDatum[];
  allProducts?: boolean;
}) {
  const profitTone =
    totals.profit > 0 ? "text-emerald-800" : totals.profit < 0 ? "text-rose-800" : "text-amber-900";

  const compareData = [
    { name: "Satış", value: totals.saleAmount },
    { name: "Alım", value: totals.purchaseAmount },
    ...(totals.expenseAmount > 0 ? [{ name: "Diğer maliyet", value: totals.expenseAmount }] : []),
  ].filter((d) => d.value > 0);

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
                  {allProducts ? "Tüm ürünler" : "Seçili ürün"}
                </p>
                <h2 className="text-base font-semibold tracking-tight">
                  {productName ?? "Genel özet"}
                </h2>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Kâr / Zarar
              </p>
              <p className={cn("text-xl font-semibold tabular-nums", profitTone)}>
                {formatCurrency(totals.profit)}
              </p>
              {totals.saleAmount > 0 && (
                <p className="text-[11px] text-[var(--muted-foreground)]">Marj %{totals.marginPct}</p>
              )}
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-800/80">
              <TrendingUp className="h-3 w-3" />
              Ürün satış tutarı
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-800/60">KDV hariç</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-800">
              {formatCurrency(totals.saleAmount)}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-800/70">
              {totals.salesCount} işlem · {formatQty(totals.totalSaleQty)} adet
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-800/80">
              <ArrowDownToLine className="h-3 w-3" />
              Ürün alım tutarı
            </p>
            <p className="mt-0.5 text-[10px] text-blue-800/60">KDV hariç</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-blue-900">
              {formatCurrency(totals.purchaseAmount)}
            </p>
            <p className="mt-0.5 text-[11px] text-blue-800/70">
              {totals.purchaseCount} işlem · {formatQty(totals.totalPurchaseQty)} adet
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-900/80">
              <Receipt className="h-3 w-3" />
              Diğer maliyetler
            </p>
            <p className="mt-0.5 text-[10px] text-amber-900/60">Ürün giderleri</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-amber-950">
              {formatCurrency(totals.expenseAmount)}
            </p>
            <p className="mt-0.5 text-[11px] text-amber-900/70">{totals.expenseCount} gider kaydı</p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-800/80">
              <ArrowUpFromLine className="h-3 w-3" />
              KDV dahil satış
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-indigo-900">
              {formatCurrency(totals.vatIncludedSales)}
            </p>
            <p className="mt-0.5 text-[11px] text-indigo-800/70">Fatura tutarları toplamı</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              <Percent className="h-3 w-3" />
              Kâr marjı
            </p>
            <p className={cn("mt-1 text-lg font-semibold tabular-nums", profitTone)}>
              {totals.saleAmount > 0 ? `%${totals.marginPct}` : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">Satış − alım − gider</p>
          </div>
        </CardContent>
      </Card>

      {(compareData.length > 0 || aylikTrend.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {compareData.length > 0 && (
            <Card className="overflow-hidden border-[var(--border)] shadow-sm">
              <CardContent className="pt-5">
                <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
                  <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
                  Satış vs Maliyet
                </h3>
                <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                  Excel &quot;Ürün Raporu&quot; özeti — KDV hariç
                </p>
                <IncomeExpenseBarChart data={compareData} />
              </CardContent>
            </Card>
          )}
          {aylikTrend.length > 0 && (
            <Card className="overflow-hidden border-[var(--border)] shadow-sm">
              <CardContent className="pt-5">
                <h3 className="mb-1 text-sm font-semibold">Aylık Satış Trendi</h3>
                <p className="mb-4 text-xs text-[var(--muted-foreground)]">KDV dahil satış tutarları</p>
                <TrendLineChart data={aylikTrend} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
