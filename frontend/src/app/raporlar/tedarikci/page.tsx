import Link from "next/link";
import { redirect } from "next/navigation";
import { Printer, Truck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCashFlows, getExpenseCategories, getExpenseReport, getPartners, getProducts, getPurchases, getSupplierStatement } from "@/lib/api";
import { TedarikciAlimTable, TedarikciGiderTable, TedarikciOdemeTable } from "./tedarikci-islem-table";
import {
  buildTedarikciAlimRows,
  buildTedarikciGiderRows,
  buildTedarikciOdemeRows,
} from "./tedarikci-islem-rows";
import { TedarikciListeTable } from "./tedarikci-liste-table";
import { TedarikciRaporOzet } from "./tedarikci-rapor-ozet";
import {
  buildTedarikciListeRows,
  buildTedarikciRaporTotals,
} from "./tedarikci-rows";
import { TedarikciSecici } from "./tedarikci-secici";
import { isProductDetailFilled } from "@/lib/urun-detay-fields";

export const dynamic = "force-dynamic";

export default async function TedarikciRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string; liste?: string }>;
}) {
  const sp = await searchParams;
  const tedarikciAdi = sp.ad?.trim() || "";
  const listeMod = sp.liste === "1";

  const [partners, purchases, payments, expenses, urunler, suppliers, serviceProviders, genelGiderler, urunGiderleri] =
    await Promise.all([
    getPartners(),
    getPurchases(),
    getCashFlows("PAYMENT"),
    getExpenseReport(),
    getProducts(),
    getPartners("SUPPLIER"),
    getPartners("SERVICE_PROVIDER"),
    getExpenseCategories("GENERAL"),
    getExpenseCategories("PRODUCT"),
  ]);

  const tedarikciler = partners
    .filter((p) => p.type === "SUPPLIER" || p.type === "SERVICE_PROVIDER")
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const tedarikciAdlari = tedarikciler.map((t) => t.name);
  const urunAdlari = urunler.map((u) => u.name);
  // Alım düzenleme modali ürün adını değil, kart durumunu da bilmek ister.
  const urunKartlari = urunler.map((u) => ({
    id: u.id,
    name: u.name,
    complete: isProductDetailFilled(u),
  }));
  const tedarikciSecenekleri = [...suppliers, ...serviceProviders]
    .map((p) => p.name)
    .sort((a, b) => a.localeCompare(b, "tr"));

  if (!tedarikciAdi && !listeMod && tedarikciAdlari.length > 0) {
    redirect(`/raporlar/tedarikci?ad=${encodeURIComponent(tedarikciAdlari[0])}`);
  }

  const [raporGenel, raporTedarikci] = await Promise.all([
    Promise.resolve({
      purchases,
      payments,
      expenses,
      purchaseTotal: purchases.reduce((s, p) => s + p.vatIncludedAmount, 0),
      upfront: purchases.reduce((s, p) => s + p.paidAmount, 0),
      expenseTotal: expenses.reduce((s, e) => s + e.totalAmount, 0),
      expenseUpfront: expenses.reduce((s, e) => s + e.paidAmount, 0),
      paid: payments.reduce((s, p) => s + p.amount, 0),
      debt:
        purchases.reduce((s, p) => s + p.vatIncludedAmount, 0) -
        purchases.reduce((s, p) => s + p.paidAmount, 0) +
        expenses.reduce((s, e) => s + e.totalAmount, 0) -
        expenses.reduce((s, e) => s + e.paidAmount, 0) -
        payments.reduce((s, p) => s + p.amount, 0),
    }),
    tedarikciAdi ? getSupplierStatement(tedarikciAdi) : Promise.resolve(null),
  ]);

  const detayMod = Boolean(tedarikciAdi) && !listeMod;
  const rapor = detayMod && raporTedarikci ? raporTedarikci : raporGenel;
  const totals = buildTedarikciRaporTotals(rapor);
  const listeRows = buildTedarikciListeRows(tedarikciler, purchases, payments, expenses);
  const alimRows = detayMod ? buildTedarikciAlimRows(rapor.purchases) : [];
  const giderRows = detayMod ? buildTedarikciGiderRows(rapor.expenses) : [];
  const odemeRows = detayMod ? buildTedarikciOdemeRows(rapor.payments) : [];

  return (
    <PageShell
      title="Tedarikçi Raporu"
      description='Excel "Tedarikçi Rapor" — alım, diğer giderler, ödemeler ve kalan bakiye'
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <Truck className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">Mal alımı</strong> −{" "}
                <strong className="text-[var(--foreground)]">peşin ödemeler</strong> +{" "}
                <strong className="text-[var(--foreground)]">diğer giderler</strong> −{" "}
                <strong className="text-[var(--foreground)]">gider peşin</strong> −{" "}
                <strong className="text-[var(--foreground)]">yapılan ödemeler</strong> = kalan bakiye.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/tedarikci-borc"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Borç listesi →
            </Link>
            <Link
              href="/tedarikci-odeme"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Ödeme girişi →
            </Link>
          </div>
        </CardContent>
      </Card>

      {tedarikciAdlari.length > 0 ? (
        <TedarikciSecici
          suppliers={tedarikciAdlari}
          selected={tedarikciAdi}
          listeMod={listeMod}
        />
      ) : (
        <Card className="border-amber-100 bg-amber-50/50">
          <CardContent className="py-5 text-sm text-amber-900">
            Henüz tanımlı tedarikçi yok. Önce Tanımlama bölümünden tedarikçi ekleyin.
          </CardContent>
        </Card>
      )}

      <TedarikciRaporOzet
        supplierName={detayMod ? tedarikciAdi : undefined}
        totals={totals}
        allSuppliers={!detayMod}
      />

      {detayMod ? (
        <div className="space-y-6">
          <div className="flex justify-end no-print">
            <Link
              href={`/raporlar/tedarikci/yazdir?ad=${encodeURIComponent(tedarikciAdi)}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              <Printer className="h-3.5 w-3.5" />
              Ekstre Yazdır / PDF
            </Link>
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Tedarikçiden Alımlar</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Excel &quot;Tedarikçiden Alımlar&quot; tablosu — ürün, tarih, KDV ve raf kolonları
              </p>
            </div>
            <TedarikciAlimTable
              rows={alimRows}
              urunKartlari={urunKartlari}
              tedarikciler={tedarikciSecenekleri}
            />
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Diğer Giderler</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Bu tedarikçiye bağlı gider kayıtları — gün, ay, yıl, tür ve tutar kolonları
              </p>
            </div>
            <TedarikciGiderTable
              rows={giderRows}
              genelGiderTurleri={genelGiderler.map((g) => g.name)}
              urunGiderTurleri={urunGiderleri.map((g) => g.name)}
              urunler={urunAdlari}
              tedarikciler={tedarikciSecenekleri}
            />
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Yapılan Ödemeler</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Tedarikçi ödeme kayıtları — tarih, tutar ve notlar
              </p>
            </div>
            <TedarikciOdemeTable rows={odemeRows} tedarikciler={tedarikciSecenekleri} />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">Tüm Tedarikçiler</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Cari bazında alım, ödeme ve borç özeti — detay için tedarikçi seçin
            </p>
          </div>
          <TedarikciListeTable rows={listeRows} />
        </div>
      )}
    </PageShell>
  );
}
