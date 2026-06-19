import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getLowStockReport } from "@/lib/api";
import { DusukStokRaporOzet } from "./dusuk-stok-rapor-ozet";
import { DusukStokRaporTable } from "./dusuk-stok-rapor-table";
import { buildDusukStokTableRows, buildDusukStokTotals } from "./dusuk-stok-rows";

export const dynamic = "force-dynamic";

export default async function DusukStokPage() {
  const liste = await getLowStockReport();
  const totals = buildDusukStokTotals(liste);
  const rows = buildDusukStokTableRows(liste);

  return (
    <PageShell
      title="Düşük Stok Uyarısı"
      description="Minimum stok seviyesinin altındaki ürünler ve sipariş önerileri"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-amber-50/50 via-white to-rose-50/40 shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                Yalnızca <strong className="text-[var(--foreground)]">minimum stok tanımlı</strong> ve mevcut
                stoğu bu seviyede veya altında olan ürünler listelenir.
              </p>
              <p className="mt-1">
                <span className="font-medium text-rose-700">Kritik</span> stok sıfır,{" "}
                <span className="font-medium text-amber-800">uyarı</span> min. altında,{" "}
                <span className="font-medium text-red-700">eksi stok</span> satışın stoku aştığı durumdur.
              </p>
            </div>
          </div>
          <Link
            href="/raporlar/stok"
            className="shrink-0 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
          >
            ← Stok raporu
          </Link>
        </CardContent>
      </Card>

      <DusukStokRaporOzet totals={totals} rows={rows} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Sipariş Gerektiren Ürünler</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Eksik miktara göre sıralı; aciliyet veya birime göre filtreleyebilirsiniz
          </p>
        </div>
        <DusukStokRaporTable rows={rows} />
      </div>
    </PageShell>
  );
}
