import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const accentMap = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  subtext,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof accentMap;
  subtext?: string;
}) {
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
          {subtext && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{subtext}</p>
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
    blue: "border-blue-100 bg-blue-50/70 text-blue-950",
    amber: "border-amber-100 bg-amber-50/70 text-amber-950",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-950",
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
