import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getExpenseCategories, getPartners, getProductReport, getProducts } from "@/lib/api";
import { UrunAlimTable, UrunGiderTable, UrunSatisTable } from "./urun-islem-table";
import { UrunListeTable } from "./urun-liste-table";
import { UrunRaporOzet } from "./urun-rapor-ozet";
import {
  buildAylikSatisTrend,
  buildUrunListeRows,
  buildUrunRaporTotals,
} from "./urun-rapor-rows";
import {
  buildUrunAlimRows,
  buildUrunGiderRows,
  buildUrunSatisRows,
} from "./urun-islem-rows";
import { UrunSecici } from "./urun-secici";
import { UrunKarsilastirSecici } from "./urun-karsilastir-secici";
import { UrunKarsilastir } from "./urun-karsilastir";

export const dynamic = "force-dynamic";

export default async function UrunRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string; liste?: string; kar?: string }>;
}) {
  const sp = await searchParams;
  const urunAdi = sp.urun?.trim() || "";
  const listeMod = sp.liste === "1";
  const urunler = await getProducts();
  const urunAdlari = urunler.map((u) => u.name);

  // Karşılaştırma modu: ?kar=A,B,C — geçerli ürün adlarına göre süzülür/tekilleştirilir.
  const validName = new Set(urunAdlari);
  const karsilastirAdlari = [
    ...new Set(
      (sp.kar ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && validName.has(s)),
    ),
  ];
  const karMod = karsilastirAdlari.length >= 2;

  if (!urunAdi && !listeMod && !karMod && urunler.length > 0) {
    redirect(`/raporlar/urun?urun=${encodeURIComponent(urunler[0].name)}`);
  }

  const [raporGenel, raporUrun, musteriler, suppliers, serviceProviders, genelGiderler, urunGiderleri] =
    await Promise.all([
      getProductReport(),
      urunAdi ? getProductReport(urunAdi) : Promise.resolve(null),
      getPartners(),
      getPartners("SUPPLIER"),
      getPartners("SERVICE_PROVIDER"),
      getExpenseCategories("GENERAL"),
      getExpenseCategories("PRODUCT"),
    ]);

  const musteriAdlari = musteriler.map((p) => p.name);
  const tedarikciAdlari = [...suppliers, ...serviceProviders]
    .map((p) => p.name)
    .sort((a, b) => a.localeCompare(b, "tr"));

  const detayMod = Boolean(urunAdi) && !listeMod && !karMod;
  const rapor = detayMod && raporUrun ? raporUrun : raporGenel;
  const totals = buildUrunRaporTotals(rapor);
  const aylikTrend = buildAylikSatisTrend(rapor.sales);
  const listeRows = buildUrunListeRows(urunler, raporGenel);
  const karsilastirRows = karMod
    ? karsilastirAdlari
        .map((ad) => listeRows.find((r) => r.ad === ad))
        .filter((r): r is (typeof listeRows)[number] => Boolean(r))
    : [];
  const satisRows = detayMod ? buildUrunSatisRows(rapor.sales) : [];
  const alimRows = detayMod ? buildUrunAlimRows(rapor.purchases) : [];
  const giderRows = detayMod ? buildUrunGiderRows(rapor.expenses) : [];

  return (
    <PageShell
      title="Ürün Raporu"
      description='Excel "Ürün Raporu" sayfası — satış, alım, ürün giderleri ve kâr/zarar'
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                Excel&apos;deki gibi: <strong className="text-[var(--foreground)]">satış</strong> −{" "}
                <strong className="text-[var(--foreground)]">alım</strong> −{" "}
                <strong className="text-[var(--foreground)]">diğer maliyetler</strong> = kâr/zarar.
                Ürün seçerek satış detayına inebilirsiniz.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/stok"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Stok raporu →
            </Link>
            <Link
              href="/urun-satis"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Satış girişi →
            </Link>
          </div>
        </CardContent>
      </Card>

      {urunler.length > 0 ? (
        <>
          <UrunSecici products={urunAdlari} selected={urunAdi} listeMod={listeMod} />
          <UrunKarsilastirSecici products={urunAdlari} selected={karsilastirAdlari} />
        </>
      ) : (
        <Card className="border-amber-100 bg-amber-50/50">
          <CardContent className="py-5 text-sm text-amber-900">
            Henüz tanımlı ürün yok. Önce Tanımlama bölümünden ürün ekleyin.
          </CardContent>
        </Card>
      )}

      {karMod ? (
        <UrunKarsilastir rows={karsilastirRows} />
      ) : (
        <>
          <UrunRaporOzet
            productName={detayMod ? urunAdi : undefined}
            totals={totals}
            aylikTrend={detayMod ? aylikTrend : []}
            allProducts={!detayMod}
          />

          {detayMod ? (
        <div className="space-y-6">
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Satış Bilgileri</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Excel ile aynı kolonlar: gün, ay, yıl, müşteri, tutarlar, raf, notlar ve maliyetler
              </p>
            </div>
            <UrunSatisTable rows={satisRows} urunler={urunAdlari} musteriler={musteriAdlari} />
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Alım Hareketleri</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Tarih, tedarikçi, raf ve tutar kolonları
              </p>
            </div>
            <UrunAlimTable rows={alimRows} urunler={urunAdlari} tedarikciler={tedarikciAdlari} />
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Diğer Maliyetler</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Gider girişi kolonları: gün, ay, yıl, tür, periyot, fatura ve tarihler
              </p>
            </div>
            <UrunGiderTable
              rows={giderRows}
              genelGiderTurleri={genelGiderler.map((c) => c.name)}
              urunGiderTurleri={urunGiderleri.map((c) => c.name)}
              urunler={urunAdlari}
              tedarikciler={tedarikciAdlari}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">Tüm Ürünler</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Ürün bazında satış, alım ve kâr özeti — detay için ürün seçin
            </p>
          </div>
          <UrunListeTable rows={listeRows} />
        </div>
          )}
        </>
      )}
    </PageShell>
  );
}
