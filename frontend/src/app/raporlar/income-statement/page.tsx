import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getIncomeStatement } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function IncomeStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const sp = await searchParams;
  const data = await getIncomeStatement(sp.start, sp.end);

  const satirlar = [
    { label: "Net Satış", value: data.revenue },
    { label: "Satılan Malın Maliyeti (SMM)", value: data.cogs },
    { label: "Brüt Kâr", value: data.grossProfit, emphasized: true },
    { label: "Faaliyet Giderleri", value: data.operatingExpenses },
  ];

  return (
    <PageShell title="Gelir Tablosu">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Belirtilen dönem için gelir tablosu özeti. Aralık verilmediğinde içinde bulunulan yılın
        tamamı esas alınır.
      </p>
      <Card>
        <CardContent className="space-y-3">
          {satirlar.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
            >
              <span
                className={
                  s.emphasized
                    ? "font-semibold"
                    : "text-[var(--muted-foreground)]"
                }
              >
                {s.label}
              </span>
              <span className={s.emphasized ? "font-semibold" : ""}>
                {formatCurrency(s.value)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-semibold">Net Kâr</span>
            <span
              className={`text-lg font-bold ${
                data.netProfit > 0
                  ? "text-green-600"
                  : data.netProfit < 0
                    ? "text-red-600"
                    : ""
              }`}
            >
              {formatCurrency(data.netProfit)}
            </span>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
