import Link from "next/link";
import { Truck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSupplierDebtList } from "@/lib/api";
import { TedarikciBorcOzet } from "./tedarikci-borc-ozet";
import { buildTedarikciBorcOzet, buildTedarikciBorcRows } from "./tedarikci-borc-rows";
import { TedarikciBorcTable } from "./tedarikci-borc-table";

export const dynamic = "force-dynamic";

export default async function TedarikciBorcPage() {
  const liste = await getSupplierDebtList();
  const rows = buildTedarikciBorcRows(liste);
  const ozet = buildTedarikciBorcOzet(liste);

  return (
    <PageShell
      title="Tedarikçi Borç Listesi"
      description="Net borçlu cariler — alım, gider ve alacak mahsuplaşması"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <Truck className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">Net borç</strong> = (mal alımı + diğer gider − ödenen) −
                bizim alacağımız. Aynı firma hem müşteri hem tedarikçiyse bakiyeler birbirini netler.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/tedarikci"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Tedarikçi raporu →
            </Link>
            <Link
              href="/tedarikci-odeme"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Ödeme girişi →
            </Link>
          </div>
        </CardContent>
      </Card>

      <TedarikciBorcOzet ozet={ozet} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Borçlu Cariler</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Net borcu olan tedarikçiler — detay için cari adına tıklayın veya tedarikçi raporuna gidin
          </p>
        </div>
        <TedarikciBorcTable rows={rows} />
      </div>
    </PageShell>
  );
}
