import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendDatum } from "@/components/charts";
import { SparklineChart } from "@/components/charts";

const accents = {
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
    stripe: "from-emerald-500/80 to-emerald-400/40",
    spark: "#059669",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-700 ring-amber-500/20",
    stripe: "from-amber-500/80 to-amber-400/40",
    spark: "#d97706",
  },
  rose: {
    icon: "bg-rose-500/12 text-rose-700 ring-rose-500/20",
    stripe: "from-rose-500/80 to-rose-400/40",
    spark: "#e11d48",
  },
  indigo: {
    icon: "bg-violet-500/12 text-violet-700 ring-violet-500/20",
    stripe: "from-violet-500/80 to-violet-400/40",
    spark: "#7c3aed",
  },
  blue: {
    icon: "bg-sky-500/12 text-sky-700 ring-sky-500/20",
    stripe: "from-sky-500/80 to-sky-400/40",
    spark: "#0284c7",
  },
  plum: {
    icon: "bg-[var(--primary)]/12 text-[var(--primary)] ring-[var(--primary)]/25",
    stripe: "from-[var(--primary)] to-[#c99da3]",
    spark: "#996888",
  },
} as const;

export function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  accent = "plum",
  trend,
  subtext,
  sparkline,
  featured = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: keyof typeof accents;
  trend?: { value: number; label?: string };
  subtext?: string;
  sparkline?: TrendDatum[];
  featured?: boolean;
}) {
  const a = accents[accent];
  const up = trend ? trend.value >= 0 : false;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        featured && "sm:col-span-2",
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", a.stripe)} />
      <div className={cn("flex h-full flex-col p-4", featured && "sm:flex-row sm:items-end sm:gap-6 sm:p-5")}>
        <div className={cn("min-w-0 flex-1", featured && "sm:pb-1")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {label}
              </p>
              <p
                className={cn(
                  "mt-1.5 font-bold tabular-nums tracking-tight text-[var(--foreground)]",
                  featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                a.icon,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {trend ? (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold tabular-nums ring-1",
                  up
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                    : "bg-rose-50 text-rose-700 ring-rose-200/80",
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {up ? "+" : ""}
                {trend.value.toFixed(1)}%
              </span>
              {trend.label && (
                <span className="text-[var(--muted-foreground)]">{trend.label}</span>
              )}
            </p>
          ) : (
            subtext && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{subtext}</p>
            )
          )}
        </div>
        {sparkline && sparkline.length > 1 && (
          <div className={cn("mt-3 shrink-0", featured ? "sm:mt-0 sm:w-44 lg:w-52" : "h-10")}>
            <SparklineChart data={sparkline} stroke={a.spark} />
          </div>
        )}
      </div>
    </div>
  );
}
