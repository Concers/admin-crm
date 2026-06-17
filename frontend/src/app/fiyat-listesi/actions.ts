"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createPriceList } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

type Item = { productId: number; price: number };

function parseItems(raw: FormDataEntryValue | null): Item[] {
  try {
    const arr = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((i) => ({ productId: Number(i.productId), price: Number(i.price) }))
      .filter((i) => i.productId > 0 && i.price > 0);
  } catch {
    return [];
  }
}

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

export async function createPriceListAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim() || "TRY";
  const items = parseItems(formData.get("items"));

  if (!name || items.length === 0) {
    throw new Error("Geçersiz fiyat listesi bilgisi.");
  }

  await createPriceList({ name, currency, items });
  revalidatePath("/fiyat-listesi");
}

export async function deletePriceListAction(id: number) {
  await apiDelete(`/price-lists/${id}`);
  revalidatePath("/fiyat-listesi");
}
