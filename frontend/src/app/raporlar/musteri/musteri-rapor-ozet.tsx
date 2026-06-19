import { Banknote, CreditCard, Receipt, ShoppingCart, Users, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { formatQty } from "../stok/stok-rows";
import type { MusteriRaporTotals } from "./musteri-rows";

export function MusteriRaporOzet({
  customerName,
  totals,
  allCustomers,
}: {
  customerName?: string;
  totals: MusteriRaporTotals;
  allCustomers?: boolean;
}) {
  const alacakTone =
    totals.receivable > 0
      ? "text-rose-800"
      : totals.receivable < 0
        ? "text-emerald-800"
        : "text-[var(--foreground)]";

  return (
    <Card className="overflow-hidden border-[var(--border)] shadow-sm">
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/50 to-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                {allCustomers ? "Tüm müşteriler" : "Seçili cari"}
              </p>
              <h2 className="text-base font-semibold tracking-tight">{customerName ?? "Genel özet"}</h2>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Kalan bakiye
            </p>
            <p className={cn("text-xl font-semibold tabular-nums", alacakTone)}>
              {formatCurrency(totals.receivable)}
            </p>
          </div>
        </div>
      </div>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-800/80">
            <ShoppingCart className="h-3 w-3" />
            Satış toplam tutarı
          </p>
          <p className="mt-0.5 text-[10px] text-blue-800/60">KDV hariç</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-blue-900">
            {formatCurrency(totals.saleTotal)}
          </p>
          <p className="mt-0.5 text-[11px] text-blue-800/70">
            {totals.saleCount} satış · {formatQty(totals.totalQty)} adet
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-800/80">
            <Receipt className="h-3 w-3" />
            KDV&apos;li toplam tutar
          </p>
          <p className="mt-0.5 text-[10px] text-indigo-800/60">Satışların KDV dahil toplamı</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-indigo-900">
            {formatCurrency(totals.vatIncludedTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-900/80">
            <Wallet className="h-3 w-3" />
            Peşin ödenen
          </p>
          <p className="mt-0.5 text-[10px] text-amber-900/60">Satış kayıtlarındaki peşin</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-amber-950">
            {formatCurrency(totals.upfront)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-800/80">
            <CreditCard className="h-3 w-3" />
            Tahsilat toplamı
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-800/60">Müşteri tahsilat kayıtları</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-900">
            {formatCurrency(totals.collected)}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-800/70">{totals.collectionCount} tahsilat</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3 sm:col-span-2 xl:col-span-2">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            <Banknote className="h-3 w-3" />
            Kalan bakiye (alacak)
          </p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums", alacakTone)}>
            {formatCurrency(totals.receivable)}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
            KDV&apos;li toplam − peşin − tahsilat
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
