import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { getSalesRepPerformance } from "@/lib/api";
import { SatisTemsilcisiDonemSecici } from "./satis-temsilcisi-donem-secici";
import { SatisTemsilcisiOzet } from "./satis-temsilcisi-ozet";
import { SatisTemsilcisiTable } from "./satis-temsilcisi-table";
import {
  buildSatisTemsilcisiRows,
  buildSatisTemsilcisiTotals,
  resolveSatisTemsilcisiDonem,
} from "./satis-temsilcisi-rows";

export const dynamic = "force-dynamic";

export default async function SatisTemsilcisiPage({
  searchParams,
}: {
  searchParams: Promise<{ donem?: string }>;
}) {
  const sp = await searchParams;
  const donemKey = sp.donem ?? "all";
  const donem = resolveSatisTemsilcisiDonem(donemKey === "all" ? undefined : donemKey);

  const data = await getSalesRepPerformance(donem.start, donem.end);
  const totals = buildSatisTemsilcisiTotals(data);
  const rows = buildSatisTemsilcisiRows(data);

  return (
    <PageShell title="Satış Temsilcisi Performansı" description="Temsilci bazında ciro, maliyet ve net kâr">
      <Card className="border-[var(--border)] bg-gradient-to-r from-indigo-50/40 to-white shadow-sm">
        <CardContent className="flex gap-3 py-4 text-sm text-[var(--muted-foreground)]">
          <UserCheck className="h-5 w-5 shrink-0 text-indigo-600" />
          <p>
            Satışlar girişi yapan kullanıcıya (<strong>salesRepId</strong>) atanır. Geçmiş import kayıtlarında
            temsilci yoksa <strong>Atanmamış</strong> grubunda görünür.
          </p>
        </CardContent>
      </Card>
      <SatisTemsilcisiDonemSecici selected={donemKey} label={donem.label} />
      <SatisTemsilcisiOzet totals={totals} rows={rows} />
      <SatisTemsilcisiTable rows={rows} />
    </PageShell>
  );
}
