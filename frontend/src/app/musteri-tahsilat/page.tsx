import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getCashFlows, getPartners } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TahsilatForm } from "./tahsilat-form";

export const dynamic = "force-dynamic";

export default async function MusteriTahsilatPage() {
  const [tahsilatlar, musteriler] = await Promise.all([
    getCashFlows("COLLECTION"),
    getPartners(), // B2B: any partner can be a paying customer
  ]);
  const rows = tahsilatlar.map((t) => ({
    tarih: formatDate(new Date(t.date)),
    musteriAdi: t.partner.name,
    tahsilatTutari: formatCurrency(t.amount),
    notlar: t.notes ?? "",
  }));
  return (
    <PageShell title="Müşteri Tahsilat">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Tahsilat</h3>
        <TahsilatForm musteriler={musteriler.map((t) => t.name)} />
      </CardContent></Card>
      <DataTable rows={rows} searchKeys={["musteriAdi"]} columns={[
        { key: "tarih", label: "Tarih" }, { key: "musteriAdi", label: "Müşteri" },
        { key: "tahsilatTutari", label: "Tahsilat" }, { key: "notlar", label: "Notlar" },
      ]} />
    </PageShell>
  );
}
