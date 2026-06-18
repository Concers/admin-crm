import { PageShell } from "@/components/page-shell";
import { StatCard, PanelCard } from "@/components/ui/stat-card";
import { Receipt } from "lucide-react";
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

  return (
    <PageShell
      title="Gider Girişi"
      description="Genel ve ürün giderlerini kaydedin, filtreleyin ve dışa aktarın"
      actions={<ExportButton type="expenses" />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Kayıt" value={ozet._count} icon={Receipt} accent="blue" />
        <StatCard
          label="Toplam Tutar"
          value={formatCurrency(ozet._sum.toplamTutar ?? 0)}
          icon={Receipt}
          accent="rose"
        />
        <StatCard
          label="Peşin Ödenen"
          value={formatCurrency(ozet._sum.pesinOdenen ?? 0)}
          icon={Receipt}
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
