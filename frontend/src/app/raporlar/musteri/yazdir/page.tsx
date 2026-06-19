import { redirect } from "next/navigation";
import { CariEkstrePrint } from "@/components/cari-ekstre-print";
import { getCustomerStatement } from "@/lib/api";
import { buildMusteriEkstreLines, musteriTotals } from "@/lib/ekstre-lines";

export const dynamic = "force-dynamic";

export default async function MusteriEkstreYazdirPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const ad = (await searchParams).ad?.trim();
  if (!ad) redirect("/raporlar/musteri");

  const rapor = await getCustomerStatement(ad);

  return (
    <CariEkstrePrint
      title="Müşteri Cari Hesap Ekstresi"
      partyLabel="Müşteri"
      partyName={ad}
      lines={buildMusteriEkstreLines(rapor)}
      totals={musteriTotals(rapor)}
    />
  );
}
