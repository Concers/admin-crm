"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, KeyRound } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import { logout } from "@/app/login/actions";
import { SidebarNav } from "./sidebar-nav";
import { TourButton } from "@/components/tour/tour-button";

function UserInitials({ name }: { name: string | null }) {
  const initials = (name ?? "K")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-[var(--primary-foreground)]">
      {initials}
    </div>
  );
}

export function SidebarFooter({ role, userName }: { role: UserRole | null; userName: string | null }) {
  return (
    <div className="border-t border-[var(--border)] bg-[var(--muted)]/30 p-3">
      <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
        <UserInitials name={userName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{userName ?? "Kullanıcı"}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {role ? ROLE_LABELS[role] : ""}
          </p>
        </div>
      </div>
      <TourButton />
      <Link
        href="/sifre-degistir"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <KeyRound className="h-4 w-4" />
        Şifre Değiştir
      </Link>
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </form>
    </div>
  );
}

export function Sidebar({ role, userName }: { role: UserRole | null; userName: string | null }) {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Kadim ERP</p>
          <p className="text-xs text-[var(--muted-foreground)]">Firma Yönetimi</p>
        </div>
      </div>
      <div data-tour="sidebar" className="flex-1 overflow-y-auto p-3">
        <SidebarNav role={role} />
      </div>
      <SidebarFooter role={role} userName={userName} />
    </aside>
  );
}
