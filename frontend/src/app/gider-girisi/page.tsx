import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Receipt, Wallet, Banknote } from "lucide-react";
import {
  getExpenseReport,
  getExpenseCategories,
  getProducts,
  getPartners,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { mergeGiderTurleri } from "@/lib/gider-turleri";
import { ExportButton } from "@/components/export-button";
import { mapGiderRows } from "./gider-rows";
import { GiderWorkspace } from "./gider-workspace";

export const dynamic = "force-dynamic";

/** Son ayın toplam gideri ile bir önceki ayın değişimi (% ). */
function monthlyTrend(items: { date: string | Date; totalAmount: number | null }[]): number | null {
  const byMonth = new Map<string, number>();
  for (const it of items) {
    const d = new Date(it.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + (it.totalAmount ?? 0));
  }
  const keys = [...byMonth.keys()].sort();
  if (keys.length < 2) return null;
  const last = byMonth.get(keys[keys.length - 1]) ?? 0;
  const prev = byMonth.get(keys[keys.length - 2]) ?? 0;
  if (prev === 0) return null;
  return ((last - prev) / prev) * 100;
}

export default async function GiderGirisiPage() {
  const [giderler, genelGiderler, urunGiderleri, urunler, suppliers, serviceProviders] =
    await Promise.all([
      getExpenseReport(),
      getExpenseCategories("GENERAL"),
      getExpenseCategories("PRODUCT"),
      getProducts(),
      getPartners("SUPPLIER"),
      getPartners("SERVICE_PROVIDER"),
    ]);

  const tedarikciler = [...suppliers, ...serviceProviders].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  const ozet = {
    _count: giderler.length,
    _sum: {
      toplamTutar: giderler.reduce((acc, g) => acc + (g.totalAmount ?? 0), 0),
      pesinOdenen: giderler.reduce((acc, g) => acc + (g.paidAmount ?? 0), 0),
    },
  };

  const genelGiderTurleri = mergeGiderTurleri(
    genelGiderler.map((g) => g.name),
    giderler,
    "GENERAL"
  );
  const urunGiderTurleriList = mergeGiderTurleri(
    urunGiderleri.map((g) => g.name),
    giderler,
    "PRODUCT"
  );
  const rows = mapGiderRows(giderler);
  const trend = monthlyTrend(giderler);

  return (
    <PageShell
      title="Gider Girişi"
      description="Genel ve ürün giderlerini yönetin"
      actions={<ExportButton type="expenses" />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Kayıt" value={ozet._count} icon={Receipt} accent="blue" />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet._sum.toplamTutar ?? 0)}
          icon={Wallet}
          accent="rose"
          trend={trend != null ? { value: trend, label: "önceki aya göre" } : undefined}
        />
        <StatCard
          label="Peşin Ödenen"
          value={formatCurrency(ozet._sum.pesinOdenen ?? 0)}
          icon={Banknote}
          accent="emerald"
        />
      </div>

      <PanelCard
        icon={Receipt}
        title="Gider Kayıtları"
        description="Ara, düzenle veya yeni kayıt ekle"
        accent="indigo"
      >
        <GiderWorkspace
          rows={rows}
          genelGiderTurleri={genelGiderTurleri}
          urunGiderTurleri={urunGiderTurleriList}
          urunler={urunler.map((u) => u.name)}
          tedarikciler={tedarikciler.map((t) => t.name)}
        />
      </PanelCard>
    </PageShell>
  );
}
