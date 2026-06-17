import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getOrders, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { SiparisForm } from "./siparis-form";
import { SiparisList, type SiparisRow } from "./siparis-list";

export const dynamic = "force-dynamic";

const DOC_TYPE: Record<string, string> = { SALES: "Satış", PURCHASE: "Alım" };
const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  CONFIRMED: "Onaylı",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

export default async function SiparisPage() {
  const [orders, partners, products] = await Promise.all([
    getOrders(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));

  const rows: SiparisRow[] = orders.map((o) => ({
    id: o.id,
    tarih: formatDate(new Date(o.date)),
    tur: DOC_TYPE[o.docType] ?? o.docType,
    cari: partnerName.get(o.partnerId) ?? String(o.partnerId),
    durum: STATUS[o.status] ?? o.status,
    toplam: formatCurrency(o.totalAmount),
    kdvDahil: formatCurrency(o.vatIncludedAmount),
  }));

  return (
    <PageShell title="Siparişler">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Sipariş</h3>
          <SiparisForm
            partners={partners.map((p) => ({ id: p.id, name: p.name }))}
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          />
        </CardContent>
      </Card>
      <SiparisList rows={rows} />
    </PageShell>
  );
}
