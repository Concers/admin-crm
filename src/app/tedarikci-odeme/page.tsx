import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OdemeForm } from "./odeme-form";

export const dynamic = "force-dynamic";

export default async function TedarikciOdemePage() {
  const [odemeler, tedarikciler] = await Promise.all([
    prisma.tedarikciOdeme.findMany({ orderBy: { tarih: "desc" } }),
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
  ]);
  const rows = odemeler.map((o) => ({
    tarih: formatDate(o.tarih),
    tedarikciAdi: o.tedarikciAdi,
    odenenTutar: formatCurrency(o.odenenTutar),
    notlar: o.notlar ?? "",
  }));
  return (
    <PageShell title="Tedarikçi Ödeme">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Ödeme</h3>
        <OdemeForm tedarikciler={tedarikciler.map((t) => t.ad)} />
      </CardContent></Card>
      <DataTable rows={rows} searchKeys={["tedarikciAdi", "notlar"]} columns={[
        { key: "tarih", label: "Tarih" }, { key: "tedarikciAdi", label: "Tedarikçi" },
        { key: "odenenTutar", label: "Ödenen Tutar" }, { key: "notlar", label: "Notlar" },
      ]} />
    </PageShell>
  );
}
