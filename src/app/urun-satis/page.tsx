import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ayAdi } from "@/lib/calculations";
import { SatisForm } from "./satis-form";

export const dynamic = "force-dynamic";

export default async function UrunSatisPage() {
  const [satislar, urunler, tedarikciler] = await Promise.all([
    prisma.urunSatis.findMany({ orderBy: { tarih: "desc" } }),
    prisma.urun.findMany({ orderBy: { ad: "asc" } }),
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
  ]);

  const rows = satislar.map((s) => ({
    id: s.id,
    tarih: formatDate(s.tarih),
    ay: s.ay ? ayAdi(s.ay) : "-",
    yil: s.yil ? String(s.yil) : "-",
    urunAdi: s.urunAdi,
    musteri: s.musteri,
    birimSatisFiyati: formatCurrency(s.birimSatisFiyati),
    satisAdeti: s.satisAdeti,
    toplamTutar: formatCurrency(s.toplamTutar),
    kdvDahilTutar: formatCurrency(s.kdvDahilTutar),
    karYuzdesi: s.karYuzdesi != null ? `%${s.karYuzdesi.toFixed(1)}` : "-",
  }));

  return (
    <PageShell title="Ürün Satış Giriş">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Satış Kaydı</h3>
          <SatisForm
            urunler={urunler.map((u) => u.ad)}
            musteriler={tedarikciler.map((t) => t.ad)}
          />
        </CardContent>
      </Card>
      <DataTable
        rows={rows}
        searchKeys={["urunAdi", "musteri"]}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "ay", label: "Ay" },
          { key: "yil", label: "Yıl" },
          { key: "urunAdi", label: "Ürün" },
          { key: "musteri", label: "Müşteri" },
          { key: "birimSatisFiyati", label: "Birim Fiyat" },
          { key: "satisAdeti", label: "Adet" },
          { key: "toplamTutar", label: "Toplam" },
          { key: "kdvDahilTutar", label: "KDV Dahil" },
          { key: "karYuzdesi", label: "Kâr %" },
        ]}
      />
    </PageShell>
  );
}
