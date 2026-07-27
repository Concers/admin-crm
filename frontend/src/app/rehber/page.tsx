import Link from "next/link";
import {
  Database,
  ShoppingCart,
  TrendingUp,
  Wallet,
  CreditCard,
  Boxes,
  FileBarChart,
  ArrowRight,
  CheckCircle2,
  Info,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  what: string; // ne yapılır
  how: string; // arka planda ne olur
  href: string;
  cta: string;
  roles: UserRole[]; // bu adımı kimler uygular (ADMIN her zaman görür)
};

const STEPS: Step[] = [
  {
    icon: Database,
    title: "1. Tanımlamalar",
    what: "Önce ürünleri, carileri (müşteri/tedarikçi) ve gider kategorilerini tanımlarsınız. Sistem bu listelerden besleniyor.",
    how: "Tüm giriş ekranlarındaki açılır menüler bu tanımlardan gelir; böylece 'aynı firmayı farklı yazma' hatası önlenir.",
    href: "/tanimlama",
    cta: "Tanımlama ekranına git",
    roles: ["ADMIN"],
  },
  {
    icon: ShoppingCart,
    title: "2. Ürün Alımı",
    what: "Tedarikçiden gelen malları 'Ürün Alım Giriş'ten kaydedersiniz: ürün, tedarikçi, adet, birim fiyat, KDV.",
    how: "Her alım stoğu artırır ve ürünün ağırlıklı ortalama maliyetini günceller. Bu maliyet satışta kâr hesabında kullanılır.",
    href: "/urun-alim",
    cta: "Alım girişine git",
    roles: ["ADMIN", "WAREHOUSE_MANAGER"],
  },
  {
    icon: TrendingUp,
    title: "3. Ürün Satışı",
    what: "Müşteriye yapılan satışı 'Ürün Satış Giriş'ten kaydedersiniz. Stok yetersizse sistem uyarır.",
    how: "Satış anında birim maliyet (alım + üretim gideri + genel gider payı) ve kâr oranı otomatik hesaplanır; stok düşer.",
    href: "/urun-satis",
    cta: "Satış girişine git",
    roles: ["ADMIN", "SALES_REP"],
  },
  {
    icon: Wallet,
    title: "4. Tahsilat & Ödeme",
    what: "Müşteriden gelen tahsilatları ve tedarikçiye yapılan ödemeleri ilgili ekranlardan girersiniz.",
    how: "Her hareket carinin net bakiyesini günceller; raporlarda kim alacaklı/borçlu anında görünür.",
    href: "/musteri-tahsilat",
    cta: "Tahsilat ekranına git",
    roles: ["ADMIN", "SALES_REP"],
  },
  {
    icon: CreditCard,
    title: "5. Giderler",
    what: "Kira, elektrik, ambalaj gibi giderleri 'Gider Girişi'nden kaydedersiniz. Çok aylık giderlerde periyot girersiniz.",
    how: "Periyot girilirse gider aylara eşit bölünür (amortisman); aylık pay, satışların genel gider maliyetine yansır.",
    href: "/gider-girisi",
    cta: "Gider girişine git",
    roles: ["ADMIN"],
  },
  {
    icon: Boxes,
    title: "6. Stok Hareketleri",
    what: "Alım/satış dışındaki hareketleri (fire, sayım farkı, transfer) 'Stok Hareketleri'nden kaydedersiniz.",
    how: "Bu hareketler de stoğa işler; gerçek stok = alım − satış ± düzeltmeler olarak hesaplanır.",
    href: "/stok-hareketleri",
    cta: "Stok hareketlerine git",
    roles: ["ADMIN", "WAREHOUSE_MANAGER"],
  },
  {
    icon: FileBarChart,
    title: "7. Raporlar & Analizler",
    what: "Gelir-gider, stok, cari bakiye, KDV beyanı ve ABC / müşteri kârlılık / nakit akış gibi analizleri incelersiniz.",
    how: "Tüm raporlar canlı veriden anlık üretilir; tarih/dönem seçerek karşılaştırma yapabilirsiniz.",
    href: "/raporlar/gelir-gider",
    cta: "Raporlara git",
    roles: ["ADMIN"],
  },
];

const ROLE_SUMMARY: Record<UserRole, string> = {
  ADMIN: "Tüm modülleri kullanır; maliyet, kâr ve finansal raporların tamamını görür.",
  SALES_REP: "Satış girişi ve müşteri tahsilatı yapar. Maliyet/kâr ve finansal raporları göremez.",
  WAREHOUSE_MANAGER: "Ürün alımı, stok hareketleri ve stok raporlarını yönetir.",
};

export default async function RehberPage() {
  const session = await getSession();
  const role = session?.role ?? null;

  const visibleSteps = STEPS.filter((s) => !role || role === "ADMIN" || s.roles.includes(role));

  return (
    <PageShell title="Başlangıç Rehberi">
      {/* Hoş geldin */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold">Quora&apos;ya hoş geldiniz{session?.name ? `, ${session.name}` : ""} 👋</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Bu sistem; ürün alım-satışınızı, stoğunuzu, cari hesaplarınızı ve giderlerinizi tek yerden yönetir.
            Excel&apos;de yaptığınız her şeyi otomatik hesaplarla, hatasız ve raporlanabilir biçimde yapar.
            {role ? (
              <>
                {" "}
                Rolünüz: <strong>{ROLE_LABELS[role]}</strong> — {ROLE_SUMMARY[role]}
              </>
            ) : null}
          </p>
        </CardContent>
      </Card>

      {/* Akış mantığı */}
      <Card>
        <CardContent>
          <h3 className="font-semibold">Sistem nasıl çalışır?</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {["Tanımlamalar", "Alım (stok +)", "Satış (stok −, kâr)", "Tahsilat / Ödeme", "Raporlar"].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 font-medium text-[var(--primary)]">{s}</span>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Veriler birbirini besler: bir alım girdiğinizde stok ve maliyet, bir satış girdiğinizde kâr ve cari
            bakiye otomatik güncellenir. Hiçbir şeyi elle hesaplamanız gerekmez.
          </p>
        </CardContent>
      </Card>

      {/* Adımlar */}
      <div className="space-y-4">
        <h3 className="font-semibold">Adım adım nasıl yapılır?</h3>
        {visibleSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{step.title}</h4>
                  <p className="mt-1 text-sm">{step.what}</p>
                  <p className="mt-1 flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <span><strong>Arka planda:</strong> {step.how}</span>
                  </p>
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    {step.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
