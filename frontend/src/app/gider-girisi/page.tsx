import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  getExpenseReport,
  getExpenseCategories,
  getProducts,
  getPartners,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ExportButton } from "@/components/export-button";
import { GiderForm } from "./gider-form";
import { mapGiderRows } from "./gider-rows";
import { GiderTable } from "./gider-table";

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

  const genelGiderTurleri = genelGiderler.map((g) => g.name);
  const urunGiderTurleriList = urunGiderleri.map((g) => g.name);
  const rows = mapGiderRows(giderler);

  return (
    <PageShell title="Gider Girişi" actions={<ExportButton type="expenses" />}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Toplam Kayıt
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{ozet._count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Toplam Tutar
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(ozet._sum.toplamTutar ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Peşin Ödenen
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(ozet._sum.pesinOdenen ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Gider Kaydı</h3>
          <GiderForm
            genelGiderTurleri={genelGiderTurleri}
            urunGiderTurleri={urunGiderTurleriList}
            urunler={urunler.map((u) => u.name)}
            tedarikciler={tedarikciler.map((t) => t.name)}
          />
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-base font-semibold">Gider Kayıtları</h3>
        <GiderTable
          rows={rows}
          genelGiderTurleri={genelGiderTurleri}
          urunGiderTurleri={urunGiderTurleriList}
          urunler={urunler.map((u) => u.name)}
          tedarikciler={tedarikciler.map((t) => t.name)}
        />
      </div>
    </PageShell>
  );
}
