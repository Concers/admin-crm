import { Banknote, CreditCard, ShoppingCart, Users, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { MusteriAlacakOzet } from "./musteri-alacak-rows";

export function MusteriAlacakOzet({ ozet }: { ozet: MusteriAlacakOzet }) {
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
                Alacaklı cariler
              </p>
              <h2 className="text-base font-semibold tracking-tight">{ozet.cariSayisi} müşteri / cari</h2>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/70">
              Toplam net alacak
            </p>
            <p className="text-xl font-semibold tabular-nums text-emerald-900">
              {formatCurrency(ozet.toplamAlacak)}
            </p>
          </div>
        </div>
      </div>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-800/80">
            <ShoppingCart className="h-3 w-3" />
            Toplam satış
          </p>
          <p className="mt-0.5 text-[10px] text-blue-800/60">KDV dahil</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-blue-900">
            {formatCurrency(ozet.toplamSatis)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-800/80">
            <CreditCard className="h-3 w-3" />
            Toplam tahsilat
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-900">
            {formatCurrency(ozet.toplamTahsilat)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            <Banknote className="h-3 w-3" />
            Alacaklı cari
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{ozet.cariSayisi}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <Wallet className="h-3 w-3" />
            Net alacaklı olanlar
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
