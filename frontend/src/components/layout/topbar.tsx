"use client";

import { MobileNav } from "./mobile-nav";
import { useLayoutSession } from "./layout-context";
import { ROLE_LABELS } from "@/lib/roles";

export function Topbar({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { role, userName } = useLayoutSession();
  const initials = (userName ?? "K")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <MobileNav />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="hidden truncate text-sm text-[var(--muted-foreground)] sm:block">
              {description}
            </p>
          )}
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{userName ?? "Kullanıcı"}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {role ? ROLE_LABELS[role] : ""}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-[var(--primary-foreground)]">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
