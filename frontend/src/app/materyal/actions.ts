"use server";

import { revalidatePath } from "next/cache";
import {
  createMaterial,
  createMaterialPartnerLink,
  createMaterialPriceBreak,
  deleteMaterial,
  deleteMaterialPartnerLink,
  deleteMaterialPriceBreak,
  updateMaterial,
} from "@/lib/api";
import { MATERYAL_ALANLARI } from "@/lib/materyal-fields";

const FIELD_KEYS = MATERYAL_ALANLARI.map((f) => f.key);

export async function createMaterialAction(
  formData: FormData,
): Promise<{ error?: string; id?: number }> {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!name) return { error: "Materyal adı zorunludur." };
  if (!category) return { error: "Kategori seçilmelidir." };
  try {
    const m = await createMaterial({
      name,
      category,
      subType: String(formData.get("subType") ?? "").trim() || null,
      scope: String(formData.get("scope") ?? "OWN"),
    });
    revalidatePath("/materyal");
    return { id: m?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Materyal eklenemedi." };
  }
}

export async function updateMaterialAction(
  id: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Materyal adı zorunludur." };

  const body: Record<string, unknown> = {
    name,
    category: String(formData.get("category") ?? "").trim() || undefined,
    subType: String(formData.get("subType") ?? "").trim() || null,
    scope: String(formData.get("scope") ?? "OWN"),
    currency: String(formData.get("currency") ?? "TRY").trim() || "TRY",
    unitPrice: String(formData.get("unitPrice") ?? "").trim() || null,
    isActive: formData.get("isActive") === "on",
  };
  for (const key of FIELD_KEYS) {
    body[key] = String(formData.get(key) ?? "").trim() || null;
  }

  try {
    await updateMaterial(id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Materyal güncellenemedi." };
  }
  revalidatePath(`/materyal/${id}`);
  revalidatePath("/materyal");
}

export async function deleteMaterialAction(id: number): Promise<void | { error?: string }> {
  try {
    await deleteMaterial(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Materyal silinemedi." };
  }
  revalidatePath("/materyal");
}

// --- Bağlı cariler -----------------------------------------------------------
export async function addMaterialPartnerAction(
  materialId: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const partnerId = Number(formData.get("partnerId"));
  const role = String(formData.get("role") ?? "");
  if (!partnerId || !role) return { error: "Cari ve rol seçilmelidir." };
  try {
    await createMaterialPartnerLink({
      materialId,
      partnerId,
      role,
      note: String(formData.get("note") ?? "").trim() || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cari bağlanamadı (zaten ekli olabilir)." };
  }
  revalidatePath(`/materyal/${materialId}`);
}

export async function deleteMaterialPartnerAction(
  materialId: number,
  id: number,
): Promise<void | { error?: string }> {
  try {
    await deleteMaterialPartnerLink(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cari bağı silinemedi." };
  }
  revalidatePath(`/materyal/${materialId}`);
}

// --- Kademeli fiyat ----------------------------------------------------------
export async function addPriceBreakAction(
  materialId: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const minQty = Number(formData.get("minQty"));
  const price = Number(formData.get("price"));
  if (!Number.isFinite(minQty) || minQty <= 0 || !Number.isFinite(price)) {
    return { error: "Geçerli adet ve fiyat girin." };
  }
  try {
    await createMaterialPriceBreak({ materialId, minQty, price });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fiyat kademesi eklenemedi." };
  }
  revalidatePath(`/materyal/${materialId}`);
}

export async function deletePriceBreakAction(
  materialId: number,
  id: number,
): Promise<void | { error?: string }> {
  try {
    await deleteMaterialPriceBreak(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fiyat kademesi silinemedi." };
  }
  revalidatePath(`/materyal/${materialId}`);
}
