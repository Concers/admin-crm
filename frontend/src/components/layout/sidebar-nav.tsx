"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/roles";
import { getNavSections, type NavItem } from "@/lib/navigation";

function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: NavItem["icon"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavSection({
  title,
  items,
  defaultOpen = true,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const hasActive = items.some(
    (i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href))
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

  if (items.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60"
      >
        {title}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-0.5">
          {items.map((item) => (
            <NavLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  role,
  onNavigate,
  className,
}: {
  role: UserRole | null;
  onNavigate?: () => void;
  className?: string;
}) {
  const sections = getNavSections(role);

  return (
    <nav className={cn("space-y-4", className)}>
      <div className="space-y-0.5">
        <NavLink href="/" label="Genel Bakış" icon={LayoutDashboard} onNavigate={onNavigate} />
        <NavLink href="/rehber" label="Başlangıç Rehberi" icon={BookOpen} onNavigate={onNavigate} />
      </div>
      {sections.map((section) => (
        <NavSection
          key={section.title}
          title={section.title}
          items={section.items}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
