import Link from "next/link";
import { ArrowLeft, BarChart3, ShieldCheck, Users } from "lucide-react";
import { PanelMockup } from "@/components/brand/panel-mockup";
import { QuoraMark } from "@/components/brand/quora-mark";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Giriş · Quora",
};

const FEATURES = [
  { icon: BarChart3, label: "Canlı\nRaporlama" },
  { icon: ShieldCheck, label: "Güvenli\nAltyapı" },
  { icon: Users, label: "Rol Bazlı\nYetkilendirme" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;

  return (
    <div className="qr-canvas flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="qr-card w-full max-w-[1120px] overflow-hidden rounded-3xl bg-white">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
          {/* Sol — tanıtım yüzü */}
          <div className="qr-login-aside relative hidden overflow-hidden p-10 pb-[230px] lg:block">
            <Link href="/" className="relative z-10 flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-[0_10px_22px_-12px_rgba(89,2,25,0.9)]">
                <QuoraMark className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-[1.6rem] font-bold leading-none tracking-[-0.03em] text-[#261515]">
                  Quora
                </span>
                <span className="mt-1 block text-[0.78rem] text-[#8c6c7e]">İşletme Yönetim Sistemi</span>
              </span>
            </Link>

            <div className="relative z-10 mt-11">
              <h2 className="text-[1.85rem] font-bold leading-[1.2] tracking-[-0.03em] text-[#261515]">
                İşinizi kolaylaştırın,
                <br />
                verimliliğinizi artırın.
              </h2>
              <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-[#7a6470]">
                Stok, üretim, cari hesaplar, belgeler ve finans — hepsi tek platformda.
              </p>
            </div>

            <div className="relative z-10 mt-9 flex gap-7">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex w-[92px] flex-col items-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_18px_-10px_rgba(38,21,21,0.45)]">
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </span>
                  <span className="mt-2.5 whitespace-pre-line text-[0.72rem] font-medium leading-tight text-[#6f5b66]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Panel önizlemesi — kartın alt kenarından taşarak kırpılır */}
            <div className="pointer-events-none absolute -bottom-10 left-6 right-[-14%] z-0">
              <PanelMockup className="w-full drop-shadow-[0_24px_40px_rgba(38,21,21,0.18)]" />
            </div>
          </div>

          {/* Sağ — form */}
          <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
            <div className="w-full max-w-[380px]">
              <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
                  <QuoraMark className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xl font-bold leading-none tracking-[-0.03em]">Quora</span>
                  <span className="mt-1 block text-[0.72rem] text-[var(--muted-foreground)]">
                    İşletme Yönetim Sistemi
                  </span>
                </span>
              </Link>

              <h1 className="text-[1.65rem] font-bold tracking-[-0.03em] text-[#261515]">Hoş geldiniz</h1>
              <p className="mb-8 mt-1.5 text-sm text-[var(--muted-foreground)]">
                Hesabınıza giriş yaparak devam edin.
              </p>

              <LoginForm expired={expired === "1"} />

              <p className="mt-6 text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
                Şifrenizi unuttuysanız veya hesabınız yoksa yöneticinize başvurun.
              </p>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Tanıtım sayfasına dön
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Kart altı şerit */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#EFE7E1] bg-[#FCFAF8] px-6 py-3.5 text-[0.72rem] text-[var(--muted-foreground)] sm:flex-row sm:px-8">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--green)]" />
            Oturumunuz şifreli çerezde saklanır, 12 saat sonra düşer.
          </span>
          <span>© 2026 Quora · Tüm hakları saklıdır.</span>
        </div>
      </div>
    </div>
  );
}
