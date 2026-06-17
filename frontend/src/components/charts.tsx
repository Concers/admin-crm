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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Muted, theme-consistent fixed palette.
const PALETTE = ["#4f6d7a", "#86a59c", "#c0a35e", "#9b6a6c", "#6c7a89", "#a8b5a2"];

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const fmt = (value: number) => tl.format(value);
// recharts Tooltip formatter receives a loosely-typed value; coerce to number.
const tooltipFmt = (value: unknown) => fmt(Number(value));

const axisStyle = { fontSize: 12, fill: "var(--muted-foreground)" } as const;

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

/** Karşılaştırmalı çubuk grafik (Satış / Alım / Gider gibi). */
export function IncomeExpenseBarChart({ data }: { data: BarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
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

/** Zaman serisi (aylık) çizgi grafiği. */
export function TrendLineChart({ data }: { data: TrendDatum[] }) {
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
          stroke={PALETTE[0]}
          strokeWidth={2}
          dot={{ r: 3, fill: PALETTE[0] }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
