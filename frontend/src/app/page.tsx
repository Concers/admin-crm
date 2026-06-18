import Link from "next/link";
import {
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { IncomeExpenseBarChart } from "@/components/charts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatCurrency as fc } from "@/lib/calculations";
import { getDashboard } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboard();
  const sonGiderler = stats.recentExpenses;
  const sonSatislar = stats.recentSales;

  const ozetGrafik = [
    { name: "Satış", value: stats.totalSale },
    { name: "Alım", value: stats.totalPurchase },
    { name: "Gider", value: stats.totalExpense },
  ];

  const cards = [
    { label: "Toplam Satış (KDV Dahil)", value: fc(stats.totalSale), icon: TrendingUp, up: true },
    { label: "Toplam Gider", value: fc(stats.totalExpense), icon: Receipt, up: false },
    { label: "Toplam Alım (KDV Dahil)", value: fc(stats.totalPurchase), icon: ShoppingCart, up: false },
    { label: "Ürün / Tedarikçi", value: `${stats.productCount} / ${stats.partnerCount}`, icon: Wallet, up: null },
  ];

  return (
    <PageShell title="Genel Bakış">
      <Link
        href="/rehber"
        className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm transition-colors hover:bg-[var(--muted)]"
      >
        <span>
          <strong>Sisteme yeni mi başladınız?</strong> Hangi işlemin nasıl yapıldığını adım adım anlatan Başlangıç Rehberi&apos;ne göz atın.
        </span>
        <span className="ml-4 shrink-0 font-medium text-[var(--primary)]">Rehberi Aç →</span>
      </Link>
      <div data-tour="stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">{c.label}</p>
                  <p className="mt-1 text-xl font-semibold">{c.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card data-tour="chart">
        <CardContent className="p-0">
          <div className="border-b border-[var(--border)] p-5">
            <h3 className="font-semibold">Satış / Alım / Gider Karşılaştırması</h3>
          </div>
          <div className="p-5">
            <IncomeExpenseBarChart data={ozetGrafik} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <h3 className="font-semibold">Son Giderler</h3>
              <Link href="/gider-girisi" className="text-sm text-[var(--primary)] hover:underline">
                Tümü
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {sonGiderler.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{g.category}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatDate(new Date(g.date))} · {g.scope === "PRODUCT" ? g.product?.name : g.partner?.name ?? g.scope}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-red-600">
                    <ArrowDownRight className="h-4 w-4" />
                    {formatCurrency(g.paidAmount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <h3 className="font-semibold">Son Satışlar</h3>
              <Link href="/urun-satis" className="text-sm text-[var(--primary)] hover:underline">
                Tümü
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {sonSatislar.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{s.product.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {s.customer.name} · {formatDate(new Date(s.date))}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    {formatCurrency(s.vatIncludedAmount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
