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
  LogOut,
  ClipboardList,
  FileText,
  Undo2,
  Warehouse,
  History,
  BarChart3,
  KeyRound,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import { logout } from "@/app/login/actions";

type Role = UserRole;

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[]; // roles allowed to see the item (ADMIN always sees everything)
}

const ALL: Role[] = ["ADMIN", "SALES_REP", "WAREHOUSE_MANAGER"];

const giris: NavItem[] = [
  { href: "/tanimlama", label: "Tanımlama", icon: Database, roles: ["ADMIN"] },
  { href: "/gider-girisi", label: "Gider Girişi", icon: Receipt, roles: ["ADMIN"] },
  { href: "/urun-alim", label: "Ürün Alım Giriş", icon: ShoppingCart, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/urun-satis", label: "Ürün Satış Giriş", icon: TrendingUp, roles: ["ADMIN", "SALES_REP"] },
  { href: "/tedarikci-odeme", label: "Tedarikçi Ödeme", icon: CreditCard, roles: ["ADMIN"] },
  { href: "/musteri-tahsilat", label: "Müşteri Tahsilat", icon: Wallet, roles: ["ADMIN", "SALES_REP"] },
  { href: "/yeni-urun-takip", label: "Yeni Ürün Takip", icon: PackageSearch, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
];

const belgeler: NavItem[] = [
  { href: "/belgeler/siparis", label: "Siparişler", icon: ClipboardList, roles: ["ADMIN", "SALES_REP"] },
  { href: "/belgeler/teklif", label: "Teklifler", icon: FileText, roles: ["ADMIN", "SALES_REP"] },
  { href: "/belgeler/fatura", label: "Faturalar", icon: FileText, roles: ["ADMIN"] },
  { href: "/belgeler/iade", label: "İadeler", icon: Undo2, roles: ["ADMIN"] },
  { href: "/mutabakat", label: "Ödeme Mutabakatı", icon: Wallet, roles: ["ADMIN"] },
];

const stokKasa: NavItem[] = [
  { href: "/stok-hareketleri", label: "Stok Hareketleri", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/depolar", label: "Depolar", icon: Warehouse, roles: ["ADMIN"] },
];

const uretimFiyat: NavItem[] = [
  { href: "/uretim-recetesi", label: "Ürün Reçetesi (BOM)", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/uretim-emri", label: "Üretim Emri", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/fiyat-listesi", label: "Fiyat Listesi", icon: FileText, roles: ["ADMIN"] },
  { href: "/iskontolar", label: "İskontolar", icon: FileText, roles: ["ADMIN"] },
];

const raporlar: NavItem[] = [
  { href: "/raporlar/gider", label: "Gider Raporu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/gelir-gider", label: "Gelir-Gider Raporu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/income-statement", label: "Gelir Tablosu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/vat", label: "KDV Beyanı", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/aging", label: "Alacak Durum Raporu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/stok", label: "Stok Raporu", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/raporlar/dusuk-stok", label: "Düşük Stok", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/raporlar/stok-hareket", label: "Stok Hareket Dökümü", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/raporlar/urun", label: "Ürün Raporu", icon: Boxes, roles: ["ADMIN"] },
  { href: "/raporlar/tedarikci", label: "Tedarikçi Raporu", icon: Truck, roles: ["ADMIN"] },
  { href: "/raporlar/musteri", label: "Müşteri Raporu", icon: Users, roles: ["ADMIN"] },
  { href: "/raporlar/tedarikci-borc", label: "Tedarikçi Borç Listesi", icon: Truck, roles: ["ADMIN"] },
  { href: "/raporlar/musteri-alacak", label: "Müşteri Alacak Listesi", icon: Users, roles: ["ADMIN"] },
];

const analizler: NavItem[] = [
  { href: "/raporlar/abc", label: "ABC Analizi", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/olu-stok", label: "Ölü Stok", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/musteri-karlilik", label: "Müşteri Kârlılık", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/gider-merkezi", label: "Gider Merkezi", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/nakit-akis", label: "Nakit Akış Projeksiyonu", icon: BarChart3, roles: ["ADMIN"] },
];

const sistem: NavItem[] = [
  { href: "/kullanicilar", label: "Kullanıcılar", icon: Users, roles: ["ADMIN"] },
  { href: "/islem-gecmisi", label: "İşlem Geçmişi", icon: History, roles: ["ADMIN"] },
];

function visibleFor(items: NavItem[], role: Role | null): NavItem[] {
  if (!role) return [];
  if (role === "ADMIN") return items;
  return items.filter((i) => i.roles.includes(role));
}

function NavLink({ href, label, icon: Icon }: Omit<NavItem, "roles">) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--accent)] text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{title}</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ role, userName }: { role: Role | null; userName: string | null }) {
  const girisItems = visibleFor(giris, role);
  const belgeItems = visibleFor(belgeler, role);
  const stokItems = visibleFor(stokKasa, role);
  const uretimItems = visibleFor(uretimFiyat, role);
  const raporItems = visibleFor(raporlar, role);
  const analizItems = visibleFor(analizler, role);
  const sistemItems = visibleFor(sistem, role);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Kadim ERP</span>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <NavLink href="/" label="Genel Bakış" icon={LayoutDashboard} />
        <NavLink href="/rehber" label="Başlangıç Rehberi" icon={BookOpen} />
        <NavSection title="Giriş" items={girisItems} />
        <NavSection title="Belgeler" items={belgeItems} />
        <NavSection title="Stok & Kasa" items={stokItems} />
        <NavSection title="Üretim & Fiyat" items={uretimItems} />
        <NavSection title="Raporlar" items={raporItems} />
        <NavSection title="Analizler" items={analizItems} />
        <NavSection title="Sistem" items={sistemItems} />
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="px-2 pb-2">
          <p className="truncate text-sm font-medium">{userName ?? "Kullanıcı"}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{role ? ROLE_LABELS[role] : ""}</p>
        </div>
        <NavLink href="/sifre-degistir" label="Şifre Değiştir" icon={KeyRound} />
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Çıkış Yap</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
