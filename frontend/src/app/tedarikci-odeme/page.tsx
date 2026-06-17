import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getCashFlows, getPartners } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OdemeForm } from "./odeme-form";

export const dynamic = "force-dynamic";

export default async function TedarikciOdemePage() {
  const [odemeler, suppliers, serviceProviders] = await Promise.all([
    getCashFlows("PAYMENT"),
    getPartners("SUPPLIER"),
    getPartners("SERVICE_PROVIDER"),
  ]);
  const tedarikciler = [...suppliers, ...serviceProviders].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );
  const rows = odemeler.map((o) => ({
    tarih: formatDate(new Date(o.date)),
    tedarikciAdi: o.partner.name,
    odenenTutar: formatCurrency(o.amount),
    notlar: o.notes ?? "",
  }));
  return (
    <PageShell title="Tedarikçi Ödeme">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Ödeme</h3>
        <OdemeForm tedarikciler={tedarikciler.map((t) => t.name)} />
      </CardContent></Card>
      <DataTable rows={rows} searchKeys={["tedarikciAdi", "notlar"]} columns={[
        { key: "tarih", label: "Tarih" }, { key: "tedarikciAdi", label: "Tedarikçi" },
        { key: "odenenTutar", label: "Ödenen Tutar" }, { key: "notlar", label: "Notlar" },
      ]} />
    </PageShell>
  );
}
