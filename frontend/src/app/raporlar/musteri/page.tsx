import Link from "next/link";
import { redirect } from "next/navigation";
import { Printer, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCashFlows,
  getCustomerStatement,
  getPartners,
  getProducts,
  getSales,
} from "@/lib/api";
import { MusteriListeTable } from "./musteri-liste-table";
import { MusteriSatisTable, MusteriTahsilatTable } from "./musteri-islem-table";
import { buildMusteriSatisRows, buildMusteriTahsilatRows } from "./musteri-islem-rows";
import { MusteriRaporOzet } from "./musteri-rapor-ozet";
import { buildMusteriListeRows, buildMusteriRaporTotals } from "./musteri-rows";
import { MusteriSecici } from "./musteri-secici";

export const dynamic = "force-dynamic";

export default async function MusteriRaporPage({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string; liste?: string }>;
}) {
  const sp = await searchParams;
  const musteriAdi = sp.ad?.trim() || "";
  const listeMod = sp.liste === "1";

  const [partners, sales, collections, urunler] = await Promise.all([
    getPartners(),
    getSales(),
    getCashFlows("COLLECTION"),
    getProducts(),
  ]);

  const musteriAdlari = [
    ...new Set([
      ...sales.map((s) => s.customer.name),
      ...collections.map((c) => c.partner.name),
    ]),
  ].sort((a, b) => a.localeCompare(b, "tr"));

  const urunAdlari = urunler.map((u) => u.name);
  const musteriSecenekleri = partners.map((p) => p.name).sort((a, b) => a.localeCompare(b, "tr"));

  if (!musteriAdi && !listeMod && musteriAdlari.length > 0) {
    redirect(`/raporlar/musteri?ad=${encodeURIComponent(musteriAdlari[0])}`);
  }

  const [raporGenel, raporMusteri] = await Promise.all([
    Promise.resolve({
      sales,
      collections,
      saleTotal: sales.reduce((s, x) => s + x.totalAmount, 0),
      vatIncludedTotal: sales.reduce((s, x) => s + x.vatIncludedAmount, 0),
      upfront: sales.reduce((s, x) => s + x.paidAmount, 0),
      collected: collections.reduce((s, x) => s + x.amount, 0),
      receivable:
        sales.reduce((s, x) => s + x.vatIncludedAmount, 0) -
        sales.reduce((s, x) => s + x.paidAmount, 0) -
        collections.reduce((s, x) => s + x.amount, 0),
    }),
    musteriAdi ? getCustomerStatement(musteriAdi) : Promise.resolve(null),
  ]);

  const detayMod = Boolean(musteriAdi) && !listeMod;
  const rapor = detayMod && raporMusteri ? raporMusteri : raporGenel;
  const totals = buildMusteriRaporTotals(rapor);
  const listeRows = buildMusteriListeRows(partners, sales, collections);
  const satisRows = detayMod ? buildMusteriSatisRows(rapor.sales) : [];
  const tahsilatRows = detayMod ? buildMusteriTahsilatRows(rapor.collections) : [];

  return (
    <PageShell
      title="Müşteri Raporu"
      description='Excel "Müşteri Rapor" — satış, peşin, tahsilat ve kalan bakiye'
    >
      <Card className="overflow-hidden border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/40 via-white to-[var(--primary)]/[0.06] shadow-sm">
        <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p>
                <strong className="text-[var(--foreground)]">KDV&apos;li toplam</strong> −{" "}
                <strong className="text-[var(--foreground)]">peşin ödenen</strong> −{" "}
                <strong className="text-[var(--foreground)]">tahsilat</strong> = kalan bakiye (alacak).
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/raporlar/musteri-alacak"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Alacak listesi →
            </Link>
            <Link
              href="/musteri-tahsilat"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              Tahsilat girişi →
            </Link>
          </div>
        </CardContent>
      </Card>

      {musteriAdlari.length > 0 ? (
        <MusteriSecici customers={musteriAdlari} selected={musteriAdi} listeMod={listeMod} />
      ) : (
        <Card className="border-amber-100 bg-amber-50/50">
          <CardContent className="py-5 text-sm text-amber-900">
            Henüz satış veya tahsilat kaydı yok. Önce satış veya tahsilat girişi yapın.
          </CardContent>
        </Card>
      )}

      <MusteriRaporOzet
        customerName={detayMod ? musteriAdi : undefined}
        totals={totals}
        allCustomers={!detayMod}
      />

      {detayMod ? (
        <div className="space-y-6">
          <div className="flex justify-end no-print">
            <Link
              href={`/raporlar/musteri/yazdir?ad=${encodeURIComponent(musteriAdi)}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] shadow-sm transition-colors hover:bg-[var(--accent)]"
            >
              <Printer className="h-3.5 w-3.5" />
              Ekstre Yazdır / PDF
            </Link>
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Satış Bilgileri</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Excel satış tablosu — ürün, tarih, KDV, peşin ve raf kolonları
              </p>
            </div>
            <MusteriSatisTable rows={satisRows} urunler={urunAdlari} musteriler={musteriSecenekleri} />
          </div>
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight">Tahsilatlar</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Müşteri tahsilat kayıtları — gün, müşteri ve tutar
              </p>
            </div>
            <MusteriTahsilatTable rows={tahsilatRows} musteriler={musteriSecenekleri} />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">Tüm Müşteriler</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Cari bazında satış, tahsilat ve alacak özeti — detay için müşteri seçin
            </p>
          </div>
          <MusteriListeTable rows={listeRows} />
        </div>
      )}
    </PageShell>
  );
}
