import { withRunningBalance, type EkstreLine, type EkstreTotals } from "@/lib/ekstre-lines";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EkstreAutoPrint } from "./ekstre-auto-print";

export function CariEkstrePrint({
  title,
  partyLabel,
  partyName,
  lines,
  totals,
}: {
  title: string;
  partyLabel: string;
  partyName: string;
  lines: EkstreLine[];
  totals: EkstreTotals;
}) {
  const rows = withRunningBalance(lines);
  const printedAt = new Date();

  return (
    <div className="mx-auto max-w-4xl bg-white p-8 text-[var(--foreground)] print:p-4">
      <EkstreAutoPrint />

      <header className="mb-8 border-b border-[var(--border)] pb-4">
        <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Kadim ERP</p>
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <p>
            <span className="text-[var(--muted-foreground)]">{partyLabel}:</span>{" "}
            <strong>{partyName}</strong>
          </p>
          <p>
            <span className="text-[var(--muted-foreground)]">Yazdırma:</span>{" "}
            {formatDate(printedAt)} {printedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg border border-[var(--border)] p-4 text-sm">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">Toplam Borç</p>
          <p className="font-semibold tabular-nums">{formatCurrency(totals.debit)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">Toplam Alacak</p>
          <p className="font-semibold tabular-nums">{formatCurrency(totals.credit)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">Kalan Bakiye</p>
          <p className="font-semibold tabular-nums">{formatCurrency(totals.balance)}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--foreground)] text-left text-xs uppercase tracking-wide">
            <th className="py-2 pr-3">Tarih</th>
            <th className="py-2 pr-3">Açıklama</th>
            <th className="py-2 pr-3 text-right">Borç</th>
            <th className="py-2 pr-3 text-right">Alacak</th>
            <th className="py-2 text-right">Bakiye</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                Hareket kaydı yok.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{formatDate(r.date)}</td>
                <td className="py-2 pr-3">{r.label}</td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {r.debit > 0 ? formatCurrency(r.debit) : "—"}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">
                  {r.credit > 0 ? formatCurrency(r.credit) : "—"}
                </td>
                <td className="py-2 text-right font-medium tabular-nums">{formatCurrency(r.balance)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="no-print mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Tarayıcıdan &quot;Yazdır&quot; veya Ctrl+P ile PDF olarak kaydedebilirsiniz.
      </p>
    </div>
  );
}
