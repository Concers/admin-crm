import Link from "next/link";
import {
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard, InfoBanner, PanelCard } from "@/components/ui/stat-card";
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

  return (
    <PageShell
      title="Genel Bakış"
      description="Satış, gider ve stok özetiniz"
    >
      <InfoBanner title="Hızlı başlangıç" accent="blue">
        <Link href="/rehber" className="font-medium underline-offset-2 hover:underline">
          Başlangıç Rehberi
        </Link>
        {" "}— hangi işlemin nerede yapıldığını adım adım öğrenin.
      </InfoBanner>

      <div data-tour="stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Toplam Satış"
          value={fc(stats.totalSale)}
          icon={TrendingUp}
          accent="emerald"
          subtext="KDV dahil"
        />
        <StatCard
          label="Toplam Gider"
          value={fc(stats.totalExpense)}
          icon={Receipt}
          accent="rose"
        />
        <StatCard
          label="Toplam Alım"
          value={fc(stats.totalPurchase)}
          icon={ShoppingCart}
          accent="amber"
          subtext="KDV dahil"
        />
        <StatCard
          label="Ürün / Tedarikçi"
          value={`${stats.productCount} / ${stats.partnerCount}`}
          icon={Wallet}
          accent="indigo"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/gider-girisi", label: "Gider Ekle", icon: Receipt },
          { href: "/urun-satis", label: "Satış Ekle", icon: TrendingUp },
          { href: "/urun-alim", label: "Alım Ekle", icon: ShoppingCart },
          { href: "/tanimlama", label: "Tanımlama", icon: Package },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
            >
              <Icon className="h-4 w-4 text-[var(--primary)]" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div data-tour="chart">
        <PanelCard
          icon={TrendingUp}
          title="Satış / Alım / Gider"
          description="Finansal hareketlerin karşılaştırmalı özeti"
          accent="blue"
        >
          <IncomeExpenseBarChart data={ozetGrafik} />
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)]/30 px-5 py-4">
              <h3 className="font-semibold">Son Giderler</h3>
              <Link
                href="/gider-girisi"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Tümü →
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {sonGiderler.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">
                  Henüz gider kaydı yok
                </p>
              ) : (
                sonGiderler.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--muted)]/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{g.category}</p>
                      <p className="truncate text-sm text-[var(--muted-foreground)]">
                        {formatDate(g.date)} ·{" "}
                        {g.scope === "PRODUCT"
                          ? g.product?.name
                          : (g.partner?.name ?? g.scope)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums text-red-600">
                      <ArrowDownRight className="h-4 w-4" />
                      {formatCurrency(g.paidAmount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)]/30 px-5 py-4">
              <h3 className="font-semibold">Son Satışlar</h3>
              <Link
                href="/urun-satis"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Tümü →
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {sonSatislar.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">
                  Henüz satış kaydı yok
                </p>
              ) : (
                sonSatislar.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--muted)]/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.product.name}</p>
                      <p className="truncate text-sm text-[var(--muted-foreground)]">
                        {s.customer.name} · {formatDate(s.date)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" />
                      {formatCurrency(s.vatIncludedAmount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
