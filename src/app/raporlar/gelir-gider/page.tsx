import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getGelirGiderRaporu } from "@/lib/reports";
import { formatCurrency } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function GelirGiderRaporPage() {
  const baslangic = new Date(2025, 0, 1);
  const bitis = new Date();
  const rapor = await getGelirGiderRaporu(baslangic, bitis);
  return (
    <PageShell title="Gelir-Gider Raporu">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">Yapılan Satış Toplamı</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">{formatCurrency(rapor.gelir)}</p>
        </CardContent></Card>
        <Card><CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">Toplam Gider</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{formatCurrency(rapor.gider)}</p>
        </CardContent></Card>
        <Card><CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">Net Kâr / Zarar</p>
          <p className={`mt-1 text-2xl font-semibold ${rapor.kar >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(rapor.kar)}
          </p>
        </CardContent></Card>
      </div>
    </PageShell>
  );
}
