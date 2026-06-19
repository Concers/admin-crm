import { ArrowDownToLine, Banknote, CreditCard, Receipt, Truck, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { formatQty } from "../stok/stok-rows";
import type { TedarikciRaporTotals } from "./tedarikci-rows";

export function TedarikciRaporOzet({
  supplierName,
  totals,
  allSuppliers,
}: {
  supplierName?: string;
  totals: TedarikciRaporTotals;
  allSuppliers?: boolean;
}) {
  const debtTone =
    totals.debt > 0 ? "text-rose-800" : totals.debt < 0 ? "text-emerald-800" : "text-[var(--foreground)]";

  return (
    <Card className="overflow-hidden border-[var(--border)] shadow-sm">
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/50 to-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                {allSuppliers ? "Tüm tedarikçiler" : "Seçili cari"}
              </p>
              <h2 className="text-base font-semibold tracking-tight">{supplierName ?? "Genel özet"}</h2>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Kalan bakiye
            </p>
            <p className={cn("text-xl font-semibold tabular-nums", debtTone)}>
              {formatCurrency(totals.debt)}
            </p>
          </div>
        </div>
      </div>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-800/80">
            <ArrowDownToLine className="h-3 w-3" />
            Mal alımı tutarı
          </p>
          <p className="mt-0.5 text-[10px] text-blue-800/60">KDV dahil</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-blue-900">
            {formatCurrency(totals.purchaseTotal)}
          </p>
          <p className="mt-0.5 text-[11px] text-blue-800/70">
            {totals.purchaseCount} alım · {formatQty(totals.totalQty)} adet
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-900/80">
            <Wallet className="h-3 w-3" />
            Mal alımı peşin ödemeler
          </p>
          <p className="mt-0.5 text-[10px] text-amber-900/60">Alım kayıtlarındaki peşin</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-amber-950">
            {formatCurrency(totals.upfront)}
          </p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-violet-800/80">
            <Receipt className="h-3 w-3" />
            Diğer giderler
          </p>
          <p className="mt-0.5 text-[10px] text-violet-800/60">Bu tedarikçiye bağlı giderler</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-violet-900">
            {formatCurrency(totals.expenseTotal)}
          </p>
          <p className="mt-0.5 text-[11px] text-violet-800/70">{totals.expenseCount} gider kaydı</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-800/80">
            <Wallet className="h-3 w-3" />
            Diğer giderler peşin ödemeleri
          </p>
          <p className="mt-0.5 text-[10px] text-indigo-800/60">Gider kayıtlarındaki peşin</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-indigo-900">
            {formatCurrency(totals.expenseUpfront)}
          </p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-rose-800/80">
            <CreditCard className="h-3 w-3" />
            Yapılan ödemeler
          </p>
          <p className="mt-0.5 text-[10px] text-rose-800/60">Tedarikçi ödeme kayıtları</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-rose-900">
            {formatCurrency(totals.paid)}
          </p>
          <p className="mt-0.5 text-[11px] text-rose-800/70">{totals.paymentCount} ödeme</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            <Banknote className="h-3 w-3" />
            Kalan bakiye
          </p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums", debtTone)}>
            {formatCurrency(totals.debt)}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
            Alım − peşin + gider − gider peşin − ödeme
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
