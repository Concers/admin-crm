"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  createProductLink,
  createProductPartnerLink,
  deleteProduct,
  deleteProductLink,
  deleteProductPartnerLink,
  updateProduct,
} from "@/lib/api";
import { URUN_DETAY_ALANLARI, URUN_SEKTORLERI } from "@/lib/urun-detay-fields";

const DETAIL_KEYS = URUN_DETAY_ALANLARI.flatMap((g) => g.fields.map((f) => f.key));

export async function createProductAction(formData: FormData): Promise<void | { error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ürün adı zorunludur." };
  try {
    await createProduct({ name });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ürün eklenemedi." };
  }
  revalidatePath("/urun-detay");
}

export async function updateProductDetailAction(
  id: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ürün adı zorunludur." };

  const body: Record<string, unknown> = { name };
  for (const key of DETAIL_KEYS) {
    body[key] = String(formData.get(key) ?? "").trim() || null;
  }
  // Çoklu sektör seçimi → CSV
  const sectors = URUN_SEKTORLERI.filter((s) => formData.get(`sector_${s.code}`) === "on")
    .map((s) => s.code)
    .join(",");
  body.sectors = sectors || null;
  body.category = String(formData.get("category") ?? "").trim() || null;
  body.unit = String(formData.get("unit") ?? "").trim() || "adet";
  // Checkbox'lar formda her zaman render edilir → yokluk = işaretsiz.
  body.isBfm = formData.get("isBfm") === "on";
  body.isActive = formData.get("isActive") === "on";

  try {
    await updateProduct(id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ürün güncellenemedi." };
  }
  revalidatePath(`/urun-detay/${id}`);
  revalidatePath("/urun-detay");
}

export async function deleteProductAction(id: number): Promise<void | { error?: string }> {
  try {
    await deleteProduct(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ürün silinemedi (ilişkili kayıt olabilir)." };
  }
  revalidatePath("/urun-detay");
}

// --- İçerik linkleri ---------------------------------------------------------
export async function addProductLinkAction(
  productId: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const kind = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Başlık zorunludur." };
  try {
    await createProductLink({
      productId,
      kind,
      title,
      url: String(formData.get("url") ?? "").trim() || null,
      note: String(formData.get("note") ?? "").trim() || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Bağlantı eklenemedi." };
  }
  revalidatePath(`/urun-detay/${productId}`);
}

export async function deleteProductLinkAction(
  productId: number,
  id: number,
): Promise<void | { error?: string }> {
  try {
    await deleteProductLink(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Bağlantı silinemedi." };
  }
  revalidatePath(`/urun-detay/${productId}`);
}

// --- Bağlı cariler -----------------------------------------------------------
export async function addProductPartnerAction(
  productId: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const partnerId = Number(formData.get("partnerId"));
  const role = String(formData.get("role") ?? "");
  if (!partnerId || !role) return { error: "Cari ve rol seçilmelidir." };
  try {
    await createProductPartnerLink({
      productId,
      partnerId,
      role,
      note: String(formData.get("note") ?? "").trim() || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cari bağlanamadı (zaten ekli olabilir)." };
  }
  revalidatePath(`/urun-detay/${productId}`);
}

export async function deleteProductPartnerAction(
  productId: number,
  id: number,
): Promise<void | { error?: string }> {
  try {
    await deleteProductPartnerLink(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cari bağı silinemedi." };
  }
  revalidatePath(`/urun-detay/${productId}`);
}
