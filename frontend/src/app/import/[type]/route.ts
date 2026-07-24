// Import proxy. Forwards a multipart upload (file) to the backend import
// endpoint with the session token as a Bearer header. `commit=true` commits;
// otherwise the backend returns a side-effect-free preview.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

const ALLOWED = new Set(["sales", "purchases", "expenses"]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  if (!ALLOWED.has(type)) return NextResponse.json({ error: "unknown_import" }, { status: 404 });

  const incoming = await req.formData();
  const file = incoming.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });

  const commit = req.nextUrl.searchParams.get("commit") === "true" ? "?commit=true" : "";
  const forward = new FormData();
  forward.append("file", file, file.name);

  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${API_URL}/import/${type}${commit}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: forward,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({ error: "import_failed" }));
  return NextResponse.json(data, { status: res.status });
}
