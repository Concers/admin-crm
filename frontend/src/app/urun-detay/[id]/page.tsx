import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityAttachments } from "@/components/entity-attachments";
import { getPartners, getProduct } from "@/lib/api";
import { URUN_EK_KATEGORILERI } from "@/lib/urun-detay-fields";
import { DetailForm } from "./detail-form";
import { LinksEditor } from "./links-editor";
import { PartnersEditor } from "./partners-editor";
import { DeleteProductButton } from "./delete-product-button";

export const dynamic = "force-dynamic";

export default async function UrunDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [product, partners] = await Promise.all([
    getProduct(id).catch(() => null),
    getPartners(),
  ]);
  if (!product) notFound();

  return (
    <PageShell
      title={product.name}
      description="Ürün kartı — künye, içerik, analiz/sertifika, tedarikçi ve müşteri"
      actions={<DeleteProductButton id={product.id} />}
    >
      <Link
        href="/urun-detay"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Ürün listesine dön
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Künye</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailForm product={product} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tedarikçiler & Müşteriler</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnersEditor
            productId={product.id}
            partnerLinks={product.partnerLinks}
            partners={partners}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bilimsel Makale / Blog / Instagram</CardTitle>
        </CardHeader>
        <CardContent>
          <LinksEditor productId={product.id} links={product.links} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analiz, Sertifika, Görsel & Etiket</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {URUN_EK_KATEGORILERI.map((k) => (
            <EntityAttachments
              key={k.category}
              entityName="Product"
              entityId={product.id}
              category={k.category}
              title={k.title}
            />
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
