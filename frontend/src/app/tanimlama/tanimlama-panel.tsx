import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accentStyles = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    badge: "bg-indigo-50 text-indigo-700",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    badge: "bg-amber-50 text-amber-700",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 ring-rose-100",
    badge: "bg-rose-50 text-rose-700",
  },
} as const;

type Accent = keyof typeof accentStyles;

export function TanimlamaPanel({
  icon: Icon,
  title,
  description,
  count,
  accent = "indigo",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
  accent?: Accent;
  children: React.ReactNode;
}) {
  const styles = accentStyles[accent];

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-[var(--muted)]/40 pb-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums",
                  styles.badge
                )}
              >
                {count} kayıt
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-5">{children}</CardContent>
    </Card>
  );
}

export function TanimlamaStats({
  items,
}: {
  items: { label: string; value: number; accent: Accent }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            {item.label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums",
              item.accent === "indigo" && "text-indigo-600",
              item.accent === "emerald" && "text-emerald-600",
              item.accent === "amber" && "text-amber-600",
              item.accent === "rose" && "text-rose-600"
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
