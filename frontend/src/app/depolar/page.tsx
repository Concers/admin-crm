import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getWarehouses } from "@/lib/api";
import { DepoForm } from "./depo-form";
import { DepoList } from "./depo-list";

export const dynamic = "force-dynamic";

type Row = {
  id: number;
  depo: string;
  lokasyon: string;
  name: string;
};

export default async function DepolarPage() {
  const warehouses = await getWarehouses();
  const rows: Row[] = warehouses.map((w) => ({
    id: w.id,
    depo: w.name,
    name: w.name,
    lokasyon: w.location ?? "",
  }));

  return (
    <PageShell title="Depolar">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Depo</h3>
        <DepoForm />
      </CardContent></Card>
      <DepoList rows={rows} />
    </PageShell>
  );
}
