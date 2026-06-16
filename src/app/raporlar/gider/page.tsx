import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getGiderRaporu } from "@/lib/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ayAdi } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function GiderRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string; yil?: string }>;
}) {
  const sp = await searchParams;
  const ay = sp.ay ? Number(sp.ay) : undefined;
  const yil = sp.yil ? Number(sp.yil) : undefined;
  const giderler = await getGiderRaporu(ay, yil);
  const toplam = giderler.reduce((s, g) => s + g.pesinOdenen, 0);
  const rows = giderler.map((g) => ({
    gun: formatDate(g.tarih),
    ay: g.ayAdi ?? (g.ay ? ayAdi(g.ay) : "-"),
    yil: g.yil ? String(g.yil) : "-",
    giderKategori: g.giderKategori,
    giderTuru: g.giderTuru,
    urunAdi: g.urunAdi ?? "-",
    tedarikciAdi: g.tedarikciAdi ?? "-",
    pesinOdenen: formatCurrency(g.pesinOdenen),
    aylikGiderPayi: g.aylikGiderPayi ? formatCurrency(g.aylikGiderPayi) : "-",
  }));
  return (
    <PageShell title="Gider Raporu">
      <Card><CardContent className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          {ay && yil ? `${ay}/${yil} filtresi` : "Tüm giderler"}
        </p>
        <p className="text-lg font-semibold">Toplam: {formatCurrency(toplam)}</p>
      </CardContent></Card>
      <DataTable rows={rows} searchKeys={["giderTuru", "urunAdi", "ay"]} columns={[
        { key: "gun", label: "Gün" }, { key: "ay", label: "Ay" }, { key: "yil", label: "Yıl" },
        { key: "giderKategori", label: "Kategori" },
        { key: "giderTuru", label: "Gider Türü" }, { key: "urunAdi", label: "Ürün" },
        { key: "tedarikciAdi", label: "Tedarikçi" }, { key: "pesinOdenen", label: "Peşin" },
        { key: "aylikGiderPayi", label: "Aylık Pay" },
      ]} />
    </PageShell>
  );
}
