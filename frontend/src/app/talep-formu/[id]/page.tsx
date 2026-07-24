import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getProducts, getRequestForm } from "@/lib/api";
import { RequestFormDetail } from "./request-form-detail";

export const dynamic = "force-dynamic";

export default async function TalepFormuDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [form, products] = await Promise.all([
    getRequestForm(id).catch(() => null),
    getProducts(),
  ]);
  if (!form) notFound();

  const productOpts = products.map((p) => ({ id: p.id, name: p.name, unit: p.unit }));

  return (
    <PageShell
      title={`Talep Formu TF-${String(form.id).padStart(5, "0")}`}
      description="Talep formunu düzenleyin, durumunu güncelleyin, PDF alın"
    >
      <Link
        href="/talep-formu"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Talep formlarına dön
      </Link>
      <Card>
        <CardContent>
          <RequestFormDetail form={form} products={productOpts} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
