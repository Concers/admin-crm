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
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Kadim ERP</p>
            <p className="text-sm text-blue-100">Firma yönetim paneli</p>
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            Stok, gider ve satışlarınızı tek yerden yönetin
          </h2>
          <p className="text-blue-100/90 leading-relaxed">
            Excel kayıtlarınızın dijital karşılığı. Gider girişi, alım-satış, raporlar ve
            belgeler — hepsi güvenli ve düzenli.
          </p>
        </div>
        <p className="text-xs text-blue-200/70">© Kadim Naturel</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Kadim ERP</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Devam etmek için giriş yapın
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Hoş geldiniz</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Hesabınıza giriş yapın
            </p>
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
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
