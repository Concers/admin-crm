import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const accentMap = {
  blue: "bg-blue-500/12 text-blue-700 ring-blue-500/20",
  emerald: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25",
  amber: "bg-amber-500/12 text-amber-800 ring-amber-500/20",
  rose: "bg-rose-500/12 text-rose-800 ring-rose-500/20",
  indigo: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/20",
} as const;

/** Önceki döneme göre değişim göstergesi. */
export type StatTrend = { value: number; label?: string };

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  subtext,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof accentMap;
  subtext?: string;
  trend?: StatTrend;
}) {
  const up = trend ? trend.value >= 0 : false;
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            {label}
          </p>
          <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
            {value}
          </p>
          {trend ? (
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
                  up ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80" : "bg-rose-50 text-rose-700 ring-rose-200/80"
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {up ? "+" : ""}
                {trend.value.toFixed(1)}%
              </span>
              {trend.label && <span className="text-[var(--muted-foreground)]">{trend.label}</span>}
            </p>
          ) : (
            subtext && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{subtext}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
            accentMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function InfoBanner({
  title,
  children,
  accent = "blue",
}: {
  title: string;
  children: React.ReactNode;
  accent?: "blue" | "amber" | "emerald";
}) {
  const styles = {
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-200",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3.5 text-sm leading-relaxed", styles[accent])}>
      <p className="font-medium">{title}</p>
      <div className="mt-0.5 opacity-80">{children}</div>
    </div>
  );
}

export function PanelCard({
  icon: Icon,
  title,
  description,
  accent = "blue",
  children,
  headerExtra,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  accent?: keyof typeof accentMap;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-[var(--muted)]/40 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                accentMap[accent]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              {description && (
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{description}</p>
              )}
            </div>
          </div>
          {headerExtra}
        </div>
      </div>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}
