import Link from "next/link";
import { PieChart } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCostCenter } from "@/lib/api";
import { GiderMerkeziDonemSecici } from "./gider-merkezi-donem-secici";
import { GiderMerkeziOzet } from "./gider-merkezi-ozet";
import { GiderMerkeziTable } from "./gider-merkezi-table";
import {
  buildGiderMerkeziRows,
  buildGiderMerkeziTotals,
  resolveGiderMerkeziDonem,
} from "./gider-merkezi-rows";

export const dynamic = "force-dynamic";

export default async function GiderMerkeziPage({
  searchParams,
}: {
  searchParams: Promise<{ donem?: string }>;
}) {
  const sp = await searchParams;
  const donem = resolveGiderMerkeziDonem(sp.donem);

  const data = await getCostCenter(donem.start, donem.end);
  const totals = buildGiderMerkeziTotals(data);
  const rows = buildGiderMerkeziRows(data);

  return (
    <PageShell
      title="Gider Merkezi"
      description="Gider türlerine göre dağılım ve önceki dönemle karşılaştırma"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-violet-50/50 via-white to-[var(--accent)]/30 shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm ring-1 ring-violet-200">
              <PieChart className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                Giderler <strong className="text-[var(--foreground)]">gider türüne</strong> göre gruplanır; seçili
                dönem ile <strong className="text-[var(--foreground)]">eşit uzunluktaki önceki dönem</strong>{" "}
                karşılaştırılır.
              </p>
              <p className="mt-1">
                <span className="font-medium text-rose-700">Artış</span> maliyet yükselişi,{" "}
                <span className="font-medium text-emerald-700">azalış</span> tasarruf anlamına gelir.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/gider-girisi"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Gider girişi →
            </Link>
            <Link
              href="/raporlar/gelir-gider"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Gelir-gider tablosu →
            </Link>
          </div>
        </CardContent>
      </Card>

      <GiderMerkeziDonemSecici selected={donem.key} donemLabel={donem.label} />

      <GiderMerkeziOzet
        totals={totals}
        rows={rows}
        donemLabel={donem.label}
        oncekiLabel={donem.oncekiLabel}
      />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Kategori Detayı</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {donem.label} ve {donem.oncekiLabel.toLowerCase()} tutarları — trende göre filtreleyebilirsiniz
          </p>
        </div>
        <GiderMerkeziTable rows={rows} />
      </div>
    </PageShell>
  );
}
