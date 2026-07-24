"use server";

import { revalidatePath } from "next/cache";
import { deletePartner, updatePartner } from "@/lib/api";
import { ALL_CARI_KEYS } from "@/lib/cari-fields";

export async function updateCariAction(
  id: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ad/ünvan zorunludur." };

  const body: Record<string, unknown> = {};
  for (const key of ALL_CARI_KEYS) {
    body[key] = String(formData.get(key) ?? "").trim() || null;
  }
  body.name = name;

  try {
    await updatePartner(id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cari güncellenemedi." };
  }
  revalidatePath(`/cari/${id}`);
  revalidatePath("/tanimlama");
}

export async function deleteCariAction(id: number): Promise<void | { error?: string }> {
  try {
    await deletePartner(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cari silinemedi (ilişkili kayıt olabilir)." };
  }
  revalidatePath("/tanimlama");
}
