import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getQuotes, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { TeklifForm } from "./teklif-form";
import { TeklifList, type TeklifRow } from "./teklif-list";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  ACCEPTED: "Kabul",
  REJECTED: "Reddedildi",
};

export default async function TeklifPage() {
  const [quotes, partners, products] = await Promise.all([
    getQuotes(),
    getPartners(),
    getProducts(),
  ]);

  const partnerName = new Map(partners.map((p) => [p.id, p.name]));

  const rows: TeklifRow[] = quotes.map((q) => ({
    id: q.id,
    tarih: formatDate(new Date(q.date)),
    cari: partnerName.get(q.partnerId) ?? String(q.partnerId),
    gecerlilik: q.validUntil ? formatDate(new Date(q.validUntil)) : "-",
    durum: STATUS[q.status] ?? q.status,
    toplam: formatCurrency(q.totalAmount),
    kdvDahil: formatCurrency(q.vatIncludedAmount),
  }));

  return (
    <PageShell title="Teklifler">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni Teklif</h3>
          <TeklifForm
            partners={partners.map((p) => ({ id: p.id, name: p.name }))}
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          />
        </CardContent>
      </Card>
      <TeklifList rows={rows} />
    </PageShell>
  );
}
