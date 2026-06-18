"use server";

import { revalidatePath } from "next/cache";
import { createWarehouse, deleteWarehouse, updateWarehouse } from "@/lib/api";

function trim(val: FormDataEntryValue | null) {
  return typeof val === "string" ? val.trim() : "";
}

function buildPayload(formData: FormData) {
  const name = trim(formData.get("name"));
  const location = trim(formData.get("location")) || null;
  if (!name) return { error: "Depo adı zorunludur." as const };
  return { body: { name, location } };
}

export async function createDepo(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createWarehouse(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Depo kaydedilemedi." };
  }

  revalidatePath("/depolar");
  revalidatePath("/stok-hareketleri");
}

export async function updateDepo(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateWarehouse(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Depo güncellenemedi." };
  }

  revalidatePath("/depolar");
  revalidatePath("/stok-hareketleri");
}

export async function deleteDepo(id: number) {
  await deleteWarehouse(id);
  revalidatePath("/depolar");
  revalidatePath("/stok-hareketleri");
}

/** @deprecated use createDepo */
export async function createWarehouseAction(formData: FormData) {
  const result = await createDepo(formData);
  if (result?.error) throw new Error(result.error);
}

/** @deprecated use deleteDepo */
export async function deleteWarehouseAction(id: number) {
  return deleteDepo(id);
}
