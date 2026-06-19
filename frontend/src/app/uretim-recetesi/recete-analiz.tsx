"use client";

// =============================================================================
// Üretim reçetesi maliyet & tüketim panosu — modern dashboard (Data Spot tarzı)
//
// Yuvarlatılmış kartlar, sparkline'lı KPI'lar, merkez toplamlı donut ve
// birbirine bağlı (cross-filter) görseller. Üç görünüm:
//   • Genel        — tüm reçeteler / bileşenler
//   • Reçete       — bir mamulün (reçetenin) bileşen maliyet kırılımı
//   • Bileşen      — bir hammaddenin hangi ürünlerde kullanıldığı (ters arama)
// =============================================================================

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  Boxes,
  ChevronRight,
  Coins,
  Factory,
  Layers,
  Package,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReceteAnaliz, RecipeAnalysis, ComponentUsage } from "./analiz-data";

// Canlı ama uyumlu palet (referans dashboard tonları).
const PALETTE = ["#3b82f6", "#22c55e", "#f59e0b", "#14b8a6", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const tlFull = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const tlFine = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const numFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
const money = (v: number) => tlFull.format(v);
const moneyFine = (v: number) => tlFine.format(v);
const qty = (v: number) => numFmt.format(v);

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
} as const;
const axisStyle = { fontSize: 11, fill: "var(--muted-foreground)" } as const;

type Focus = { type: "all" } | { type: "recipe"; id: number } | { type: "component"; id: number };

export function ReceteAnalizPano({ analiz }: { analiz: ReceteAnaliz }) {
  const { recipes, components, totals } = analiz;
  const [focus, setFocus] = useState<Focus>({ type: "all" });

  const selectedRecipe = useMemo(
    () => (focus.type === "recipe" ? recipes.find((r) => r.id === focus.id) ?? null : null),
    [focus, recipes],
  );
  const selectedComponent = useMemo(
    () => (focus.type === "component" ? components.find((c) => c.componentProductId === focus.id) ?? null : null),
    [focus, components],
  );

  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-4 text-sm text-amber-900">
        Henüz reçete kaydı yok. Yukarıdan reçete ekleyip bileşenlerin alımlarını girdikçe maliyet
        analizi burada görüntülenecek.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI kartları (sparkline'lı) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Toplam Birim Maliyet"
          value={money(totals.totalUnitCost)}
          sub={`${totals.recipeCount} reçete · ${totals.activeCount} aktif`}
          color="#3b82f6"
          series={recipes.map((r) => r.unitCost)}
        />
        <KpiCard
          label="Ort. Reçete Maliyeti"
          value={money(totals.avgUnitCost)}
          sub="birim mamul başına"
          color="#22c55e"
          series={recipes.map((r) => r.unitCost)}
        />
        <KpiCard
          label="Fiili Tüketim Maliyeti"
          value={money(totals.totalConsumedCost)}
          sub="tamamlanan üretimden"
          color="#f59e0b"
          series={recipes.map((r) => r.producedCost)}
        />
        <KpiCard
          label="Planlanan Tüketim"
          value={money(totals.totalPlannedCost)}
          sub="planlı + süren emirler"
          color="#14b8a6"
          series={recipes.map((r) => r.plannedCost)}
        />
      </div>

      {totals.unpricedComponents > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
          {totals.unpricedComponents} bileşenin satın alma geçmişi olmadığından birim maliyeti{" "}
          <strong>0 ₺</strong> kabul edildi. Alımlarını girdikçe reçete maliyetleri netleşir.
        </div>
      )}

      {/* Breadcrumb / slicer */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setFocus({ type: "all" })}
          className={cn(
            "rounded-full px-3 py-1 font-medium transition-colors",
            focus.type === "all"
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          )}
        >
          Genel Bakış
        </button>
        {selectedRecipe && (
          <>
            <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 ring-1 ring-blue-100">
              {selectedRecipe.mamul}
            </span>
          </>
        )}
        {selectedComponent && (
          <>
            <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 ring-1 ring-violet-100">
              {selectedComponent.name}
            </span>
          </>
        )}
      </div>

      {selectedRecipe ? (
        <RecipeDetail recipe={selectedRecipe} onComponentClick={(id) => setFocus({ type: "component", id })} />
      ) : selectedComponent ? (
        <ComponentDetail
          comp={selectedComponent}
          onRecipeClick={(id) => setFocus({ type: "recipe", id })}
          onBack={() => setFocus({ type: "all" })}
        />
      ) : (
        <Overview
          recipes={recipes}
          components={components}
          onSelectRecipe={(id) => setFocus({ type: "recipe", id })}
          onSelectComponent={(id) => setFocus({ type: "component", id })}
        />
      )}
    </div>
  );
}

