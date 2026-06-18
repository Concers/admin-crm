"use server";

import { revalidatePath } from "next/cache";
import { createPriceList, deletePriceList, updatePriceList } from "@/lib/api";

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

function buildPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim() || "TRY";
  const tier = String(formData.get("tier") ?? "").trim() || null;
  const items = parseItems(formData.get("items"));
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (!name || items.length === 0) {
    return { error: "Liste adı ve en az bir kalem zorunludur." as const };
  }

  return { body: { name, currency, tier, items, isActive } };
}

export async function createFiyatListesi(
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createPriceList(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fiyat listesi kaydedilemedi." };
  }

  revalidatePath("/fiyat-listesi");
}

export async function updateFiyatListesi(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updatePriceList(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fiyat listesi güncellenemedi." };
  }

  revalidatePath("/fiyat-listesi");
}

export async function deleteFiyatListesi(id: number) {
  await deletePriceList(id);
  revalidatePath("/fiyat-listesi");
}

/** @deprecated use createFiyatListesi */
export async function createPriceListAction(formData: FormData) {
  const result = await createFiyatListesi(formData);
  if (result?.error) throw new Error(result.error);
}

/** @deprecated use deleteFiyatListesi */
export async function deletePriceListAction(id: number) {
  return deleteFiyatListesi(id);
}
