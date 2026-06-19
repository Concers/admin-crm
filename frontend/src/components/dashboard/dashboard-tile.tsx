import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const stripeColors = {
  emerald: "border-l-emerald-500",
  amber: "border-l-amber-500",
  rose: "border-l-rose-500",
  indigo: "border-l-violet-500",
  blue: "border-l-sky-500",
  plum: "border-l-[var(--primary)]",
} as const;

export function DashboardTile({
  icon: Icon,
  title,
  description,
  accent = "plum",
  headerExtra,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  accent?: keyof typeof stripeColors;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dashboard-tile flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] shadow-sm ring-1 ring-black/[0.03]",
        "border-l-[3px]",
        stripeColors[accent],
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)]/60 bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/30 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
        </div>
        {headerExtra}
      </div>
      <div className="flex-1 p-4 sm:p-5">{children}</div>
    </div>
  );
}
