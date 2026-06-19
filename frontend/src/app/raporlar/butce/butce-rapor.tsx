import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { BudgetVarianceReport } from "@/lib/api";

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function SalesVar({ variance, pct }: { variance: number | null; pct: number | null }) {
  if (variance == null) return <span className="text-[var(--muted-foreground)]">—</span>;
  const good = variance >= 0;
  return (
    <span className={cn("font-semibold tabular-nums", good ? "text-emerald-700" : "text-rose-700")}>
      {variance > 0 ? "+" : ""}
      {formatCurrency(variance)}
      {pct != null && <span className="ml-1 text-xs font-normal">({pct > 0 ? "+" : ""}{pct.toFixed(1)}%)</span>}
    </span>
  );
}

function ExpenseVar({ variance, pct }: { variance: number | null; pct: number | null }) {
  if (variance == null) return <span className="text-[var(--muted-foreground)]">—</span>;
  const bad = variance > 0;
  return (
    <span className={cn("font-semibold tabular-nums", bad ? "text-rose-700" : "text-emerald-700")}>
      {variance > 0 ? "+" : ""}
      {formatCurrency(variance)}
      {pct != null && <span className="ml-1 text-xs font-normal">({pct > 0 ? "+" : ""}{pct.toFixed(1)}%)</span>}
    </span>
  );
}

export function ButceOzet({ report }: { report: BudgetVarianceReport }) {
  const { totals } = report;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <p className="text-[10px] font-semibold uppercase text-emerald-800/70">Satış gerçekleşen</p>
        <p className="text-lg font-semibold tabular-nums text-emerald-900">{formatCurrency(totals.salesActual)}</p>
        <p className="text-xs text-emerald-800/70">Hedef: {formatCurrency(totals.salesTarget)}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Satış sapması</p>
        <p className={cn("text-lg font-semibold tabular-nums", totals.salesVariance >= 0 ? "text-emerald-800" : "text-rose-800")}>
          {totals.salesVariance >= 0 ? "+" : ""}{formatCurrency(totals.salesVariance)}
        </p>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
        <p className="text-[10px] font-semibold uppercase text-amber-900/70">Gider gerçekleşen</p>
        <p className="text-lg font-semibold tabular-nums text-amber-900">{formatCurrency(totals.expenseActual)}</p>
        <p className="text-xs text-amber-900/70">Hedef: {formatCurrency(totals.expenseTarget)}</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">Gider sapması</p>
        <p className={cn("text-lg font-semibold tabular-nums", totals.expenseVariance <= 0 ? "text-emerald-800" : "text-rose-800")}>
          {totals.expenseVariance >= 0 ? "+" : ""}{formatCurrency(totals.expenseVariance)}
        </p>
      </div>
    </div>
  );
}

export function ButceTable({ report }: { report: BudgetVarianceReport }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <th className="px-4 py-3">Ay</th>
            <th className="px-4 py-3">Satış hedef</th>
            <th className="px-4 py-3">Satış gerç.</th>
            <th className="px-4 py-3">Satış sapma</th>
            <th className="px-4 py-3">Gider hedef</th>
            <th className="px-4 py-3">Gider gerç.</th>
            <th className="px-4 py-3">Gider sapma</th>
          </tr>
        </thead>
        <tbody>
          {report.months.map((m) => (
            <tr key={m.month} className="border-b border-[var(--border)]/60 hover:bg-[var(--muted)]/20">
              <td className="px-4 py-2.5 font-medium">{MONTHS[m.month - 1]}</td>
              <td className="px-4 py-2.5 tabular-nums">{m.sales.target != null ? formatCurrency(m.sales.target) : "—"}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatCurrency(m.sales.actual)}</td>
              <td className="px-4 py-2.5"><SalesVar variance={m.sales.variance} pct={m.sales.variancePct} /></td>
              <td className="px-4 py-2.5 tabular-nums">{m.expenses.target != null ? formatCurrency(m.expenses.target) : "—"}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatCurrency(m.expenses.actual)}</td>
              <td className="px-4 py-2.5"><ExpenseVar variance={m.expenses.variance} pct={m.expenses.variancePct} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
