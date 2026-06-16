import Link from "next/link";
import {
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatCurrency as fc } from "@/lib/calculations";
import { getDashboardStats } from "@/lib/reports";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const sonGiderler = await prisma.giderGirisi.findMany({
    orderBy: { tarih: "desc" },
    take: 5,
  });
  const sonSatislar = await prisma.urunSatis.findMany({
    orderBy: { tarih: "desc" },
    take: 5,
  });

  const cards = [
    { label: "Toplam Satış (KDV Dahil)", value: fc(stats.toplamSatis), icon: TrendingUp, up: true },
    { label: "Toplam Gider", value: fc(stats.toplamGider), icon: Receipt, up: false },
    { label: "Toplam Alım (KDV Dahil)", value: fc(stats.toplamAlim), icon: ShoppingCart, up: false },
    { label: "Ürün / Tedarikçi", value: `${stats.urunSayisi} / ${stats.tedarikciSayisi}`, icon: Wallet, up: null },
  ];

  return (
    <PageShell title="Genel Bakış">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">{c.label}</p>
                  <p className="mt-1 text-xl font-semibold">{c.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <h3 className="font-semibold">Son Giderler</h3>
              <Link href="/gider-girisi" className="text-sm text-[var(--primary)] hover:underline">
                Tümü
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {sonGiderler.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{g.giderTuru}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatDate(g.tarih)} · {g.giderKategori}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-red-600">
                    <ArrowDownRight className="h-4 w-4" />
                    {formatCurrency(g.pesinOdenen)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <h3 className="font-semibold">Son Satışlar</h3>
              <Link href="/urun-satis" className="text-sm text-[var(--primary)] hover:underline">
                Tümü
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {sonSatislar.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{s.urunAdi}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {s.musteri} · {formatDate(s.tarih)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    {formatCurrency(s.kdvDahilTutar)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
