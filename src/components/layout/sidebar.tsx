"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Receipt,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Wallet,
  PackageSearch,
  FileBarChart,
  Boxes,
  Users,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const giris = [
  { href: "/tanimlama", label: "Tanımlama", icon: Database },
  { href: "/gider-girisi", label: "Gider Girişi", icon: Receipt },
  { href: "/urun-alim", label: "Ürün Alım Giriş", icon: ShoppingCart },
  { href: "/urun-satis", label: "Ürün Satış Giriş", icon: TrendingUp },
  { href: "/tedarikci-odeme", label: "Tedarikçi Ödeme", icon: CreditCard },
  { href: "/musteri-tahsilat", label: "Müşteri Tahsilat", icon: Wallet },
  { href: "/yeni-urun-takip", label: "Yeni Ürün Takip", icon: PackageSearch },
];

const raporlar = [
  { href: "/raporlar/gider", label: "Gider Raporu", icon: FileBarChart },
  { href: "/raporlar/gelir-gider", label: "Gelir-Gider Raporu", icon: FileBarChart },
  { href: "/raporlar/stok", label: "Stok Raporu", icon: Boxes },
  { href: "/raporlar/urun", label: "Ürün Raporu", icon: Boxes },
  { href: "/raporlar/tedarikci", label: "Tedarikçi Raporu", icon: Truck },
  { href: "/raporlar/musteri", label: "Müşteri Raporu", icon: Users },
  { href: "/raporlar/tedarikci-borc", label: "Tedarikçi Borç Listesi", icon: Truck },
  { href: "/raporlar/musteri-alacak", label: "Müşteri Alacak Listesi", icon: Users },
];

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--accent)] text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Firma Paneli</span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <NavLink href="/" label="Genel Bakış" icon={LayoutDashboard} />
        <div>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Giriş
          </p>
          <div className="space-y-0.5">
            {giris.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Raporlar
          </p>
          <div className="space-y-0.5">
            {raporlar.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
