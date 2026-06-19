import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendDatum } from "@/components/charts";
import { SparklineChart } from "@/components/charts";

const accents = {
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
    stripe: "from-emerald-600/90 to-emerald-400/50",
    spark: "#585925",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-800 ring-amber-500/20",
    stripe: "from-amber-500/90 to-amber-400/50",
    spark: "#BF8F36",
  },
  rose: {
    icon: "bg-rose-500/12 text-rose-700 ring-rose-500/20",
    stripe: "from-rose-600/85 to-rose-500/45",
    spark: "#8B3A2A",
  },
  indigo: {
    icon: "bg-violet-500/12 text-violet-700 ring-violet-500/20",
    stripe: "from-violet-600/80 to-violet-400/40",
    spark: "#8C6C7E",
  },
  blue: {
    icon: "bg-blue-500/12 text-blue-700 ring-blue-500/20",
    stripe: "from-blue-600/90 to-blue-400/50",
    spark: "#022E40",
  },
  plum: {
    icon: "bg-[var(--primary)]/12 text-[var(--primary)] ring-[var(--primary)]/25",
    stripe: "from-[var(--primary)] to-[#8C6C7E]",
    spark: "#590219",
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
