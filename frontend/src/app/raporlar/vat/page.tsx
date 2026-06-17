import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getVatDeclaration } from "@/lib/api";
import { formatCurrency, ayAdi } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function VatRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const month = sp.month ? Number(sp.month) : undefined;
  const year = sp.year ? Number(sp.year) : undefined;
  const vat = await getVatDeclaration(month, year);

  const donem = vat.period.month
    ? `${ayAdi(vat.period.month)} ${vat.period.year}`
    : `${vat.period.year} (Tüm Yıl)`;

  const kalemler = [
    { label: "Hesaplanan KDV", value: vat.outputVat },
    { label: "İndirilecek KDV", value: vat.inputVat },
    { label: "Ödenecek KDV", value: vat.payableVat },
  ];

  return (
    <PageShell title="KDV Beyanı">
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Dönem: <span className="font-medium text-[var(--foreground)]">{donem}</span>. Ödenecek KDV =
        Hesaplanan KDV − İndirilecek KDV.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kalemler.map((k) => (
          <Card key={k.label}>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">{k.label}</p>
              <p className="text-xl font-semibold">{formatCurrency(k.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
