"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Muted, theme-consistent fixed palette.
// Marka tonları — globals.css ile uyumlu
const GREEN = "#585925";
const GREEN_LIGHT = "#7a7d52";
const GREEN_DARK = "#3f4218";
const MAUVE = "#8C6C7E";
const PALETTE = ["#590219", GREEN, "#261515", "#022E40", GREEN_DARK, MAUVE];

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const fmt = (value: number) => tl.format(value);
// recharts Tooltip formatter receives a loosely-typed value; coerce to number.
const tooltipFmt = (value: unknown) => fmt(Number(value));

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" } as const;

function YAxisProductTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  return (
    <text x={x - 6} y={y} dy={4} textAnchor="end" fill="var(--muted-foreground)" fontSize={11}>
      {payload?.value ?? ""}
    </text>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

export interface BarDatum {
  name: string;
  value: number;
}

const qtyFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
const fmtQty = (value: number) => qtyFmt.format(value);

const VALUE_FORMATTERS = {
  currency: fmt,
  qty: fmtQty,
} as const;

export type ProductBarValueFormat = keyof typeof VALUE_FORMATTERS;

/** Uzun ürün adları için yatay çubuk grafik — tam isimler solda. */
export function ProductBarChart({
  data,
  barColor = PALETTE[0],
  maxItems = 12,
  valueFormat = "currency",
}: {
  data: BarDatum[];
  barColor?: string;
  maxItems?: number;
  /** Sunucu bileşeninden geçirilebilir — fonksiyon değil. */
  valueFormat?: ProductBarValueFormat;
}) {
  const formatValue = VALUE_FORMATTERS[valueFormat];
  const items = [...data].sort((a, b) => b.value - a.value).slice(0, maxItems);
  if (items.length === 0) return null;

  const yAxisWidth = Math.min(
    420,
    Math.max(200, ...items.map((d) => d.name.length * 6.5)),
  );
  const height = Math.max(220, items.length * 40 + 48);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={items}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v: number) => formatValue(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={yAxisWidth}
          tick={YAxisProductTick}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: unknown) => formatValue(Number(value))}
          labelFormatter={(label) => String(label)}
          cursor={{ fill: "var(--accent)" }}
        />
        <Bar dataKey="value" fill={barColor} radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface ProductCompareDatum {
  name: string;
  satis: number;
  alim: number;
  kar: number;
}

/** Birden fazla ürünü Satış / Alım / Kâr ekseninde karşılaştıran gruplu çubuk grafik. */
export function ProductCompareChart({ data }: { data: ProductCompareDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(320, data.length * 12 + 300)}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          interval={0}
          height={56}
          tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 16)}…` : v)}
        />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v: number) => tl.format(v)}
          width={80}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} cursor={{ fill: "var(--accent)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar name="Satış" dataKey="satis" fill={PALETTE[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar name="Alım" dataKey="alim" fill={PALETTE[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar name="Kâr" dataKey="kar" fill={GREEN_DARK} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Karşılaştırmalı çubuk grafik (Satış / Alım / Gider gibi). */
export function IncomeExpenseBarChart({ data }: { data: BarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v: number) => tl.format(v)}
          width={80}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} cursor={{ fill: "var(--accent)" }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Kategori bazlı dağılım için pasta grafiği. */
export function ExpenseBreakdownPieChart({ data }: { data: BarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={45}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export interface TrendDatum {
  label: string;
  value: number;
}

export interface InOutDatum {
  name: string;
  giris: number;
  cikis: number;
}

/** Aylık nakit giriş / çıkış karşılaştırması. */
export function CashFlowInOutBarChart({ data }: { data: InOutDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v: number) => tl.format(v)}
          width={80}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} cursor={{ fill: "var(--accent)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="giris" name="Giriş" fill={GREEN_LIGHT} radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="cikis" name="Çıkış" fill={MAUVE} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Zaman serisi (aylık) çizgi grafiği. */
export function TrendLineChart({
  data,
  stroke = PALETTE[0],
}: {
  data: TrendDatum[];
  stroke?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v: number) => tl.format(v)}
          width={80}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          dot={{ r: 3, fill: stroke }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface ComboTrendDatum {
  label: string;
  gelir: number;
  gider: number;
  kar: number;
}

/** Power BI tarzı gelir / gider alan grafiği + kâr çizgisi. */
export function RevenueExpenseAreaChart({ data }: { data: ComboTrendDatum[] }) {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GREEN_LIGHT} stopOpacity={0.45} />
            <stop offset="95%" stopColor={GREEN_LIGHT} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={MAUVE} stopOpacity={0.4} />
            <stop offset="95%" stopColor={MAUVE} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(v: number) => tl.format(v)}
          width={72}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="gelir"
          name="Satış"
          stroke={GREEN_LIGHT}
          fill="url(#gelirGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="gider"
          name="Gider"
          stroke={MAUVE}
          fill="url(#giderGrad)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="kar"
          name="Kâr"
          stroke={GREEN}
          strokeWidth={2.5}
          dot={{ r: 3, fill: GREEN }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const AGING_COLORS = [GREEN_LIGHT, "#BF8F36", MAUVE, "#590219"];

export interface AgingBucketDatum {
  name: string;
  value: number;
}

/** Alacak durumu — yatay tek satır stacked bar. */
export function AgingStackBar({ data }: { data: AgingBucketDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">Açık alacak yok.</p>
    );
  }
  const segments = data.filter((d) => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex h-9 w-full overflow-hidden rounded-full ring-1 ring-[var(--border)]">
        {segments.map((d, i) => (
          <div
            key={d.name}
            className="h-full transition-all"
            style={{
              width: `${(d.value / total) * 100}%`,
              backgroundColor: AGING_COLORS[i % AGING_COLORS.length],
            }}
            title={`${d.name}: ${tl.format(d.value)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.map((d, i) => (
          <div key={d.name} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: AGING_COLORS[i % AGING_COLORS.length] }}
              />
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                {d.name}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold tabular-nums">{tl.format(d.value)}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mini sparkline — KPI kartları için. */
export function SparklineChart({
  data,
  stroke = PALETTE[0],
}: {
  data: TrendDatum[];
  stroke?: string;
}) {
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={stroke} fill="url(#sparkGrad)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
