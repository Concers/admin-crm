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
const PALETTE = ["#c99da3", "#996888", "#86a59c", "#c0a35e", "#a5b4fc", "#6ee7b7"];

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
        <Bar dataKey="giris" name="Giriş" fill="#86a59c" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="cikis" name="Çıkış" fill="#c99da3" radius={[4, 4, 0, 0]} maxBarSize={36} />
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
            <stop offset="5%" stopColor="#86a59c" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#86a59c" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c99da3" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#c99da3" stopOpacity={0.05} />
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
          stroke="#86a59c"
          fill="url(#gelirGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="gider"
          name="Gider"
          stroke="#c99da3"
          fill="url(#giderGrad)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="kar"
          name="Kâr"
          stroke="#996888"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#996888" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const AGING_COLORS = ["#86a59c", "#c0a35e", "#c99da3", "#996888"];

export interface AgingBucketDatum {
  name: string;
  value: number;
}

/** Alacak yaşlandırma — yatay tek satır stacked bar. */
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
