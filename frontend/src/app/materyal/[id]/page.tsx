import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityAttachments } from "@/components/entity-attachments";
import { getMaterial, getPartners } from "@/lib/api";
import { MATERYAL_EK_KATEGORILERI } from "@/lib/materyal-fields";
import { DetailForm } from "./detail-form";
import { PartnersEditor } from "./partners-editor";
import { PriceBreaksEditor } from "./price-breaks-editor";
import { DeleteMaterialButton } from "./delete-material-button";

export const dynamic = "force-dynamic";

export default async function MateryalDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [material, partners] = await Promise.all([
    getMaterial(id).catch(() => null),
    getPartners(),
  ]);
  if (!material) notFound();

  return (
    <PageShell
      title={material.name}
      description="Materyal kartı — künye, tedarikçi/müşteri, kademeli fiyat, sertifika & görsel"
      actions={<DeleteMaterialButton id={material.id} />}
    >
      <Link
        href="/materyal"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Materyal listesine dön
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Künye</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailForm material={material} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tedarikçiler & Müşteriler</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnersEditor
            materialId={material.id}
            partnerLinks={material.partnerLinks}
            partners={partners}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kademeli Fiyat (X Adet Fiyatı)</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceBreaksEditor
            materialId={material.id}
            priceBreaks={material.priceBreaks}
            currency={material.currency ?? "TRY"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sertifika & Görsel</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MATERYAL_EK_KATEGORILERI.map((k) => (
            <EntityAttachments
              key={k.category}
              entityName="Material"
              entityId={material.id}
              category={k.category}
              title={k.title}
            />
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
