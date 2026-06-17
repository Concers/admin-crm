"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createBom } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

/** Authed DELETE mirroring src/lib/api.ts (no deleteBom helper is exported). */
async function apiDelete(path: string) {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE ${path} failed: ${res.status}`);
  }
}

type Comp = { componentProductId: number; quantity: number };

function parseComponents(raw: FormDataEntryValue | null): Comp[] {
  try {
    const arr = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((c) => ({
        componentProductId: Number(c.componentProductId),
        quantity: Number(c.quantity),
      }))
      .filter((c) => c.componentProductId > 0 && c.quantity > 0);
  } catch {
    return [];
  }
}

export async function createBomAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const productId = Number(formData.get("productId"));
  const components = parseComponents(formData.get("components"));

  if (!name || !productId || components.length === 0) {
    throw new Error("Geçersiz reçete bilgisi.");
  }

  await createBom({ productId, name, components });
  revalidatePath("/uretim-recetesi");
}

export async function deleteBomAction(id: number) {
  await apiDelete(`/boms/${id}`);
  revalidatePath("/uretim-recetesi");
}
