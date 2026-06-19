import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  ChevronRight,
  CreditCard,
  PieChart,
  Receipt,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { DashboardTile } from "@/components/dashboard/dashboard-tile";
import {
  AgingStackBar,
  CashFlowInOutBarChart,
  ExpenseBreakdownPieChart,
  ProductBarChart,
  RevenueExpenseAreaChart,
  type ComboTrendDatum,
} from "@/components/charts";
import type { DashboardStats } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { formatCurrency as fc } from "@/lib/calculations";
import { DashboardPeriodSecici } from "./dashboard-period-secici";

function kpiTrend(changePct: number | null) {
  if (changePct === null) return undefined;
  return { value: changePct, label: "önceki aya göre" };
}

export function DashboardView({ stats }: { stats: DashboardStats }) {
  const { kpis, monthlyTrend } = stats;

  const comboTrend: ComboTrendDatum[] = monthlyTrend.map((m) => ({
    label: m.label,
    gelir: m.sales,
    gider: m.expenses,
    kar: m.profit,
  }));

  const cashData = monthlyTrend.map((m) => ({
    name: m.label,
    giris: m.collections,
    cikis: m.payments,
  }));

  const agingData = [
    { name: "0–30 gün", value: stats.agingBuckets.d0_30 },
    { name: "31–60 gün", value: stats.agingBuckets.d31_60 },
    { name: "61–90 gün", value: stats.agingBuckets.d61_90 },
    { name: "90+ gün", value: stats.agingBuckets.d90plus },
  ];

  const salesSpark = monthlyTrend.map((m) => ({ label: m.label, value: m.sales }));
  const profitSpark = monthlyTrend.map((m) => ({ label: m.label, value: m.profit }));
  const expenseSpark = monthlyTrend.map((m) => ({ label: m.label, value: m.expenses }));

  const updatedAt = new Date(stats.generatedAt).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const netPosition = kpis.receivable - kpis.payable;
  const marginPct =
    kpis.sales.value > 0 ? (kpis.profit.value / kpis.sales.value) * 100 : null;

  const maxReceivable = Math.max(...stats.topReceivables.map((r) => r.amount), 1);
  const maxPayable = Math.max(...stats.topPayables.map((r) => r.amount), 1);

  return (
    <div className="dashboard-canvas -mx-1 space-y-6 px-1 pb-2 sm:space-y-7">
      {/* Hero */}
      <section className="dashboard-hero relative overflow-hidden rounded-2xl text-white shadow-lg">
        <div className="dashboard-hero-glow pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              İş Zekası Panosu
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Genel Bakış</h2>
              <p className="mt-1 max-w-lg text-sm text-white/70">
                Son {stats.months} ayın finansal nabzı — satış, nakit, alacak ve stok tek ekranda.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/raporlar/nakit-akis", label: "Nakit Akış" },
                { href: "/raporlar/musteri-alacak", label: "Alacaklar" },
                { href: "/raporlar/gelir-gider", label: "Gelir-Gider" },
                { href: "/raporlar/stok", label: "Stok" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {l.label}
                  <ChevronRight className="h-3 w-3 opacity-70" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <DashboardPeriodSecici selected={stats.months as 3 | 6 | 9 | 12} variant="hero" />
            <p className="text-[11px] text-white/50">Güncellendi {updatedAt}</p>
            <div className="grid w-full grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
              {[
                { label: "Bu ay kâr", value: fc(kpis.profit.value) },
                {
                  label: "Net pozisyon",
                  value: fc(netPosition),
                  hint: netPosition >= 0 ? "alacaklı" : "borçlu",
                },
                {
                  label: "Kâr marjı",
                  value: marginPct !== null ? `%${marginPct.toFixed(1)}` : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/55">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums sm:text-base">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {kpis.lowStockCount > 0 && (
        <Link
          href="/raporlar/dusuk-stok"
          className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-3.5 text-sm text-amber-950 shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <strong>{kpis.lowStockCount} ürün</strong> minimum stok altında — hemen kontrol edin.
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" />
        </Link>
      )}

      {/* KPI bento */}
      <div
        data-tour="stats"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DashboardKpiCard
          label="Bu Ay Satış"
          value={fc(kpis.sales.value)}
          icon={TrendingUp}
          accent="emerald"
          trend={kpiTrend(kpis.sales.changePct)}
          sparkline={salesSpark}
          featured
        />
        <DashboardKpiCard
          label="Bu Ay Kâr"
          value={fc(kpis.profit.value)}
          icon={BarChart3}
          accent="plum"
          trend={kpiTrend(kpis.profit.changePct)}
          sparkline={profitSpark}
          featured
        />
        <DashboardKpiCard
          label="Bu Ay Gider"
          value={fc(kpis.expenses.value)}
          icon={Receipt}
          accent="rose"
          trend={kpiTrend(kpis.expenses.changePct)}
          sparkline={expenseSpark}
        />
        <DashboardKpiCard
          label="Bu Ay Alım"
          value={fc(kpis.purchases.value)}
          icon={ShoppingCart}
          accent="amber"
          trend={kpiTrend(kpis.purchases.changePct)}
        />
        <DashboardKpiCard
          label="Toplam Alacak"
          value={fc(kpis.receivable)}
          icon={Wallet}
          accent="blue"
          subtext="Açık müşteri bakiyesi"
        />
        <DashboardKpiCard
          label="Toplam Borç"
          value={fc(kpis.payable)}
          icon={CreditCard}
          accent="rose"
          subtext="Açık tedarikçi bakiyesi"
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
        <div className="xl:col-span-8" data-tour="chart">
          <DashboardTile
            icon={TrendingUp}
            title="Gelir & Gider Trendi"
            description={`Aylık satış, gider ve kâr — son ${stats.months} ay`}
            accent="emerald"
          >
            <RevenueExpenseAreaChart data={comboTrend} />
          </DashboardTile>
        </div>

        <div className="xl:col-span-4">
          <DashboardTile
            icon={PieChart}
            title="Gider Dağılımı"
            description="Kategori bazlı pay"
            accent="rose"
          >
            {stats.expenseBreakdown.length > 0 ? (
              <ExpenseBreakdownPieChart
                data={stats.expenseBreakdown.map((e) => ({ name: e.name, value: e.amount }))}
              />
            ) : (
              <EmptyChart message="Bu dönemde gider kaydı yok." />
            )}
          </DashboardTile>
        </div>

        <div className="xl:col-span-7">
          <DashboardTile
            icon={Wallet}
            title="Nakit Hareketi"
            description="Gerçekleşen tahsilat ve ödemeler"
            accent="blue"
          >
            <CashFlowInOutBarChart data={cashData} />
          </DashboardTile>
        </div>

        <div className="xl:col-span-5">
          <DashboardTile
            icon={Users}
            title="Alacak Durumu"
            description="Vade dağılımı"
            accent="indigo"
            headerExtra={
              <Link
                href="/raporlar/aging"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                Detay →
              </Link>
            }
          >
            <AgingStackBar data={agingData} />
          </DashboardTile>
        </div>

        <div className="xl:col-span-6">
          <DashboardTile
            icon={Boxes}
            title="En Çok Satan Ürünler"
            description={`Satış tutarı — son ${stats.months} ay`}
            accent="emerald"
          >
            {stats.topProducts.length > 0 ? (
              <ProductBarChart
                data={stats.topProducts.map((p) => ({ name: p.name, value: p.amount }))}
                barColor="#86a59c"
                maxItems={6}
              />
            ) : (
              <EmptyChart message="Satış kaydı bulunamadı." />
            )}
          </DashboardTile>
        </div>

        <div className="xl:col-span-6">
          <DashboardTile icon={BarChart3} title="Kümülatif Hacim" description="Tüm zamanlar" accent="amber">
            <CumulativeBars
              items={[
                { label: "Satış", value: stats.totalSale, pct: 100, color: "bg-emerald-500" },
                {
                  label: "Alım",
                  value: stats.totalPurchase,
                  pct: stats.totalSale > 0 ? (stats.totalPurchase / stats.totalSale) * 100 : 0,
                  color: "bg-amber-400",
                },
                {
                  label: "Gider",
                  value: stats.totalExpense,
                  pct: stats.totalSale > 0 ? (stats.totalExpense / stats.totalSale) * 100 : 0,
                  color: "bg-rose-400",
                },
              ]}
            />
            <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
              {stats.productCount} ürün · {stats.partnerCount} cari
            </p>
          </DashboardTile>
        </div>
      </div>

      {/* Sıralamalar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <RankList
          title="En Yüksek Alacaklar"
          href="/raporlar/musteri-alacak"
          rows={stats.topReceivables}
          max={maxReceivable}
          tone="emerald"
        />
        <RankList
          title="En Yüksek Borçlar"
          href="/raporlar/tedarikci-borc"
          rows={stats.topPayables}
          max={maxPayable}
          tone="rose"
        />
        <SideList
          title="Düşük Stok"
          href="/raporlar/dusuk-stok"
          empty="Kritik stok yok"
          items={stats.lowStock.map((i) => ({
            key: i.product,
            primary: i.product,
            secondary: `Min ${i.minStock} ${i.unit}`,
            value: `${i.stock}`,
            warn: true,
          }))}
        />
      </div>

      {/* Son işlemler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <ActivityFeed
          title="Son Satışlar"
          href="/urun-satis"
          empty="Henüz satış yok"
          tone="emerald"
          rows={stats.recentSales.map((s) => ({
            id: s.id,
            primary: s.product.name,
            secondary: s.customer.name,
            amount: s.vatIncludedAmount,
          }))}
        />
        <ActivityFeed
          title="Son Giderler"
          href="/gider-girisi"
          empty="Henüz gider yok"
          tone="rose"
          rows={stats.recentExpenses.map((g) => ({
            id: g.id,
            primary: g.category,
            secondary:
              g.scope === "PRODUCT" ? (g.product?.name ?? "") : (g.partner?.name ?? g.scope),
            amount: g.paidAmount,
          }))}
        />
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 py-14 text-center">
      <BarChart3 className="mb-2 h-8 w-8 text-[var(--muted-foreground)]/40" />
      <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
    </div>
  );
}

function CumulativeBars({
  items,
}: {
  items: { label: string; value: number; pct: number; color: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">{item.label}</span>
            <span className="text-sm font-bold tabular-nums">{fc(item.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className={`h-full rounded-full ${item.color} transition-all duration-700`}
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankList({
  title,
  href,
  rows,
  max,
  tone,
}: {
  title: string;
  href: string;
  rows: { name: string; amount: number }[];
  max: number;
  tone: "emerald" | "rose";
}) {
  const bar = tone === "emerald" ? "bg-emerald-500" : "bg-rose-500";
  const text = tone === "emerald" ? "text-emerald-700" : "text-rose-700";

  return (
    <div className="dashboard-tile overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex items-center justify-between border-b border-[var(--border)]/60 px-4 py-3.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Link href={href} className="text-xs font-medium text-[var(--primary)] hover:underline">
          Tümü →
        </Link>
      </div>
      <div className="divide-y divide-[var(--border)]/60 p-2">
        {rows.length === 0 ? (
          <p className="p-4 text-center text-sm text-[var(--muted-foreground)]">Kayıt yok.</p>
        ) : (
          rows.map((r, i) => (
            <div key={r.name} className="rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--muted)]/40">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-[10px] font-bold text-[var(--primary)]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
                <span className={`shrink-0 text-sm font-semibold tabular-nums ${text}`}>
                  {formatCurrency(r.amount)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className={`h-full rounded-full ${bar}`}
                  style={{ width: `${(r.amount / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SideList({
  title,
  href,
  empty,
  items,
}: {
  title: string;
  href: string;
  empty: string;
  items: { key: string; primary: string; secondary: string; value: string; warn?: boolean }[];
}) {
  return (
    <div className="dashboard-tile overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex items-center justify-between border-b border-[var(--border)]/60 px-4 py-3.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Link href={href} className="text-xs font-medium text-[var(--primary)] hover:underline">
          Rapor →
        </Link>
      </div>
      <div className="divide-y divide-[var(--border)]/60">
        {items.length === 0 ? (
          <p className="p-5 text-center text-sm text-[var(--muted-foreground)]">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.primary}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.secondary}</p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${item.warn ? "text-rose-600" : ""}`}
              >
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActivityFeed({
  title,
  href,
  empty,
  tone,
  rows,
}: {
  title: string;
  href: string;
  empty: string;
  tone: "emerald" | "rose";
  rows: { id: number; primary: string; secondary: string; amount: number }[];
}) {
  const dot = tone === "emerald" ? "bg-emerald-500" : "bg-rose-500";
  const amountClass = tone === "emerald" ? "text-emerald-700" : "text-rose-700";
  const Icon = tone === "emerald" ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="dashboard-tile overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex items-center justify-between border-b border-[var(--border)]/60 px-5 py-4">
        <h3 className="font-semibold">{title}</h3>
        <Link href={href} className="text-sm font-medium text-[var(--primary)] hover:underline">
          Tümü →
        </Link>
      </div>
      <div className="p-2">
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">{empty}</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--muted)]/50"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.primary}</p>
                <p className="truncate text-xs text-[var(--muted-foreground)]">{r.secondary}</p>
              </div>
              <span className={`flex shrink-0 items-center gap-0.5 text-sm font-semibold tabular-nums ${amountClass}`}>
                <Icon className="h-3.5 w-3.5" />
                {formatCurrency(r.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
