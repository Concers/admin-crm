import { redirect } from "next/navigation";
import { CariEkstrePrint } from "@/components/cari-ekstre-print";
import { getSupplierStatement } from "@/lib/api";
import { buildTedarikciEkstreLines, tedarikciTotals } from "@/lib/ekstre-lines";

export const dynamic = "force-dynamic";

export default async function TedarikciEkstreYazdirPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string }>;
}) {
  const ad = (await searchParams).ad?.trim();
  if (!ad) redirect("/raporlar/tedarikci");

  const rapor = await getSupplierStatement(ad);

  return (
    <CariEkstrePrint
      title="Tedarikçi Cari Hesap Ekstresi"
      partyLabel="Tedarikçi"
      partyName={ad}
      lines={buildTedarikciEkstreLines(rapor)}
      totals={tedarikciTotals(rapor)}
    />
  );
}
