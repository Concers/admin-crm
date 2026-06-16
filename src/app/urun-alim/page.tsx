import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlimForm } from "./alim-form";

export const dynamic = "force-dynamic";

export default async function UrunAlimPage() {
  const [alimlar, urunler, tedarikciler] = await Promise.all([
    prisma.urunAlim.findMany({ orderBy: { tarih: "desc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
  ]);

  const rows = alimlar.map((a) => ({
    id: a.id,
    tarih: formatDate(a.tarih),
    urunAdi: a.urunAdi,
    tedarikci: a.tedarikci,
    birimAlimFiyati: formatCurrency(a.birimAlimFiyati),
    alimAdeti: a.alimAdeti,
    toplamTutar: formatCurrency(a.toplamTutar),
    kdvDahilTutar: formatCurrency(a.kdvDahilTutar),
    pesinOdenen: a.pesinOdenen ? formatCurrency(a.pesinOdenen) : "-",
  }));

  return (
    <PageShell title="Ürün Alım Giriş">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Alım Kaydı</h3>
          <AlimForm
            urunler={urunler.map((u) => u.ad)}
            tedarikciler={tedarikciler.map((t) => t.ad)}
          />
        </CardContent>
      </Card>
      <DataTable
        rows={rows}
        searchKeys={["urunAdi", "tedarikci"]}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "urunAdi", label: "Ürün" },
          { key: "tedarikci", label: "Tedarikçi" },
          { key: "birimAlimFiyati", label: "Birim Fiyat" },
          { key: "alimAdeti", label: "Adet" },
          { key: "toplamTutar", label: "Toplam" },
          { key: "kdvDahilTutar", label: "KDV Dahil" },
          { key: "pesinOdenen", label: "Peşin" },
        ]}
      />
    </PageShell>
  );
}
