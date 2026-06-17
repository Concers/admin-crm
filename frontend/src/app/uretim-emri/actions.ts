"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createProductionOrder } from "@/lib/api";

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

export async function createProductionOrderAction(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));
  const status = String(formData.get("status") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!productId || !quantity) {
    throw new Error("Geçersiz üretim emri bilgisi.");
  }

  await createProductionOrder({
    productId,
    quantity,
    status: status || "PLANNED",
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    notes: notes || undefined,
  });
  revalidatePath("/uretim-emri");
}

export async function deleteProductionOrderAction(id: number) {
  await apiDelete(`/production-orders/${id}`);
  revalidatePath("/uretim-emri");
}
