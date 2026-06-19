import Link from "next/link";
import { History } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { getProductCostHistory, getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  NEW_PURCHASE: "Yeni alım",
  PURCHASE_UPDATE: "Alım güncelleme",
  PRODUCT_EXPENSE: "Ürün gideri",
  GENERAL_EXPENSE: "Genel gider",
  RECOMPUTE: "Yeniden hesaplama",
};

export default async function MaliyetGecmisiPage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string }>;
}) {
  const sp = await searchParams;
  const products = await getProducts();
  const productId = sp.urun ? Number(sp.urun) : undefined;
  const history = await getProductCostHistory({
    productId: productId && Number.isFinite(productId) ? productId : undefined,
    limit: 200,
  });

  return (
    <PageShell
      title="Maliyet Revizyon Geçmişi"
      description="Birim maliyet değişimlerinin zaman çizelgesi (alım ve gider kaynaklı)"
    >
      <Card className="mb-4 overflow-hidden border-[var(--border)] shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <History className="h-5 w-5 text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Kayıtlar alım ve ürün gideri sonrası otomatik oluşur. Genel gider payı satış hacmine bağlı olduğu için
            dolaylı etki gösterir.
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            <Link
              href="/raporlar/maliyet-gecmisi"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ${!productId ? "bg-[var(--primary)] text-white ring-[var(--primary)]" : "bg-white ring-[var(--border)]"}`}
            >
              Tümü
            </Link>
            {products.slice(0, 12).map((p) => (
              <Link
                key={p.id}
                href={`/raporlar/maliyet-gecmisi?urun=${p.id}`}
                className={`max-w-[8rem] truncate rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ${productId === p.id ? "bg-[var(--primary)] text-white ring-[var(--primary)]" : "bg-white ring-[var(--border)] hover:bg-[var(--accent)]"}`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">Sebep</th>
              <th className="px-4 py-3">Alım birim</th>
              <th className="px-4 py-3">Üretim payı</th>
              <th className="px-4 py-3">Genel pay</th>
              <th className="px-4 py-3">Toplam birim</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  Henüz maliyet revizyon kaydı yok. Alım veya ürün gideri girildiğinde oluşur.
                </td>
              </tr>
            )}
            {history.map((h) => (
              <tr key={h.id} className="border-b border-[var(--border)]/60 hover:bg-[var(--muted)]/20">
                <td className="px-4 py-2.5 whitespace-nowrap">{h.recordedAt.slice(0, 16).replace("T", " ")}</td>
                <td className="px-4 py-2.5 font-medium">{h.product.name}</td>
                <td className="px-4 py-2.5 text-[var(--muted-foreground)]">
                  {REASON_LABEL[h.reason] ?? h.reason}
                  {h.sourceEntity && h.sourceId ? ` (#${h.sourceId})` : ""}
                </td>
                <td className="px-4 py-2.5 tabular-nums">{formatCurrency(h.purchaseUnitCost)}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatCurrency(h.productionUnitCost)}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatCurrency(h.overheadUnitCost)}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-[var(--primary)]">
                  {formatCurrency(h.totalUnitCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
