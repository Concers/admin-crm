"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { LayoutProvider } from "./layout-context";
import type { UserRole } from "@/lib/roles";

export function AppShell({
  role,
  userName,
  children,
}: {
  role: UserRole | null;
  userName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Giriş, yazdırma ve (oturum yokken) tanıtım sayfası panel kabuğu olmadan çıkar.
  if (pathname === "/login" || pathname.includes("/yazdir")) return <>{children}</>;
  if (pathname === "/" && role === null) return <>{children}</>;

  return (
    <LayoutProvider role={role} userName={userName}>
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar role={role} userName={userName} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </LayoutProvider>
  );
}
