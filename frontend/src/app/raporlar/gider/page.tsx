import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { ExpenseBreakdownPieChart } from "@/components/charts";
import { ExportButton } from "@/components/export-button";
import { getExpenseReport } from "@/lib/api";
import { ayAdi } from "@/lib/calculations";
import { formatCurrency, calendarYear } from "@/lib/utils";
import { mapGiderRows } from "@/app/gider-girisi/gider-rows";
import { FileBarChart, Layers, Receipt, Wallet } from "lucide-react";
import { GiderDonemFilter } from "./gider-donem-filter";
import { GiderRaporTable } from "./gider-rapor-table";

export const dynamic = "force-dynamic";

function donemLabel(ay?: number, yil?: number) {
  if (ay && yil) return `${ayAdi(ay)} ${yil}`;
  if (yil) return `${yil} (tüm aylar)`;
  if (ay) return `${ayAdi(ay)} (tüm yıllar)`;
  return "Tüm dönemler";
}

export default async function GiderRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string; yil?: string }>;
}) {
  const sp = await searchParams;
  const ay = sp.ay ? Number(sp.ay) : undefined;
  const yil = sp.yil ? Number(sp.yil) : undefined;

  const [giderler, tumGiderler] = await Promise.all([
    getExpenseReport(ay, yil),
    getExpenseReport(),
  ]);

  const rows = mapGiderRows(giderler);

  const ozet = {
    kayit: giderler.length,
    toplamTutar: giderler.reduce((acc, g) => acc + (g.totalAmount ?? 0), 0),
    pesinOdenen: giderler.reduce((acc, g) => acc + (g.paidAmount ?? 0), 0),
    aylikPay: giderler.reduce((acc, g) => acc + (g.monthlyShare ?? 0), 0),
    genel: giderler.filter((g) => g.scope === "GENERAL").length,
    urun: giderler.filter((g) => g.scope === "PRODUCT").length,
  };

  const kategoriMap = new Map<string, number>();
  for (const g of giderler) {
    const key = g.category?.trim() || "Diğer";
    kategoriMap.set(key, (kategoriMap.get(key) ?? 0) + g.totalAmount);
  }
  const kategoriDagilimi = [...kategoriMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const yearSet = new Set<number>([new Date().getFullYear()]);
  for (const g of tumGiderler) {
    yearSet.add(calendarYear(g.date));
    if (g.startYear) yearSet.add(g.startYear);
  }
  const years = [...yearSet].sort((a, b) => b - a);

  return (
    <PageShell
      title="Gider Raporu"
      description="Excel Gider Girişi sütunlarıyla uyumlu gider özeti ve detay listesi"
      actions={<ExportButton type="expenses" label="CSV İndir" />}
    >
      <GiderDonemFilter ay={ay} yil={yil} years={years} />

      <p className="text-sm text-[var(--muted-foreground)]">
        Dönem:{" "}
        <span className="font-medium text-[var(--foreground)]">{donemLabel(ay, yil)}</span>
        <span className="mx-2 text-[var(--border)]">·</span>
        {ozet.genel} genel, {ozet.urun} ürün gideri
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Kayıt Sayısı"
          value={ozet.kayit}
          icon={Receipt}
          accent="rose"
        />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet.toplamTutar)}
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          label="Peşin Ödenen"
          value={formatCurrency(ozet.pesinOdenen)}
          icon={Layers}
          accent="emerald"
        />
        <StatCard
          label="Aylık Pay Toplamı"
          value={formatCurrency(ozet.aylikPay)}
          icon={FileBarChart}
          accent="indigo"
        />
      </div>

      {kategoriDagilimi.length > 0 && (
        <PanelCard
          icon={FileBarChart}
          title="Gider Türü Dağılımı"
          description="Seçilen dönemdeki giderlerin kategori bazlı toplam tutar payı"
          accent="rose"
        >
          <ExpenseBreakdownPieChart data={kategoriDagilimi} />
        </PanelCard>
      )}

      <PanelCard
        icon={Receipt}
        title="Gider Detayı"
        description="Excel Gider Girişi sayfasıyla aynı sütun sırası ve başlıklar"
        accent="indigo"
      >
        <GiderRaporTable rows={rows} />
      </PanelCard>
    </PageShell>
  );
}
