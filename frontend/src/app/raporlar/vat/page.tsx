import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { getGelirGiderDateBounds, getVatDeclaration } from "@/lib/api";
import { ayAdi } from "@/lib/calculations";
import { calendarYear, formatCurrency } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileBarChart,
  Percent,
  Receipt,
  Scale,
} from "lucide-react";
import { KdvDonemFilter } from "./donem-filter";
import { KdvBeyanOzet } from "./kdv-beyan-ozet";
import { KdvOranKirilim } from "./kdv-oran-kirilim";

export const dynamic = "force-dynamic";

function donemLabel(month: number | null, year: number) {
  return month ? `${ayAdi(month)} ${year}` : `${year} (Tüm Yıl)`;
}

function resolvePeriod(
  monthStr: string | undefined,
  yearStr: string | undefined,
  bounds: { min: string; max: string } | null
) {
  const fallback = bounds ? new Date(bounds.max) : new Date();
  const defaultMonth = fallback.getMonth() + 1;
  const defaultYear = fallback.getFullYear();

  const month = monthStr ? Number(monthStr) : defaultMonth;
  const year = yearStr ? Number(yearStr) : defaultYear;

  const validMonth = month >= 1 && month <= 12 ? month : defaultMonth;
  const validYear = year > 0 ? year : defaultYear;

  return {
    month: validMonth,
    year: validYear,
    defaultMonth,
    defaultYear,
  };
}

function yearsFromBounds(bounds: { min: string; max: string } | null) {
  const yearSet = new Set<number>([new Date().getFullYear()]);
  if (bounds) {
    yearSet.add(calendarYear(bounds.min));
    yearSet.add(calendarYear(bounds.max));
  }
  return [...yearSet].sort((a, b) => b - a);
}

export default async function VatRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const bounds = await getGelirGiderDateBounds();
  const { month, year, defaultMonth, defaultYear } = resolvePeriod(
    sp.month,
    sp.year,
    bounds
  );
  const vat = await getVatDeclaration(month, year);
  const years = yearsFromBounds(bounds);

  const hasData = vat.salesCount > 0 || vat.purchaseCount > 0;
  const isDevreden = vat.payableVat < 0;
  const indirimOrani =
    vat.outputVat > 0 ? Math.round((vat.inputVat / vat.outputVat) * 100) : null;

  return (
    <PageShell
      title="KDV Beyanı"
      description="Dönemsel hesaplanan ve indirilecek KDV özeti; satış ve alım matrahları"
    >
      <KdvDonemFilter
        ay={month}
        yil={year}
        years={years}
        defaultAy={defaultMonth}
        defaultYil={defaultYear}
      />

      <p className="text-sm text-[var(--muted-foreground)]">
        Dönem:{" "}
        <span className="font-medium text-[var(--foreground)]">
          {donemLabel(vat.period.month, vat.period.year)}
        </span>
        {bounds && !hasData && (
          <>
            <span className="mx-2 text-[var(--border)]">·</span>
            <span className="text-amber-700">
              Bu dönemde satış/alım kaydı yok. Veriler{" "}
              {ayAdi(new Date(bounds.min).getMonth() + 1)}{" "}
              {calendarYear(bounds.min)} – {ayAdi(new Date(bounds.max).getMonth() + 1)}{" "}
              {calendarYear(bounds.max)} arasında.
            </span>
          </>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Hesaplanan KDV"
          value={formatCurrency(vat.outputVat)}
          icon={ArrowUpRight}
          accent="emerald"
          subtext={`${vat.salesCount} satış · ${formatCurrency(vat.salesBase)} matrah`}
        />
        <StatCard
          label="İndirilecek KDV"
          value={formatCurrency(vat.inputVat)}
          icon={ArrowDownLeft}
          accent="amber"
          subtext={`${vat.purchaseCount} alım · ${formatCurrency(vat.purchasesBase)} matrah`}
        />
        <StatCard
          label={isDevreden ? "Devreden KDV" : "Ödenecek KDV"}
          value={formatCurrency(Math.abs(vat.payableVat))}
          icon={Scale}
          accent={isDevreden ? "rose" : "indigo"}
          subtext={
            indirimOrani != null && vat.outputVat > 0
              ? `İndirim oranı %${indirimOrani}`
              : undefined
          }
        />
        <StatCard
          label="Toplam İşlem"
          value={vat.salesCount + vat.purchaseCount}
          icon={Receipt}
          accent="blue"
          subtext={`${vat.salesCount} satış, ${vat.purchaseCount} alım`}
        />
      </div>

      <PanelCard
        icon={FileBarChart}
        title="KDV Beyan Özeti"
        description="Matrah ve KDV kalemleri; ödenecek veya devreden tutar"
        accent="indigo"
      >
        <KdvBeyanOzet data={vat} />
      </PanelCard>

      <PanelCard
        icon={Percent}
        title="KDV Oranı Kırılımı"
        description="Satış ve alımların KDV oranına göre matrah ve vergi dağılımı"
        accent="emerald"
      >
        <KdvOranKirilim
          outputByRate={vat.outputByRate}
          inputByRate={vat.inputByRate}
        />
      </PanelCard>
    </PageShell>
  );
}
