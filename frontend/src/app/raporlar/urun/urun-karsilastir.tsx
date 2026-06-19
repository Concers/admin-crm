import { Crown } from "lucide-react";
import { ProductCompareChart } from "@/components/charts";
import { formatCurrency } from "@/lib/calculations";
import { formatQty } from "../stok/stok-rows";
import { cn } from "@/lib/utils";
import type { UrunListeRow } from "./urun-rapor-rows";

type MetricKey = "_satis" | "_satisQty" | "_alim" | "_digerMaliyet" | "_kar" | "_marj";

const METRICS: {
  key: MetricKey;
  label: string;
  format: (v: number) => string;
  /** En yüksek değer en iyi mi (kazananı vurgula). */
  higherBetter: boolean;
}[] = [
  { key: "_satis", label: "Satış", format: formatCurrency, higherBetter: true },
  { key: "_satisQty", label: "Satış Adedi", format: formatQty, higherBetter: true },
  { key: "_alim", label: "Alım", format: formatCurrency, higherBetter: false },
  { key: "_digerMaliyet", label: "Diğer Maliyet", format: formatCurrency, higherBetter: false },
  { key: "_kar", label: "Kâr", format: formatCurrency, higherBetter: true },
  { key: "_marj", label: "Marj (%)", format: (v) => `%${v}`, higherBetter: true },
];

export function UrunKarsilastir({ rows }: { rows: UrunListeRow[] }) {
  const chartData = rows.map((r) => ({ name: r.ad, satis: r._satis, alim: r._alim, kar: r._kar }));

  // Her "kazananı vurgulanan" metrik için en iyi ürünü belirle.
  const bestByMetric = new Map<MetricKey, string>();
  for (const m of METRICS) {
    if (!m.higherBetter) continue;
    let best: UrunListeRow | null = null;
    for (const r of rows) {
      if (best == null || r[m.key] > best[m.key]) best = r;
    }
    if (best && best[m.key] > 0) bestByMetric.set(m.key, best.ad);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Karşılaştırma — {rows.length} Ürün</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Seçili ürünlerin satış, alım ve kârı yan yana
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <ProductCompareChart data={chartData} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--accent)]/50 text-left">
                <th className="sticky left-0 z-[1] bg-[var(--accent)]/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Metrik
                </th>
                {rows.map((r) => (
                  <th
                    key={r.ad}
                    className="min-w-[150px] px-4 py-3 text-right text-xs font-semibold tracking-wide text-[var(--foreground)]"
                  >
                    <span className="line-clamp-2" title={r.ad}>
                      {r.ad}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-normal text-[var(--muted-foreground)]">
                      Raf: {r.raf}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const bestName = bestByMetric.get(m.key);
                return (
                  <tr key={m.key} className="border-b border-[var(--border)]/60 last:border-0">
                    <td className="sticky left-0 z-[1] bg-[var(--card)] px-4 py-2.5 font-medium text-[var(--muted-foreground)]">
                      {m.label}
                    </td>
                    {rows.map((r) => {
                      const isBest = bestName === r.ad;
                      return (
                        <td
                          key={r.ad}
                          className={cn(
                            "px-4 py-2.5 text-right tabular-nums",
                            isBest && "font-semibold text-[var(--primary)]"
                          )}
                        >
                          <span className="inline-flex items-center justify-end gap-1">
                            {isBest && <Crown className="h-3 w-3 text-[var(--primary)]" />}
                            {m.format(r[m.key])}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
