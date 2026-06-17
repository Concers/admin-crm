"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import type { UserRole } from "@/lib/roles";

/**
 * Renders the authenticated app chrome (sidebar + content). The login page is
 * full-screen and chrome-less, so we bypass the sidebar there.
 */
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

  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
