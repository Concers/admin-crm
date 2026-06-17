"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createDiscount } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

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

export async function createDiscountAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const percentRaw = Number(formData.get("percent"));
  const amountRaw = Number(formData.get("amount"));
  const validFrom = String(formData.get("validFrom") ?? "").trim();
  const validTo = String(formData.get("validTo") ?? "").trim();

  if (!name) {
    throw new Error("İskonto adı zorunludur.");
  }

  const percent = percentRaw > 0 ? percentRaw : undefined;
  const amount = amountRaw > 0 ? amountRaw : undefined;

  await createDiscount({
    name,
    percent,
    amount,
    validFrom: validFrom || undefined,
    validTo: validTo || undefined,
  });
  revalidatePath("/iskontolar");
}

export async function deleteDiscountAction(id: number) {
  await apiDelete(`/discounts/${id}`);
  revalidatePath("/iskontolar");
}
