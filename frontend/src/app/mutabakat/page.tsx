import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getPartners, getReconciliation } from "@/lib/api";
import { ReconcilePanel } from "./reconcile-panel";

export const dynamic = "force-dynamic";

export default async function MutabakatPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string }>;
}) {
  const sp = await searchParams;
  const partnerId = sp.partnerId ? Number(sp.partnerId) : null;

  const [partners, data] = await Promise.all([
    getPartners(),
    partnerId ? getReconciliation(partnerId) : Promise.resolve(null),
  ]);

  return (
    <PageShell title="Ödeme Mutabakatı">
      <Card>
        <CardContent>
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">
            Bir cari seçin; açık faturalarını ve dağıtılmamış ödeme/tahsilatlarını eşleştirerek kısmi
            ödemeleri kapatın. Bir fatura birden çok ödemeyle, bir ödeme birden çok faturaya bölünebilir.
          </p>
          {/* GET form sets ?partnerId and re-renders the worksheet server-side. */}
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="min-w-64">
              <label htmlFor="partnerId" className="mb-1 block text-sm font-medium">Cari</label>
              <select
                id="partnerId"
                name="partnerId"
                defaultValue={partnerId ?? ""}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="" disabled>Seçin</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]">
              Getir
            </button>
            {partnerId && (
              <Link href="/mutabakat" className="text-sm text-[var(--muted-foreground)] hover:underline">Temizle</Link>
            )}
          </form>
        </CardContent>
      </Card>

      {data ? (
        <ReconcilePanel data={data} />
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">Mutabakat için yukarıdan bir cari seçin.</p>
      )}
    </PageShell>
  );
}
