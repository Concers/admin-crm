import {
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
  ClipboardList,
  FileText,
  Undo2,
  Warehouse,
  History,
  BarChart3,
  LayoutGrid,
  Target,
  Banknote,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const giris: NavItem[] = [
  { href: "/tanimlama", label: "Tanımlama", icon: Database, roles: ["ADMIN"] },
  { href: "/gider-girisi", label: "Gider Girişi", icon: Receipt, roles: ["ADMIN"] },
  { href: "/urun-alim", label: "Ürün Alım", icon: ShoppingCart, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/urun-satis", label: "Ürün Satış", icon: TrendingUp, roles: ["ADMIN", "SALES_REP"] },
  { href: "/tedarikci-odeme", label: "Tedarikçi Ödeme", icon: CreditCard, roles: ["ADMIN"] },
  { href: "/musteri-tahsilat", label: "Müşteri Tahsilat", icon: Wallet, roles: ["ADMIN", "SALES_REP"] },
  { href: "/kasa-banka", label: "Kasa / Banka", icon: Wallet, roles: ["ADMIN"] },
  { href: "/finans/cek-senet", label: "Çek / Senet", icon: Banknote, roles: ["ADMIN"] },
  { href: "/urun-detay", label: "Ürün Detay", icon: PackageSearch, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/materyal", label: "Materyal Detay", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
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
  { href: "/raf-takibi", label: "Raf Takibi", icon: LayoutGrid, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/stok-hareketleri", label: "Stok Hareketleri", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/depolar", label: "Depolar", icon: Warehouse, roles: ["ADMIN"] },
];

const uretimFiyat: NavItem[] = [
  { href: "/uretim-recetesi", label: "Ürün Reçetesi", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/uretim-emri", label: "Üretim Emri", icon: ClipboardList, roles: ["ADMIN"] },
  { href: "/tedarik-emri", label: "Tedarik Emri", icon: Truck, roles: ["ADMIN"] },
  { href: "/talep-formu", label: "Talep Formları", icon: FileText, roles: ["ADMIN"] },
  { href: "/fiyat-listesi", label: "Fiyat Listesi", icon: FileText, roles: ["ADMIN"] },
  { href: "/iskontolar", label: "İskontolar", icon: FileText, roles: ["ADMIN"] },
];

const raporlar: NavItem[] = [
  { href: "/raporlar/gider", label: "Gider Raporu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/gelir-gider", label: "Gelir-Gider", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/income-statement", label: "Gelir Tablosu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/vat", label: "KDV Beyanı", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/aging", label: "Alacak Durumu", icon: FileBarChart, roles: ["ADMIN"] },
  { href: "/raporlar/stok", label: "Stok Raporu", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/raporlar/dusuk-stok", label: "Düşük Stok", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/raporlar/stok-hareket", label: "Stok Hareket Dökümü", icon: Boxes, roles: ["ADMIN", "WAREHOUSE_MANAGER"] },
  { href: "/raporlar/urun", label: "Ürün Raporu", icon: Boxes, roles: ["ADMIN"] },
  { href: "/raporlar/tedarikci", label: "Tedarikçi Raporu", icon: Truck, roles: ["ADMIN"] },
  { href: "/raporlar/musteri", label: "Müşteri Raporu", icon: Users, roles: ["ADMIN"] },
  { href: "/raporlar/tedarikci-borc", label: "Tedarikçi Borç", icon: Truck, roles: ["ADMIN"] },
  { href: "/raporlar/musteri-alacak", label: "Müşteri Alacak", icon: Users, roles: ["ADMIN"] },
];

const analizler: NavItem[] = [
  { href: "/raporlar/abc", label: "ABC Analizi", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/olu-stok", label: "Ölü Stok", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/musteri-karlilik", label: "Müşteri Kârlılık", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/gider-merkezi", label: "Gider Merkezi", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/nakit-akis", label: "Nakit Akış", icon: BarChart3, roles: ["ADMIN"] },
  { href: "/raporlar/butce", label: "Bütçe vs Gerçekleşen", icon: Target, roles: ["ADMIN"] },
  { href: "/raporlar/kur-farki", label: "Kur Farkı", icon: Globe2, roles: ["ADMIN"] },
  { href: "/raporlar/maliyet-gecmisi", label: "Maliyet Geçmişi", icon: History, roles: ["ADMIN"] },
  { href: "/raporlar/satis-temsilcisi", label: "Satış Temsilcisi", icon: BarChart3, roles: ["ADMIN"] },
];

const sistem: NavItem[] = [
  { href: "/kullanicilar", label: "Kullanıcılar", icon: Users, roles: ["ADMIN"] },
  { href: "/donem-kapatma", label: "Dönem Kapatma", icon: History, roles: ["ADMIN"] },
  { href: "/islem-gecmisi", label: "İşlem Geçmişi", icon: History, roles: ["ADMIN"] },
];

const SECTIONS = [
  { title: "Giriş", items: giris },
  { title: "Belgeler", items: belgeler },
  { title: "Stok & Kasa", items: stokKasa },
  { title: "Üretim & Fiyat", items: uretimFiyat },
  { title: "Raporlar", items: raporlar },
  { title: "Analizler", items: analizler },
  { title: "Sistem", items: sistem },
];

function visibleFor(items: NavItem[], role: UserRole | null): NavItem[] {
  if (!role) return [];
  if (role === "ADMIN") return items;
  return items.filter((i) => i.roles.includes(role));
}

export function getNavSections(role: UserRole | null) {
  return SECTIONS.map((s) => ({
    title: s.title,
    items: visibleFor(s.items, role),
  })).filter((s) => s.items.length > 0);
}
