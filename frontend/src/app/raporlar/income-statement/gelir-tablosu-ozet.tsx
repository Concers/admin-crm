import type { IncomeStatement } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Minus,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function marginPct(value: number, base: number) {
  if (base <= 0) return null;
  return Math.round((value / base) * 1000) / 10;
}

function Money({
  value,
  tone = "default",
  prefix,
}: {
  value: number;
  tone?: "default" | "positive" | "negative" | "expense";
  prefix?: string;
}) {
  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        tone === "positive" && "text-emerald-700",
        tone === "negative" && "text-rose-700",
        tone === "expense" && "text-amber-700"
      )}
    >
      {prefix}
      {formatCurrency(value)}
    </span>
  );
}

function RowLine({
  label,
  value,
  tone,
  prefix,
  margin,
  emphasized,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "negative" | "expense";
  prefix?: string;
  margin?: number | null;
  emphasized?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg px-3 py-3",
        emphasized ? "bg-[var(--muted)]/40 ring-1 ring-[var(--border)]" : "hover:bg-[var(--muted)]/20"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
              emphasized
                ? "bg-indigo-50 text-indigo-600 ring-indigo-100"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] ring-[var(--border)]"
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className={cn("text-sm", emphasized ? "font-semibold" : "text-[var(--foreground)]")}>
            {label}
          </p>
          {margin != null && (
            <p className="text-xs text-[var(--muted-foreground)]">Marj: %{margin}</p>
          )}
        </div>
      </div>
      <Money value={value} tone={tone} prefix={prefix} />
    </div>
  );
}

export function GelirTablosuOzet({ data }: { data: IncomeStatement }) {
  const brutMarj = marginPct(data.grossProfit, data.revenue);
  const netMarj = marginPct(data.netProfit, data.revenue);

  return (
    <div className="space-y-1">
      <RowLine
        label="Net Satış"
        value={data.revenue}
        icon={TrendingUp}
        emphasized
      />
      <RowLine
        label="Satılan Malın Maliyeti (SMM)"
        value={data.cogs}
        tone="expense"
        prefix="− "
        icon={TrendingDown}
      />
      <RowLine
        label="Brüt Kâr"
        value={data.grossProfit}
        tone={data.grossProfit >= 0 ? "positive" : "negative"}
        margin={brutMarj}
        emphasized
        icon={ArrowUpRight}
      />
      <RowLine
        label="Faaliyet Giderleri"
        value={data.operatingExpenses}
        tone="expense"
        prefix="− "
        icon={Minus}
      />
      <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              <Scale className="h-4 w-4" />
            </span>
            <div>
              <p className="text-base font-semibold">Net Kâr / Zarar</p>
              {netMarj != null && (
                <p className="text-xs text-indigo-700/80">Net marj: %{netMarj}</p>
              )}
            </div>
          </div>
          <Money
            value={data.netProfit}
            tone={data.netProfit >= 0 ? "positive" : "negative"}
          />
        </div>
      </div>

      <p className="pt-2 text-xs text-[var(--muted-foreground)]">
        Net Kâr = Brüt Kâr − Faaliyet Giderleri · Brüt Kâr = Net Satış − SMM
      </p>
    </div>
  );
}
