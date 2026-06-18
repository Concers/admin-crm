"use server";

import { revalidatePath } from "next/cache";
import { createBom, deleteBom, updateBom } from "@/lib/api";

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

function buildPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const productId = Number(formData.get("productId"));
  const components = parseComponents(formData.get("components"));
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (!name || !productId || components.length === 0) {
    return { error: "Reçete adı, mamul ve en az bir bileşen zorunludur." as const };
  }

  return { body: { name, productId, components, isActive } };
}

export async function createRecete(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createBom(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Reçete kaydedilemedi." };
  }

  revalidatePath("/uretim-recetesi");
  revalidatePath("/uretim-emri");
}

export async function updateRecete(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateBom(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Reçete güncellenemedi." };
  }

  revalidatePath("/uretim-recetesi");
  revalidatePath("/uretim-emri");
}

export async function deleteRecete(id: number) {
  await deleteBom(id);
  revalidatePath("/uretim-recetesi");
  revalidatePath("/uretim-emri");
}

/** @deprecated use createRecete */
export async function createBomAction(formData: FormData) {
  const result = await createRecete(formData);
  if (result?.error) throw new Error(result.error);
}

/** @deprecated use deleteRecete */
export async function deleteBomAction(id: number) {
  return deleteRecete(id);
}
