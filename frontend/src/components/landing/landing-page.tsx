// Tanıtım (landing) sayfası. Oturum açılmamış ziyaretçi kök adrese geldiğinde
// `app/page.tsx` bunu render eder. Sunucu bileşeni — istemci JS'i yok, hareket
// tamamen CSS ile (globals.css → `.qr-*`).

import Link from "next/link";
import { ArrowRight, BarChart3, Download, FileText, ShieldCheck, Upload, Users } from "lucide-react";
import { PanelMockup } from "@/components/brand/panel-mockup";
import { QuoraMark } from "@/components/brand/quora-mark";
import { FLOW, ROLES, SCREEN_COUNT, WALL } from "./landing-content";

const FEATURES = [
  { icon: BarChart3, title: "Canlı Raporlama", detail: "Gelir tablosu, KDV ve stok raporları aynı veriden anlık üretilir." },
  { icon: ShieldCheck, title: "Güvenli Altyapı", detail: "Şifreli oturum çerezi; yetki hem panelde hem API tarafında denetlenir." },
  { icon: Users, title: "Rol Bazlı Yetki", detail: "Yönetici, depo ve satış rolleri yalnızca kendi ekranlarını görür." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#8B6A22]">{children}</p>
  );
}

export function LandingPage() {
  return (
    <main className="qr-canvas min-h-screen text-[#261515]">
      {/* ---------------------------------------------------------------- */}
      {/* Üst çubuk */}
      {/* ---------------------------------------------------------------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-[0_10px_22px_-12px_rgba(89,2,25,0.9)]">
            <QuoraMark className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xl font-bold leading-none tracking-[-0.03em]">Quora</span>
            <span className="mt-1 block text-[0.72rem] text-[#8c6c7e]">İşletme Yönetim Sistemi</span>
          </span>
        </div>
        <Link
          href="/login"
          className="qr-focus inline-flex h-11 items-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(89,2,25,0.95)] transition-colors hover:bg-[#6d0620]"
        >
          Giriş Yap
        </Link>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pt-14">
        <div>
          <div className="qr-rise" style={{ animationDelay: "40ms" }}>
            <Eyebrow>Tek platform · {WALL.length} bölüm · {SCREEN_COUNT} ekran</Eyebrow>
          </div>
          <h1
            className="qr-rise mt-5 text-[clamp(2.3rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.04em]"
            style={{ animationDelay: "120ms" }}
          >
            İşinizi kolaylaştırın,
            <br />
            <span className="text-[var(--primary)]">verimliliğinizi artırın.</span>
          </h1>
          <p
            className="qr-rise mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[#7a6470]"
            style={{ animationDelay: "200ms" }}
          >
            Stok, üretim, cari hesaplar, belgeler ve finans tek platformda. Alımdan üretime, raf
            yerleşiminden tahsilata kadar günlük kayıtlar aynı yerde durur.
          </p>

          <div className="qr-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "280ms" }}>
            <Link
              href="/login"
              className="qr-focus group inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(89,2,25,0.95)] transition-colors hover:bg-[#6d0620]"
            >
              Panele giriş yap
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#moduller"
              className="qr-focus inline-flex h-12 items-center rounded-xl border border-[#261515]/12 bg-white px-6 text-sm font-medium text-[#261515] transition-colors hover:border-[#261515]/25"
            >
              Modülleri gör
            </a>
          </div>
        </div>

        <div className="qr-rise" style={{ animationDelay: "360ms" }}>
          <div className="qr-card overflow-hidden rounded-3xl bg-white p-3 sm:p-4">
            <PanelMockup className="w-full" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Üç sütun — ürünün temel iddiaları */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="rounded-2xl border border-[#261515]/8 bg-white p-6 shadow-[0_18px_40px_-32px_rgba(38,21,21,0.6)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF3EA]">
                <Icon className="h-5 w-5 text-[var(--primary)]" />
              </span>
              <p className="mt-4 text-base font-semibold">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#8c6c7e]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Modül duvarı */}
      {/* ---------------------------------------------------------------- */}
      <section id="moduller" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-20">
        <Eyebrow>Modüller</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-[clamp(1.6rem,3.2vw,2.3rem)] font-bold leading-tight tracking-[-0.03em]">
          Menüde ne varsa, <span className="text-[var(--primary)]">burada o var.</span>
        </h2>

        <div className="qr-wall mt-9">
          {WALL.map((cell, i) => (
            <div key={cell.code} className="qr-cell qr-rise" style={{ animationDelay: `${120 + i * 60}ms` }}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[0.68rem] tracking-[0.2em] text-[#8B6A22]">{cell.code}</span>
                <span className="font-mono text-[0.68rem] text-[#8c6c7e]">{cell.count} ekran</span>
              </div>
              <p className="mt-3 text-[0.95rem] font-semibold">{cell.title}</p>
              <p className="mt-1.5 text-[0.78rem] leading-snug text-[#8c6c7e]">{cell.detail}</p>
            </div>
          ))}
          <div className="qr-cell qr-cell-lit qr-rise" style={{ animationDelay: `${120 + WALL.length * 60}ms` }}>
            <span className="font-mono text-[0.68rem] tracking-[0.2em] text-[#E7C97F]">∑</span>
            <p className="mt-3 text-[0.95rem] font-semibold text-white">{SCREEN_COUNT} ekran</p>
            <p className="mt-1.5 text-[0.78rem] leading-snug text-white/70">Hepsi aynı veriden beslenir</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Bir günün akışı — sıra gerçek bir zinciri anlatıyor */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-[#261515]/8 bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Bir günün akışı</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-[clamp(1.6rem,3.2vw,2.3rem)] font-bold leading-tight tracking-[-0.03em]">
            Kayıt bir kez girilir,{" "}
            <span className="text-[var(--primary)]">sonuna kadar takip edilir.</span>
          </h2>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#261515]/10 bg-[#261515]/10 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((item) => (
              <li key={item.step} className="qr-step bg-white p-6">
                <span className="font-mono text-[0.68rem] tracking-[0.2em] text-[#8B6A22]">{item.step}</span>
                <p className="mt-3 text-base font-semibold">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#8c6c7e]">{item.detail}</p>
              </li>
            ))}
          </ol>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#7a6470]">
            Gelir tablosu, KDV beyanı ve alacak yaşlandırması ayrı bir çalışma gerektirmez — hepsi bu
            zincirin bıraktığı kayıtlardan üretilir.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Roller + çıktılar */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Eyebrow>Roller</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-[clamp(1.6rem,3.2vw,2.3rem)] font-bold leading-tight tracking-[-0.03em]">
          Herkes <span className="text-[var(--primary)]">yalnızca kendi işini</span> görür.
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="rounded-2xl border border-[#261515]/8 bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(38,21,21,0.55)]"
            >
              <div className="h-px w-10 bg-[#BF8F36]" />
              <p className="mt-5 text-base font-semibold">{role.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#8c6c7e]">{role.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-[#261515]/10 pt-12 md:grid-cols-3">
          <div>
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            <p className="mt-4 text-base font-semibold">Belgeler sistemden çıkar</p>
            <p className="mt-2 text-sm leading-relaxed text-[#8c6c7e]">
              Teklif, sipariş, fatura, iade, talep formu ve cari ekstre — Türkçe karakterleriyle
              birlikte PDF olarak.
            </p>
          </div>
          <div>
            <Download className="h-5 w-5 text-[var(--green)]" />
            <p className="mt-4 text-base font-semibold">Dışa aktarım</p>
            <p className="mt-2 text-sm leading-relaxed text-[#8c6c7e]">
              Listeleri XLSX, CSV, XML, Word veya PDF olarak indirin; muhasebeye olduğu gibi gider.
            </p>
          </div>
          <div>
            <Upload className="h-5 w-5 text-[#8B6A22]" />
            <p className="mt-4 text-base font-semibold">İçe aktarım</p>
            <p className="mt-2 text-sm leading-relaxed text-[#8c6c7e]">
              Mevcut XLSX, CSV ve XML dosyalarınızı yükleyin; kaydetmeden önce satır satır önizleyin.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Kapanış */}
      {/* ---------------------------------------------------------------- */}
      <footer className="qr-ink">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="max-w-md text-[clamp(1.4rem,2.8vw,2rem)] font-bold leading-tight tracking-[-0.03em] text-white">
                Hesabınız hazırsa, panel sizi bekliyor.
              </h2>
              <p className="mt-3 text-sm text-white/65">Hesap açma yetkisi yöneticidedir.</p>
            </div>
            <Link
              href="/login"
              className="qr-focus group inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#BF8F36] px-6 text-sm font-semibold text-[#261515] transition-colors hover:bg-[#CFA853]"
            >
              Giriş yap
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <QuoraMark className="h-5 w-5 text-[#BF8F36]" />
              <span className="text-sm font-medium text-white/75">Quora</span>
            </div>
            <p className="text-[0.72rem] text-white/50">© 2026 Quora · Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
