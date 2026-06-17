import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getDiscounts } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { IskontoForm } from "./iskonto-form";
import { IskontoList, type IskontoRow } from "./iskonto-list";

export const dynamic = "force-dynamic";

export default async function IskontolarPage() {
  const discounts = await getDiscounts();

  const rows: IskontoRow[] = discounts.map((d) => {
    const percent = d.percent != null ? Number(d.percent) : null;
    const amount = d.amount != null ? Number(d.amount) : null;
    const validFrom = d.validFrom ? String(d.validFrom) : "";
    const validTo = d.validTo ? String(d.validTo) : "";

    let gecerlilik = "—";
    if (validFrom || validTo) {
      const from = validFrom ? formatDate(new Date(validFrom)) : "—";
      const to = validTo ? formatDate(new Date(validTo)) : "—";
      gecerlilik = `${from} - ${to}`;
    }

    return {
      id: Number(d.id),
      ad: String(d.name ?? ""),
      yuzde: percent != null ? `${percent}%` : "—",
      tutar: amount != null ? formatCurrency(amount) : "—",
      gecerlilik,
    };
  });

  return (
    <PageShell title="İskontolar">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni İskonto</h3>
          <IskontoForm />
        </CardContent>
      </Card>
      <IskontoList rows={rows} />
    </PageShell>
  );
}
