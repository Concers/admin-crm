import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getInvoices, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { FaturaForm } from "./fatura-form";
import { FaturaList, type FaturaRow } from "./fatura-list";

export const dynamic = "force-dynamic";

const DOC_TYPE: Record<string, string> = { SALES: "Satış", PURCHASE: "Alım" };
const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  ISSUED: "Kesildi",
  PAID: "Ödendi",
  CANCELLED: "İptal",
};

export default async function FaturaPage() {
  const [invoices, partners, products] = await Promise.all([
    getInvoices(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));

  const rows: FaturaRow[] = invoices.map((inv) => ({
    id: inv.id,
    faturaNo: inv.number ?? "-",
    tarih: formatDate(new Date(inv.date)),
    tur: DOC_TYPE[inv.docType] ?? inv.docType,
    cari: partnerName.get(inv.partnerId) ?? String(inv.partnerId),
    vade: inv.dueDate ? formatDate(new Date(inv.dueDate)) : "-",
    durum: STATUS[inv.status] ?? inv.status,
    toplam: formatCurrency(inv.totalAmount),
  }));

  return (
    <PageShell title="Faturalar">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Fatura</h3>
          <FaturaForm
            partners={partners.map((p) => ({ id: p.id, name: p.name }))}
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          />
        </CardContent>
      </Card>
      <FaturaList rows={rows} />
    </PageShell>
  );
}
