import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSales, getProducts, getPartners } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ayAdi } from "@/lib/calculations";
import { ExportButton } from "@/components/export-button";
import { SatisForm } from "./satis-form";
import { SatisList } from "./satis-list";

export const dynamic = "force-dynamic";

export default async function UrunSatisPage() {
  const [satislar, urunler, musteriler] = await Promise.all([
    getSales(),
    getProducts(),
    // B2B setup: the same firms act as both supplier and customer, so any
    // partner can be selected as the customer (the source TANIMLAMA defined no
    // dedicated "MÜŞTERİ" rows). List all partners, not just type=CUSTOMER.
    getPartners(),
  ]);

  const urunAdlari = urunler.map((u: { name: string }) => u.name);
  const musteriAdlari = musteriler.map((t: { name: string }) => t.name);

  const rows = satislar.map((s) => {
    const d = new Date(s.date);
    return {
      id: s.id,
      tarih: formatDate(d),
      ay: ayAdi(d.getMonth() + 1),
      yil: String(d.getFullYear()),
      urunAdi: s.product.name,
      musteri: s.customer.name,
      birimSatisFiyati: formatCurrency(s.unitPrice),
      satisAdeti: s.quantity,
      toplamTutar: formatCurrency(s.totalAmount),
      kdvDahilTutar: formatCurrency(s.vatIncludedAmount),
      karYuzdesi: s.profitMargin != null ? `%${s.profitMargin.toFixed(1)}` : "-",
      _date: s.date,
      _productName: s.product.name,
      _customerName: s.customer.name,
      _quantity: s.quantity,
      _unitPrice: s.unitPrice,
      _vatRate: s.vatRate,
      _paidAmount: s.paidAmount,
      _notes: s.notes ?? "",
    };
  });

  return (
    <PageShell title="Ürün Satış Giriş" actions={<ExportButton type="sales" />}>
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Satış Kaydı</h3>
          <SatisForm urunler={urunAdlari} musteriler={musteriAdlari} />
        </CardContent>
      </Card>
      <SatisList rows={rows} urunler={urunAdlari} musteriler={musteriAdlari} />
    </PageShell>
  );
}
