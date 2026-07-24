import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/api";
import { isProductDetailFilled, sektorLabels } from "@/lib/urun-detay-fields";
import { YeniUrunForm } from "./yeni-urun-form";

export const dynamic = "force-dynamic";

export default async function UrunDetayListPage() {
  const products = await getProducts();
  // Eksik detaylılar üstte (alım sırasında açılan boş kartlar kolay bulunsun).
  const sorted = [...products].sort((a, b) => {
    const ca = isProductDetailFilled(a);
    const cb = isProductDetailFilled(b);
    if (ca !== cb) return ca ? 1 : -1;
    return a.name.localeCompare(b.name, "tr");
  });
  const eksikSayisi = products.filter((p) => !isProductDetailFilled(p)).length;

  return (
    <PageShell
      title="Ürün Detay"
      description="Ürün kartları — künye, analiz/sertifika, tedarikçi ve müşteri bilgileri"
    >
      <Card>
        <CardContent className="space-y-2">
          <h3 className="text-sm font-semibold">Yeni Ürün Kartı</h3>
          <YeniUrunForm />
          {eksikSayisi > 0 && (
            <p className="text-xs text-amber-600">
              {eksikSayisi} ürünün künye detayı eksik (alım sırasında açılan kartlar). Aşağıda üstte
              listelenir.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => {
          const sektorler = sektorLabels(p.sectors);
          const eksik = !isProductDetailFilled(p);
          return (
            <Link key={p.id} href={`/urun-detay/${p.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-[var(--primary)]">
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      <span className="truncate font-medium">{p.name}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  {(p.productCode || p.botanicalName) && (
                    <p className="truncate text-xs text-[var(--muted-foreground)]">
                      {[p.productCode, p.botanicalName].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {eksik && <Badge tone="amber">Detay eksik</Badge>}
                    {p.isBfm && <Badge tone="indigo">BFM</Badge>}
                    {sektorler.map((s) => (
                      <Badge key={s} tone="blue">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {sorted.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">Henüz ürün kartı yok.</p>
      )}
    </PageShell>
  );
}
