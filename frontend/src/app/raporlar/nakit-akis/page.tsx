import Link from "next/link";
import { Waves } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCashFlowProjection } from "@/lib/api";
import { NakitAkisAySecici } from "./nakit-akis-ay-secici";
import { NakitAkisOzet } from "./nakit-akis-ozet";
import { NakitAkisTable } from "./nakit-akis-table";
import {
  buildNakitAkisRows,
  buildNakitAkisTotals,
  resolveNakitAkisHorizon,
} from "./nakit-akis-rows";

export const dynamic = "force-dynamic";

export default async function NakitAkisPage({
  searchParams,
}: {
  searchParams: Promise<{ ay?: string }>;
}) {
  const sp = await searchParams;
  const horizon = resolveNakitAkisHorizon(sp.ay);

  const data = await getCashFlowProjection(horizon.months);
  const totals = buildNakitAkisTotals(data);
  const rows = buildNakitAkisRows(data);

  return (
    <PageShell
      title="Nakit Akış"
      description="Ödenmemiş alacak ve borçlara göre ileriye dönük nakit projeksiyonu"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-sky-50/50 via-white to-[var(--accent)]/30 shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm ring-1 ring-sky-200">
              <Waves className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">Giriş:</strong> tahsil edilmemiş satış alacakları
                (vade tarihi veya fatura tarihi).{" "}
                <strong className="text-[var(--foreground)]">Çıkış:</strong> ödenmemiş alım borçları ve giderler.
              </p>
              <p className="mt-1">
                <span className="font-medium text-emerald-700">Pozitif</span> aylar nakit fazlası,{" "}
                <span className="font-medium text-rose-700">negatif</span> aylar nakit açığı anlamına gelir.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/musteri-tahsilat"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Müşteri tahsilat →
            </Link>
            <Link
              href="/tedarikci-odeme"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Tedarikçi ödeme →
            </Link>
            <Link
              href="/raporlar/musteri-alacak"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Müşteri alacak →
            </Link>
          </div>
        </CardContent>
      </Card>

      <NakitAkisAySecici selected={horizon.months} horizonLabel={horizon.label} />

      <NakitAkisOzet totals={totals} rows={rows} horizonLabel={horizon.label} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Aylık Detay</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Önümüzdeki {horizon.label} — duruma göre filtreleyebilirsiniz
          </p>
        </div>
        <NakitAkisTable rows={rows} />
      </div>
    </PageShell>
  );
}
