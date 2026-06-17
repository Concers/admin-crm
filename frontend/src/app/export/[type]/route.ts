// CSV export proxy. The session token is an httpOnly cookie on the frontend
// origin, so a browser <a download> to the backend (different port) can't carry
// it. This route reads the cookie, fetches the backend CSV with a Bearer header
// and streams it back as a download.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

const ALLOWED: Record<string, string> = {
  sales: "satislar.csv",
  purchases: "alimlar.csv",
  expenses: "giderler.csv",
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const filename = ALLOWED[type];
  if (!filename) return NextResponse.json({ error: "unknown_export" }, { status: 404 });

  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${API_URL}/export/${type}.csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "export_failed" }, { status: res.status });

  const body = await res.text();
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
