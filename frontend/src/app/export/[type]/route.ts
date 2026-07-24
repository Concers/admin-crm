// Multi-format export proxy. The session token is an httpOnly cookie on the
// frontend origin, so a browser <a download> to the backend (different port)
// can't carry it. This route reads the cookie, fetches the backend export in
// the requested format (csv | xlsx | xml | doc) with a Bearer header and
// streams it back as a download with the right MIME + extension.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

const ALLOWED: Record<string, string> = {
  sales: "satislar",
  purchases: "alimlar",
  expenses: "giderler",
};

const FORMATS: Record<string, { mime: string; ext: string; binary: boolean }> = {
  csv: { mime: "text/csv; charset=utf-8", ext: "csv", binary: false },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: "xlsx",
    binary: true,
  },
  xml: { mime: "application/xml; charset=utf-8", ext: "xml", binary: false },
  doc: { mime: "application/msword", ext: "doc", binary: false },
  pdf: { mime: "application/pdf", ext: "pdf", binary: true },
};

export async function GET(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const base = ALLOWED[type];
  if (!base) return NextResponse.json({ error: "unknown_export" }, { status: 404 });

  const fmtParam = (req.nextUrl.searchParams.get("format") ?? "csv").toLowerCase();
  const fmt = FORMATS[fmtParam] ?? FORMATS.csv;

  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${API_URL}/export/${type}?format=${fmtParam}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "export_failed" }, { status: res.status });

  const body = fmt.binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
  return new NextResponse(body, {
    headers: {
      "Content-Type": fmt.mime,
      "Content-Disposition": `attachment; filename="${base}.${fmt.ext}"`,
    },
  });
}
