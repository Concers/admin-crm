import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getProductDevelopments } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function YeniUrunTakipPage() {
  const kayitlar = await getProductDevelopments();

  const rows = kayitlar.map((k) => ({
    urunAdi: k.productName,
    baslangic: k.startDate ? formatDate(new Date(k.startDate)) : "-",
    tedarikci: k.supplierName ?? "-",
    sinif: k.productClass ?? "-",
    hammaddeMi: k.productClass ?? "-",
    siparisVerildi: k.orderQuantity != null ? "Evet" : "-",
    fiyatAlindi: "-",
    uretimBitti: "-",
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
