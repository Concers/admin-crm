import Link from "next/link";
import { Globe2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { getFxVarianceReport, getGelirGiderDateBounds } from "@/lib/api";

export const dynamic = "force-dynamic";

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function KurFarkiPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const sp = await searchParams;
  const bounds = await getGelirGiderDateBounds();
  const fallbackStart = bounds ? new Date(bounds.min) : new Date(new Date().getFullYear(), 0, 1);
  const fallbackEnd = bounds ? new Date(bounds.max) : new Date();
  const start = sp.start ?? toInputDate(fallbackStart);
  const end = sp.end ?? toInputDate(fallbackEnd);

  const report = await getFxVarianceReport(start, end);

  return (
    <PageShell
      title="Kur Farkı Özeti"
      description="Dövizli işlemlerde kayıt kuru ile güncel TCMB kuru karşılaştırması"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-blue-50/40 via-white to-[var(--accent)]/30 shadow-sm">
        <CardContent className="flex flex-wrap items-start gap-3 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-200">
            <Globe2 className="h-5 w-5" />
          </div>
          <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            <p>
              Açık bakiyelerde <strong className="text-[var(--foreground)]">bugünkü TCMB satış kuru</strong> ile
              kayıt anındaki kur arasındaki fark gösterilir. Satışta pozitif değer kur lehine, alımda pozitif değer
              kur aleyhine etki anlamına gelir.
            </p>
            <form className="mt-3 flex flex-wrap items-end gap-2" method="get">
              <label className="text-xs">
                Başlangıç
                <input name="start" type="date" defaultValue={start} className="ml-1 rounded-lg border border-[var(--border)] px-2 py-1" />
              </label>
              <label className="text-xs">
                Bitiş
                <input name="end" type="date" defaultValue={end} className="ml-1 rounded-lg border border-[var(--border)] px-2 py-1" />
              </label>
              <button type="submit" className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white">
                Uygula
              </button>
            </form>
          </div>
          <Link href="/raporlar/nakit-akis" className="ml-auto text-xs font-medium text-[var(--primary)] hover:underline">
            Nakit tahmin →
          </Link>
        </CardContent>
      </Card>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs uppercase text-[var(--muted-foreground)]">Dövizli işlem</p>
          <p className="text-2xl font-semibold">{report.rows.length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="text-xs uppercase text-amber-900/70">Açık TRY bakiye</p>
          <p className="text-lg font-semibold text-amber-900">{formatCurrency(report.totals.openTry)}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs uppercase text-[var(--muted-foreground)]">Net kur etkisi (TRY)</p>
          <p className={cn("text-lg font-semibold tabular-nums", report.totals.revaluationTry >= 0 ? "text-emerald-800" : "text-rose-800")}>
            {report.totals.revaluationTry >= 0 ? "+" : ""}{formatCurrency(report.totals.revaluationTry)}
          </p>
        </div>
      </div>

      {report.summary.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {report.summary.map((s) => (
            <span key={s.currency} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs">
              <strong>{s.currency}</strong> · {s.count} işlem · açık {formatCurrency(s.exposureTry)}
              {s.currentRate != null && ` · kur ${s.currentRate.toFixed(4)}`}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Tür</th>
              <th className="px-4 py-3">Cari</th>
              <th className="px-4 py-3">PB</th>
              <th className="px-4 py-3">Kayıt kuru</th>
              <th className="px-4 py-3">Güncel kur</th>
              <th className="px-4 py-3">Açık (TRY)</th>
              <th className="px-4 py-3">Kur farkı</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  Seçili dönemde dövizli işlem bulunamadı.
                </td>
              </tr>
            )}
            {report.rows.map((r) => (
              <tr key={`${r.kind}-${r.id}`} className="border-b border-[var(--border)]/60 hover:bg-[var(--muted)]/20">
                <td className="px-4 py-2.5">{r.date}</td>
                <td className="px-4 py-2.5">{r.kind === "SALE" ? "Satış" : "Alım"}</td>
                <td className="px-4 py-2.5">{r.partner}</td>
                <td className="px-4 py-2.5">{r.currency}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.exchangeRate.toFixed(4)}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.currentRate?.toFixed(4) ?? "—"}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatCurrency(r.unpaidTry)}</td>
                <td className={cn("px-4 py-2.5 tabular-nums font-semibold", (r.revaluationTry ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700")}>
                  {r.revaluationTry != null ? formatCurrency(r.revaluationTry) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
