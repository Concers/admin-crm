"use server";

import { revalidatePath } from "next/cache";
import { createDiscount, deleteDiscount, updateDiscount } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function buildPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const percentRaw = Number(formData.get("percent"));
  const amountRaw = Number(formData.get("amount"));
  const productRaw = Number(formData.get("productId"));
  const partnerRaw = Number(formData.get("partnerId"));
  const validFrom = String(formData.get("validFrom") ?? "").trim();
  const validTo = String(formData.get("validTo") ?? "").trim();
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  if (!name) {
    return { error: "İskonto adı zorunludur." as const };
  }

  const percent = percentRaw > 0 ? percentRaw : undefined;
  const amount = amountRaw > 0 ? amountRaw : undefined;

  if (percent == null && amount == null) {
    return { error: "Yüzde veya tutar iskontosu girilmelidir." as const };
  }

  return {
    body: {
      name,
      percent,
      amount,
      productId: productRaw > 0 ? productRaw : undefined,
      partnerId: partnerRaw > 0 ? partnerRaw : undefined,
      validFrom: validFrom ? dateInputToApi(validFrom) : undefined,
      validTo: validTo ? dateInputToApi(validTo) : undefined,
      isActive,
    },
  };
}

export async function createIskonto(
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createDiscount(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "İskonto kaydedilemedi." };
  }

  revalidatePath("/iskontolar");
}

export async function updateIskonto(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateDiscount(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "İskonto güncellenemedi." };
  }

  revalidatePath("/iskontolar");
}

export async function deleteIskonto(id: number) {
  await deleteDiscount(id);
  revalidatePath("/iskontolar");
}

/** @deprecated use createIskonto */
export async function createDiscountAction(formData: FormData) {
  const result = await createIskonto(formData);
  if (result?.error) throw new Error(result.error);
}

/** @deprecated use deleteIskonto */
export async function deleteDiscountAction(id: number) {
  return deleteIskonto(id);
}
