import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TahsilatForm } from "./tahsilat-form";

export const dynamic = "force-dynamic";

export default async function MusteriTahsilatPage() {
  const [tahsilatlar, tedarikciler] = await Promise.all([
    prisma.musteriTahsilat.findMany({ orderBy: { tarih: "desc" } }),
    prisma.tedarikci.findMany({ orderBy: { ad: "asc" } }),
  ]);
  const rows = tahsilatlar.map((t) => ({
    tarih: formatDate(t.tarih),
    musteriAdi: t.musteriAdi,
    tahsilatTutari: formatCurrency(t.tahsilatTutari),
    notlar: t.notlar ?? "",
  }));
  return (
    <PageShell title="Müşteri Tahsilat">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Tahsilat</h3>
        <TahsilatForm musteriler={tedarikciler.map((t) => t.ad)} />
      </CardContent></Card>
      <DataTable rows={rows} searchKeys={["musteriAdi"]} columns={[
        { key: "tarih", label: "Tarih" }, { key: "musteriAdi", label: "Müşteri" },
        { key: "tahsilatTutari", label: "Tahsilat" }, { key: "notlar", label: "Notlar" },
      ]} />
    </PageShell>
  );
}
