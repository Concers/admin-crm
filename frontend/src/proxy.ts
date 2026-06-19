import { NextResponse, type NextRequest } from "next/server";

/** Decode a JWT payload in the edge runtime (no verification — UX routing only). */
function decodeRole(token: string): string | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(part);
    return (JSON.parse(json) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

// Route prefixes → roles allowed to view them (backend enforces too; this is
// just UX so users don't land on pages that would 403). ADMIN sees everything.
const STOCK_ROLES = ["ADMIN", "WAREHOUSE_MANAGER"];
const SALES_ROLES = ["ADMIN", "SALES_REP"];
const ROUTE_ROLES: { prefix: string; roles: string[] }[] = [
  { prefix: "/raporlar/stok", roles: STOCK_ROLES },
  { prefix: "/raporlar/dusuk-stok", roles: STOCK_ROLES },
  { prefix: "/raporlar/stok-hareket", roles: STOCK_ROLES },
  { prefix: "/raporlar", roles: ["ADMIN"] },
  { prefix: "/belgeler/siparis", roles: SALES_ROLES },
  { prefix: "/belgeler/teklif", roles: SALES_ROLES },
  { prefix: "/belgeler", roles: ["ADMIN"] },
  { prefix: "/mutabakat", roles: ["ADMIN"] },
  { prefix: "/raf-takibi", roles: STOCK_ROLES },
  { prefix: "/stok-hareketleri", roles: STOCK_ROLES },
  { prefix: "/depolar", roles: ["ADMIN"] },
  { prefix: "/kasa-banka", roles: ["ADMIN"] },
  { prefix: "/finans", roles: ["ADMIN"] },
  { prefix: "/donem-kapatma", roles: ["ADMIN"] },
  { prefix: "/kullanicilar", roles: ["ADMIN"] },
  { prefix: "/islem-gecmisi", roles: ["ADMIN"] },
  { prefix: "/uretim-recetesi", roles: ["ADMIN"] },
  { prefix: "/uretim-emri", roles: ["ADMIN"] },
  { prefix: "/fiyat-listesi", roles: ["ADMIN"] },
  { prefix: "/iskontolar", roles: ["ADMIN"] },
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Unauthenticated → login.
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-gate by the most specific matching prefix.
  const match = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  if (match) {
    const role = decodeRole(token);
    if (!role || !match.roles.includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Protect everything except the login page, Next internals and static assets.
export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