// --- Yapı taşları ------------------------------------------------------------

function Panel({
  title,
  desc,
  children,
  className,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm", className)}>
      <div className="mb-4">
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        {desc && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
  series,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  series: number[];
}) {
  const data = (series.length ? series : [0, 0]).map((v, i) => ({ i, v }));
  const gid = `spark-${label.replace(/\W/g, "")}`;
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <div className="px-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <TrendingUp className="h-3 w-3" style={{ color }} />
          {sub}
        </p>
      </div>
      <div className="mt-2 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gid})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Donut({
  data,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => moneyFine(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">{centerLabel}</span>
          <span className="text-lg font-semibold tabular-nums">{centerValue}</span>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-[var(--muted-foreground)]">
              %{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Genel bakış -------------------------------------------------------------

function Overview({
  recipes,
  components,
  onSelectRecipe,
  onSelectComponent,
}: {
  recipes: RecipeAnalysis[];
  components: ComponentUsage[];
  onSelectRecipe: (id: number) => void;
  onSelectComponent: (id: number) => void;
}) {
  const costPerRecipe = recipes.slice(0, 10).map((r) => ({ recipeId: r.id, name: r.mamul, value: r.unitCost }));

  const componentSpend = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of recipes) for (const l of r.lines) m.set(l.name, (m.get(l.name) ?? 0) + l.lineCost);
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [recipes]);
  const spendTop = componentSpend.slice(0, 6);
  const spendTotal = componentSpend.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Reçete Başına Birim Maliyet"
          desc="Mamule tıklayın — bileşen kırılımına geçin"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costPerRecipe} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axisStyle} tickFormatter={(v: number) => tlFull.format(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axisStyle} width={140} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => moneyFine(Number(v))} cursor={{ fill: "var(--accent)" }} />
              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                cursor="pointer"
                onClick={(d) => {
                  const id = (d as { payload?: { recipeId?: number } })?.payload?.recipeId;
                  if (id != null) onSelectRecipe(id);
                }}
              >
                {costPerRecipe.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Bileşen Maliyet Dağılımı" desc="Tüm reçetelerde toplam maliyet payı">
          <Donut data={spendTop} centerLabel="Toplam" centerValue={money(spendTotal)} />
        </Panel>
      </div>

      <Panel
        title="Bileşen Tüketim Tablosu"
        desc="Satıra tıklayın — bileşenin hangi ürünlerde kullanıldığını görün"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th className="py-2 pr-3 font-medium">Bileşen</th>
                <th className="py-2 px-3 text-right font-medium">Birim Maliyet</th>
                <th className="py-2 px-3 text-right font-medium">Fiili Tüketim</th>
                <th className="py-2 px-3 text-right font-medium">Planlanan</th>
                <th className="py-2 px-3 text-right font-medium">Tüketim Maliyeti</th>
                <th className="py-2 pl-3 text-right font-medium">Reçete</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr
                  key={c.componentProductId}
                  onClick={() => onSelectComponent(c.componentProductId)}
                  className="group cursor-pointer border-b border-[var(--border)]/60 transition-colors last:border-0 hover:bg-[var(--muted)]/50"
                >
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                        <Layers className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate font-medium">{c.name}</span>
                      {c.unitCost === 0 && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
                          maliyet yok
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{moneyFine(c.unitCost)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{qty(c.consumedQty)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[var(--muted-foreground)]">{qty(c.plannedQty)}</td>
                  <td className="py-2.5 px-3 text-right font-medium tabular-nums">{money(c.consumedCost)}</td>
                  <td className="py-2.5 pl-3 text-right tabular-nums">{c.usedInRecipes}</td>
                  <td className="text-[var(--muted-foreground)]">
                    <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

// --- Reçete detayı -----------------------------------------------------------

function RecipeDetail({
  recipe,
  onComponentClick,
}: {
  recipe: RecipeAnalysis;
  onComponentClick: (id: number) => void;
}) {
  const pieData = recipe.lines.filter((l) => l.lineCost > 0).map((l) => ({ name: l.name, value: l.lineCost }));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Birim Maliyet" value={moneyFine(recipe.unitCost)} sub={`mamul: ${recipe.mamul}`} icon={Coins} color="#3b82f6" />
        <MiniStat label="Bileşen Sayısı" value={String(recipe.componentCount)} sub={recipe.isActive ? "aktif" : "pasif"} icon={Layers} color="#8b5cf6" />
        <MiniStat label="Üretilen Mamul" value={qty(recipe.producedQty)} sub={`planlı: ${qty(recipe.plannedQty)}`} icon={Factory} color="#f59e0b" />
        <MiniStat label="Fiili Tüketim Maliyeti" value={money(recipe.producedCost)} sub="tamamlanan üretim" icon={Boxes} color="#22c55e" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Bileşen Maliyet Payı" desc={`"${recipe.name}" — 1 birim mamul`}>
          {pieData.length > 0 ? (
            <Donut data={pieData} centerLabel="Birim" centerValue={money(recipe.unitCost)} />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-center text-sm text-[var(--muted-foreground)]">
              Bileşenlerin satın alma geçmişi olmadığından maliyet hesaplanamadı.
            </div>
          )}
        </Panel>

        <Panel title="Bileşen Maliyet Kırılımı" desc="Satıra tıklayın — bileşenin başka nerede kullanıldığını görün" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-medium">Bileşen</th>
                  <th className="py-2 px-3 text-right font-medium">Miktar</th>
                  <th className="py-2 px-3 text-right font-medium">Birim Maliyet</th>
                  <th className="py-2 px-3 text-right font-medium">Kalem Maliyeti</th>
                  <th className="py-2 pl-3 text-right font-medium">Pay %</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {recipe.lines.map((l) => (
                  <tr
                    key={l.componentProductId}
                    onClick={() => onComponentClick(l.componentProductId)}
                    className="group cursor-pointer border-b border-[var(--border)]/60 transition-colors last:border-0 hover:bg-[var(--muted)]/50"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium">{l.name}</span>
                        {l.unitCost === 0 && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
                            maliyet yok
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{qty(l.quantity)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{moneyFine(l.unitCost)}</td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums">{moneyFine(l.lineCost)}</td>
                    <td className="py-2.5 pl-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-2">
                        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[var(--muted)] sm:block">
                          <span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, l.sharePct)}%` }} />
                        </span>
                        <span className="w-12 text-right">%{l.sharePct.toFixed(1)}</span>
                      </span>
                    </td>
                    <td className="text-[var(--muted-foreground)]">
                      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] font-semibold">
                  <td className="py-2.5 pr-3">Toplam</td>
                  <td />
                  <td />
                  <td className="py-2.5 px-3 text-right tabular-nums">{moneyFine(recipe.unitCost)}</td>
                  <td className="py-2.5 pl-3 text-right tabular-nums">%100</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

// --- Bileşen detayı (ters arama) --------------------------------------------

function ComponentDetail({
  comp,
  onRecipeClick,
  onBack,
}: {
  comp: ComponentUsage;
  onRecipeClick: (id: number) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Birim Maliyet" value={moneyFine(comp.unitCost)} sub="ağırlıklı ort. alım" icon={Coins} color="#3b82f6" />
        <MiniStat label="Kullanıldığı Reçete" value={String(comp.usedInRecipes)} sub="ürün sayısı" icon={Package} color="#8b5cf6" />
        <MiniStat label="Fiili Tüketim" value={qty(comp.consumedQty)} sub={`planlı: ${qty(comp.plannedQty)}`} icon={Factory} color="#f59e0b" />
        <MiniStat label="Tüketim Maliyeti" value={money(comp.consumedCost)} sub="tamamlanan üretim" icon={Boxes} color="#22c55e" />
      </div>

      <Panel
        title={`"${comp.name}" hangi ürünlerde kullanılıyor?`}
        desc="Bu hammaddeyi içeren reçeteler — satıra tıklayarak ürünün kırılımına geçin"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Tüm bileşenler
        </button>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th className="py-2 pr-3 font-medium">Mamul / Reçete</th>
                <th className="py-2 px-3 text-right font-medium">Reçetedeki Miktar</th>
                <th className="py-2 px-3 text-right font-medium">Kalem Maliyeti</th>
                <th className="py-2 px-3 text-right font-medium">Reçetedeki Pay</th>
                <th className="py-2 pl-3 text-right font-medium">Fiili Tüketim</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {comp.recipes.map((r) => (
                <tr
                  key={r.recipeId}
                  onClick={() => onRecipeClick(r.recipeId)}
                  className="group cursor-pointer border-b border-[var(--border)]/60 transition-colors last:border-0 hover:bg-[var(--muted)]/50"
                >
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <Package className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.mamul}</span>
                        <span className="block truncate text-xs text-[var(--muted-foreground)]">{r.recipeName}</span>
                      </span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{qty(r.quantity)}</td>
                  <td className="py-2.5 px-3 text-right font-medium tabular-nums">{moneyFine(r.lineCost)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">%{r.sharePct.toFixed(1)}</td>
                  <td className="py-2.5 pl-3 text-right tabular-nums text-[var(--muted-foreground)]">{qty(r.consumedQty)}</td>
                  <td className="text-[var(--muted-foreground)]">
                    <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function MiniStat({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Coins;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{sub}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
