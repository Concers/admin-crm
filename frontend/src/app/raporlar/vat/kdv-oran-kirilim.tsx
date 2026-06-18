import type { VatRateBreakdown } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

function formatRate(rate: number) {
  return `%${Math.round(rate * 100)}`;
}

function RateTable({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: VatRateBreakdown[];
  accent: "emerald" | "amber";
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
        {title} için kayıt yok
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      base: acc.base + r.base,
      vat: acc.vat + r.vat,
      count: acc.count + r.count,
    }),
    { base: 0, vat: 0, count: 0 }
  );

  const headClass =
    accent === "emerald"
      ? "bg-emerald-50/80 text-emerald-900"
      : "bg-amber-50/80 text-amber-900";

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full min-w-[320px] text-sm">
        <caption className="border-b border-[var(--border)] bg-[var(--muted)]/30 px-4 py-2 text-left text-sm font-medium">
          {title}
        </caption>
        <thead>
          <tr className={headClass}>
            <th className="px-3 py-2 text-left font-medium">KDV Oranı</th>
            <th className="px-3 py-2 text-right font-medium">Kayıt</th>
            <th className="px-3 py-2 text-right font-medium">Matrah</th>
            <th className="px-3 py-2 text-right font-medium">KDV</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rate} className="border-t border-[var(--border)]">
              <td className="px-3 py-2 font-medium tabular-nums">{formatRate(row.rate)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                {row.count}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(row.base)}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">
                {formatCurrency(row.vat)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--border)] bg-[var(--muted)]/20 font-semibold">
            <td className="px-3 py-2">Toplam</td>
            <td className="px-3 py-2 text-right tabular-nums">{totals.count}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(totals.base)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(totals.vat)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function KdvOranKirilim({
  outputByRate,
  inputByRate,
}: {
  outputByRate: VatRateBreakdown[];
  inputByRate: VatRateBreakdown[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RateTable title="Hesaplanan KDV (Satış)" rows={outputByRate} accent="emerald" />
      <RateTable title="İndirilecek KDV (Alım)" rows={inputByRate} accent="amber" />
    </div>
  );
}
