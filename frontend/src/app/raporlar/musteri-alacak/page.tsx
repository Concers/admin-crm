import Link from "next/link";
import { Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomerReceivableList } from "@/lib/api";
import { MusteriAlacakOzet } from "./musteri-alacak-ozet";
import { buildMusteriAlacakOzet, buildMusteriAlacakRows } from "./musteri-alacak-rows";
import { MusteriAlacakTable } from "./musteri-alacak-table";

export const dynamic = "force-dynamic";

export default async function MusteriAlacakPage() {
  const liste = await getCustomerReceivableList();
  const rows = buildMusteriAlacakRows(liste);
  const ozet = buildMusteriAlacakOzet(liste);

  return (
    <PageShell
      title="Müşteri Alacak Listesi"
      description="Net alacaklı cariler — satış, tahsilat ve borç mahsuplaşması"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">Net alacak</strong> = (satış − peşin − tahsilat) − bizim
                borcumuz. Aynı firma hem müşteri hem tedarikçiyse bakiyeler birbirini netler.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/musteri"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Müşteri raporu →
            </Link>
            <Link
              href="/musteri-tahsilat"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Tahsilat girişi →
            </Link>
          </div>
        </CardContent>
      </Card>

      <MusteriAlacakOzet ozet={ozet} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Alacaklı Cariler</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Net alacağı olan müşteriler — detay için cari adına tıklayın veya müşteri raporuna gidin
          </p>
        </div>
        <MusteriAlacakTable rows={rows} />
      </div>
    </PageShell>
  );
}
