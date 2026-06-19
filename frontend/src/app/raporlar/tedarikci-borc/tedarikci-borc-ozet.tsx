import { ArrowDownToLine, Banknote, Receipt, Truck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { TedarikciBorcOzet } from "./tedarikci-borc-rows";

export function TedarikciBorcOzet({ ozet }: { ozet: TedarikciBorcOzet }) {
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
                Borçlu cariler
              </p>
              <h2 className="text-base font-semibold tracking-tight">{ozet.cariSayisi} tedarikçi / cari</h2>
            </div>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/70">
              Toplam net borç
            </p>
            <p className="text-xl font-semibold tabular-nums text-rose-900">
              {formatCurrency(ozet.toplamBorc)}
            </p>
          </div>
        </div>
      </div>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-800/80">
            <ArrowDownToLine className="h-3 w-3" />
            Toplam mal alımı
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-blue-900">
            {formatCurrency(ozet.toplamAlim)}
          </p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-violet-800/80">
            <Receipt className="h-3 w-3" />
            Toplam diğer gider
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-violet-900">
            {formatCurrency(ozet.toplamGider)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3">
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            <Banknote className="h-3 w-3" />
            Borçlu cari
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{ozet.cariSayisi}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <Users className="h-3 w-3" />
            Net borçlu olanlar
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
