"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { QuoraMark } from "@/components/brand/quora-mark";
import { Button } from "@/components/ui/button";
import { useLayoutSession } from "./layout-context";
import { SidebarFooter } from "./sidebar";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { role, userName } = useLayoutSession();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(300px,88vw)] flex-col bg-[var(--card)] shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <QuoraMark className="h-4.5 w-4.5" />
                </div>
                <span className="font-semibold">Quora</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarNav role={role} onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter role={role} userName={userName} />
          </div>
        </div>
      )}
    </>
  );
}
