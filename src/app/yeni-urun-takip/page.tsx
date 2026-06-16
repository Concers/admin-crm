import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function YeniUrunTakipPage() {
  const kayitlar = await prisma.yeniUrunTakip.findMany({ orderBy: { urunAdi: "asc" } });
  const rows = kayitlar.map((k) => ({
    urunAdi: k.urunAdi,
    baslangic: k.islemBaslangicTarihi ? formatDate(k.islemBaslangicTarihi) : "-",
    tedarikci: k.tedarikci ?? "-",
    sinif: k.sinif ?? "-",
    hammaddeMi: k.hammaddeMi ?? "-",
    siparisVerildi: k.siparisVerildi ?? "-",
    fiyatAlindi: k.fiyatAlindi ?? "-",
    uretimBitti: k.uretimBitti ?? "-",
  }));
  return (
    <PageShell title="Yeni Ürün Takip">
      <DataTable rows={rows} searchKeys={["urunAdi", "tedarikci"]} columns={[
        { key: "urunAdi", label: "Ürün Adı" },
        { key: "baslangic", label: "Başlangıç" },
        { key: "tedarikci", label: "Tedarikçi" },
        { key: "sinif", label: "Sınıf" },
        { key: "hammaddeMi", label: "Hammadde/Karışım" },
        { key: "siparisVerildi", label: "Sipariş Verildi" },
        { key: "fiyatAlindi", label: "Fiyat Alındı" },
        { key: "uretimBitti", label: "Üretim Bitti" },
      ]} />
    </PageShell>
  );
}
