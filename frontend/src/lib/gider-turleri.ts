import type { Expense, ExpenseScope } from "./api";

/** Merge tanımlama listesi with categories actually used in expense records. */
export function mergeGiderTurleri(
  defined: string[],
  expenses: Expense[],
  scope: ExpenseScope
): string[] {
  const fromRecords = expenses
    .filter((e) => e.scope === scope)
    .map((e) => e.category?.trim())
    .filter((n): n is string => Boolean(n));

  return [...new Set([...defined, ...fromRecords])].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
}
