import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getReturns, getPartners, getProducts } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { IadeForm } from "./iade-form";

export const dynamic = "force-dynamic";

const TYPE: Record<string, string> = {
  SALES_RETURN: "Satış İadesi",
  PURCHASE_RETURN: "Alım İadesi",
};

function asNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && v != null && v !== "" ? n : null;
}

export default async function IadePage() {
  const [returns, partners, products] = await Promise.all([
    getReturns(),
    getPartners(),
    getProducts(),
  ]);

  // getReturns() yields generic objects — read fields defensively.
  const rows = returns.map((r, i) => {
    const dateRaw = (r.date ?? r.createdAt) as string | undefined;
    const typeRaw = String(r.type ?? "");
    const qty = asNumber(r.quantity);
    const amount = asNumber(r.amount);
    return {
      id: (asNumber(r.id) ?? i) as number,
      tarih: dateRaw ? formatDate(new Date(dateRaw)) : "-",
      tur: TYPE[typeRaw] ?? typeRaw ?? "-",
      miktar: qty != null ? String(qty) : "-",
      tutar: amount != null ? formatCurrency(amount) : "-",
      sebep: (r.reason as string) ?? "-",
    };
  });

  return (
    <PageShell title="İadeler">
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold">Yeni İade</h3>
          <IadeForm
            partners={partners.map((p) => ({ id: p.id, name: p.name }))}
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          />
        </CardContent>
      </Card>
      <DataTable
        rows={rows}
        searchKeys={["tur", "sebep"]}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "tur", label: "Tür" },
          { key: "miktar", label: "Miktar" },
          { key: "tutar", label: "Tutar" },
          { key: "sebep", label: "Sebep" },
        ]}
      />
    </PageShell>
  );
}
