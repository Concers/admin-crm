import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { GiderForm } from "./gider-form";
import { mapGiderRows } from "./gider-rows";
import { GiderTable } from "./gider-table";

export const dynamic = "force-dynamic";

export default async function GiderGirisiPage() {
  const [giderler, genelGiderler, urunGiderleri, urunler, tedarikciler, ozet] =
    await Promise.all([
      prisma.giderGirisi.findMany({ orderBy: { tarih: "desc" } }),
      prisma.genelGiderTuru.findMany({ orderBy: { ad: "asc" } }),
      prisma.urunGiderTuru.findMany({ orderBy: { ad: "asc" } }),
      prisma.urun.findMany({ orderBy: { ad: "asc" } }),
      prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
      prisma.giderGirisi.aggregate({
        _count: true,
        _sum: { toplamTutar: true, pesinOdenen: true },
      }),
    ]);

  const genelGiderTurleri = genelGiderler.map((g) => g.ad);
  const urunGiderTurleriList = urunGiderleri.map((g) => g.ad);
  const rows = mapGiderRows(giderler);

  return (
    <PageShell title="Gider Girişi">
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
            urunler={urunler.map((u) => u.ad)}
            tedarikciler={tedarikciler.map((t) => t.ad)}
          />
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-base font-semibold">Gider Kayıtları</h3>
        <GiderTable rows={rows} />
      </div>
    </PageShell>
  );
}
