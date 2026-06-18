"use server";

import { revalidatePath } from "next/cache";
import { createReturn, deleteReturn, updateReturn } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function buildPayload(formData: FormData) {
  const type = String(formData.get("type") ?? "").trim();
  const partnerId = Number(formData.get("partnerId"));
  const productId = Number(formData.get("productId"));
  const quantity = num(formData.get("quantity"));
  const amount = num(formData.get("amount"));
  const tarih = String(formData.get("tarih") ?? "").trim();
  const reason = String(formData.get("sebep") ?? "").trim() || null;
  const notes = String(formData.get("notlar") ?? "").trim() || null;
  const date = tarih ? dateInputToApi(tarih) : undefined;

  if (
    (type !== "SALES_RETURN" && type !== "PURCHASE_RETURN") ||
    !partnerId ||
    !productId ||
    quantity <= 0
  ) {
    return { error: "Tür, cari, ürün ve miktar zorunludur." as const };
  }

  return {
    body: {
      type,
      partnerId,
      productId,
      quantity,
      amount,
      reason,
      notes,
      ...(date ? { date } : {}),
    },
  };
}

export async function createIade(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createReturn(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "İade kaydedilemedi." };
  }

  revalidatePath("/belgeler/iade");
}

export async function updateIade(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateReturn(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "İade güncellenemedi." };
  }

  revalidatePath("/belgeler/iade");
}

export async function deleteIade(id: number) {
  await deleteReturn(id);
  revalidatePath("/belgeler/iade");
}

/** @deprecated use createIade */
export async function createReturnAction(formData: FormData) {
  const result = await createIade(formData);
  if (result?.error) throw new Error(result.error);
}
