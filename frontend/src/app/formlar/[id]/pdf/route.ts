// Form PDF proxy — backend-generated PDF with the session token.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${API_URL}/forms/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "pdf_failed" }, { status: res.status });

  const body = Buffer.from(await res.arrayBuffer());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="form-${id}.pdf"`,
    },
  });
}
