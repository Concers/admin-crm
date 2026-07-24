import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Package, Send } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPartner } from "@/lib/api";
import { PARTNER_TYPE_LABEL } from "@/lib/cari-fields";
import { CariForm } from "./cari-form";

export const dynamic = "force-dynamic";

const TYPE_TONE: Record<string, "green" | "blue" | "amber" | "indigo" | "default"> = {
  SUPPLIER: "green",
  CUSTOMER: "blue",
  SERVICE_PROVIDER: "amber",
  OWNER: "indigo",
  OTHER: "default",
};

function ProductChips({ items }: { items: { id: number; name: string }[] }) {
  if (items.length === 0)
    return <p className="text-sm text-[var(--muted-foreground)]">Kayıt yok.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p) => (
        <Link key={p.id} href={`/urun-detay/${p.id}`}>
          <Badge tone="default" className="hover:bg-[var(--primary)]/10">
            <Package className="mr-1 h-3 w-3" />
            {p.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default async function CariDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const partner = await getPartner(id).catch(() => null);
  if (!partner) notFound();

  const isSupplier = partner.type === "SUPPLIER";
  const isCustomer = partner.type === "CUSTOMER";
  const isService = partner.type === "SERVICE_PROVIDER";

  // "tıkla-çek" bağlı ürünler + işlemlerden gelen ürünler.
  const linkedProducts = partner.productLinks.map((l) => ({ id: l.product.id, name: l.product.name }));

  return (
    <PageShell
      title={partner.name}
      description={`${PARTNER_TYPE_LABEL[partner.type]} — cari detay kartı`}
      actions={
        (isSupplier || isService) ? (
          <Link
            href="/tedarik-emri"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
          >
            <Send className="h-4 w-4" /> Talep Formu Oluştur
          </Link>
        ) : isCustomer ? (
          <Link
            href="/belgeler/teklif"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
          >
            <FileText className="h-4 w-4" /> Teklif Oluştur
          </Link>
        ) : undefined
      }
    >
      <Link
        href="/tanimlama"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Tanımlamaya dön
      </Link>

      <div className="flex items-center gap-2">
        <Badge tone={TYPE_TONE[partner.type] ?? "default"}>{PARTNER_TYPE_LABEL[partner.type]}</Badge>
        <span className="text-xs text-[var(--muted-foreground)]">
          {partner.counts.purchases} alım · {partner.counts.sales} satış · {partner.counts.expenses} gider
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cari Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <CariForm partner={partner} />
        </CardContent>
      </Card>

      {(isSupplier || linkedProducts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Tedarikçinin Ürünleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkedProducts.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">Bağlı ürünler</p>
                <ProductChips items={linkedProducts} />
              </div>
            )}
            <div>
              <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">Alım yapılan ürünler</p>
              <ProductChips items={partner.purchasedProducts} />
            </div>
          </CardContent>
        </Card>
      )}

      {isCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Alınan Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductChips items={partner.soldProducts} />
          </CardContent>
        </Card>
      )}

      {isService && (
        <Card>
          <CardHeader>
            <CardTitle>Alınan Hizmetler</CardTitle>
          </CardHeader>
          <CardContent>
            {partner.expenseCategories.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Kayıt yok.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {partner.expenseCategories.map((c) => (
                  <Badge key={c} tone="amber">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
