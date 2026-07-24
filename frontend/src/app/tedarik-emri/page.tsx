import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPartners, getProducts } from "@/lib/api";
import { PARTNER_TYPE_LABEL } from "@/lib/cari-fields";
import { TedarikForm } from "./tedarik-form";

export const dynamic = "force-dynamic";

export default async function TedarikEmriPage() {
  // Tüm oluşturulmuş cariler seçilebilir olsun (tedarikçiler başta, tip etiketli).
  const [partners, products] = await Promise.all([getPartners(), getProducts()]);
  const supplierOpts = partners
    .map((s) => ({ id: s.id, name: s.name, type: s.type }))
    .sort((a, b) => {
      if (a.type === "SUPPLIER" && b.type !== "SUPPLIER") return -1;
      if (b.type === "SUPPLIER" && a.type !== "SUPPLIER") return 1;
      return a.name.localeCompare(b.name, "tr");
    })
    .map((s) => ({ id: s.id, name: s.name, typeLabel: PARTNER_TYPE_LABEL[s.type] ?? s.type }));
  const productOpts = products.map((p) => ({ id: p.id, name: p.name, unit: p.unit }));

  return (
    <PageShell
      title="Tedarik Emri"
      description="Hammadde/malzeme alımı için tedarikçiye talep formu oluşturun"
      actions={
        <Link
          href="/talep-formu"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          Talep Formları <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Yeni Tedarik Talebi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TedarikForm suppliers={supplierOpts} products={productOpts} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
