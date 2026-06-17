import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getPurchases, getProducts, getPartners } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExportButton } from "@/components/export-button";
import { AlimForm } from "./alim-form";
import { AlimList } from "./alim-list";

export const dynamic = "force-dynamic";

export default async function UrunAlimPage() {
  const [alimlar, urunler, suppliers, serviceProviders] = await Promise.all([
    getPurchases(),
    getProducts(),
    getPartners("SUPPLIER"),
    getPartners("SERVICE_PROVIDER"),
  ]);

  const tedarikciler = [...suppliers, ...serviceProviders].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  const urunAdlari = urunler.map((u: { name: string }) => u.name);
  const tedarikciAdlari = tedarikciler.map((t: { name: string }) => t.name);

  const rows = alimlar.map((a) => ({
    id: a.id,
    tarih: formatDate(new Date(a.date)),
    urunAdi: a.product.name,
    tedarikci: a.supplier.name,
    birimAlimFiyati: formatCurrency(a.unitPrice),
    alimAdeti: a.quantity,
    toplamTutar: formatCurrency(a.totalAmount),
    kdvDahilTutar: formatCurrency(a.vatIncludedAmount),
    pesinOdenen: a.paidAmount ? formatCurrency(a.paidAmount) : "-",
    _date: a.date,
    _productName: a.product.name,
    _supplierName: a.supplier.name,
    _quantity: a.quantity,
    _unitPrice: a.unitPrice,
    _vatRate: a.vatRate,
    _paidAmount: a.paidAmount,
    _shelfLocation: a.shelfLocation ?? "",
    _notes: a.notes ?? "",
  }));

  return (
    <PageShell title="Ürün Alım Giriş" actions={<ExportButton type="purchases" />}>
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Alım Kaydı</h3>
          <AlimForm urunler={urunAdlari} tedarikciler={tedarikciAdlari} />
        </CardContent>
      </Card>
      <AlimList rows={rows} urunler={urunAdlari} tedarikciler={tedarikciAdlari} />
    </PageShell>
  );
}
