"use client";

import { useActionState } from "react";
import { LayoutDashboard, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#261515] via-[#590219] to-[#BF8F36] p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(191,143,54,0.35),transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Kadim ERP</p>
            <p className="text-sm text-white/70">Firma yönetim paneli</p>
          </div>
        </div>
        <div className="relative max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            Stok, gider ve satışlarınızı tek yerden yönetin
          </h2>
          <p className="leading-relaxed text-white/75">
            Excel kayıtlarınızın dijital karşılığı. Gider girişi, alım-satış, raporlar ve belgeler — hepsi
            güvenli ve düzenli.
          </p>
        </div>
        <p className="relative text-xs text-white/50">© Kadim Naturel</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[var(--background)] p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Kadim ERP</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Devam etmek için giriş yapın</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-semibold tracking-tight">Hoş geldiniz</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Hesabınıza giriş yapın</p>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="admin@kadim.local"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>
            {state.error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {state.error}
              </div>
            )}
            <Button type="submit" disabled={pending} className="w-full" size="md">
              {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
            Yerel geliştirme: <code className="rounded bg-[var(--muted)] px-1">admin@kadim.local</code> /{" "}
            <code className="rounded bg-[var(--muted)] px-1">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
