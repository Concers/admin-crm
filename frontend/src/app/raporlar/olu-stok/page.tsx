import Link from "next/link";
import { Archive } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getDeadStock } from "@/lib/api";
import { OluStokGunSecici } from "./olu-stok-gun-secici";
import { OluStokRaporOzet } from "./olu-stok-rapor-ozet";
import { OluStokRaporTable } from "./olu-stok-rapor-table";
import { buildOluStokTableRows, buildOluStokTotals } from "./olu-stok-rows";

export const dynamic = "force-dynamic";

const GUN_SECENEKLERI = [30, 60, 90, 120, 180] as const;

function parseGun(raw?: string) {
  const n = Number(raw);
  return GUN_SECENEKLERI.includes(n as (typeof GUN_SECENEKLERI)[number]) ? n : 90;
}

export default async function OluStokRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ gun?: string }>;
}) {
  const sp = await searchParams;
  const gun = parseGun(sp.gun);

  const data = await getDeadStock(gun);
  const totals = buildOluStokTotals(data, gun);
  const rows = buildOluStokTableRows(data);

  return (
    <PageShell
      title="Ölü Stok"
      description="Uzun süredir satılmayan, stokta bekleyen ürünler ve stok değeri"
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-slate-50/60 via-white to-[var(--accent)]/30 shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
              <Archive className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">Ölü stok</strong>, seçilen süre boyunca satışı
                olmayan ve stokta bekleyen ürünlerdir. Stok değeri = mevcut miktar × ağırlıklı alım maliyeti.
              </p>
              <p className="mt-1">
                <span className="font-medium text-rose-700">Hiç satılmamış</span> ürünler ile{" "}
                <span className="font-medium text-amber-800">uzun süredir bekleyen</span> stoklar ayrı gösterilir.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/stok"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Stok raporu →
            </Link>
            <Link
              href="/raporlar/dusuk-stok"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Düşük stok →
            </Link>
          </div>
        </CardContent>
      </Card>

      <OluStokGunSecici selected={gun} />

      <OluStokRaporOzet totals={totals} rows={rows} />

      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold tracking-tight">Hareketsiz Ürünler</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Son {gun} günde satışı olmayan stoklar — değere göre sıralı
          </p>
        </div>
        <OluStokRaporTable rows={rows} />
      </div>
    </PageShell>
  );
}
