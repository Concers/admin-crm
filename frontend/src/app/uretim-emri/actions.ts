"use server";

import { revalidatePath } from "next/cache";
import {
  createProductionOrder,
  deleteProductionOrder,
  generateRequestFormFromOrder,
  updateProductionOrder,
} from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

/** Üretim emrinden üreticiye PRODUCTION talep formu üretir; yeni formun id'sini döndürür. */
export async function generateTalepFormuAction(
  orderId: number,
  partnerId: number,
  notes?: string,
): Promise<{ error?: string; id?: number }> {
  if (!partnerId) return { error: "Üretici (cari) seçilmelidir." };
  try {
    const form = await generateRequestFormFromOrder(orderId, { partnerId, notes: notes ?? null });
    revalidatePath("/talep-formu");
    return { id: form?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Talep formu oluşturulamadı." };
  }
}

const VALID_STATUS = new Set(["PLANNED", "IN_PROGRESS", "DONE", "CANCELLED"]);

function buildPayload(formData: FormData) {
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));
  const status = String(formData.get("status") ?? "PLANNED").trim();
  const bomRaw = String(formData.get("bomId") ?? "").trim();
  const bomId = bomRaw ? Number(bomRaw) : null;
  const startRaw = String(formData.get("startDate") ?? "").trim();
  const endRaw = String(formData.get("endDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const startDate = startRaw ? dateInputToApi(startRaw) : null;
  const endDate = endRaw ? dateInputToApi(endRaw) : null;

  if (!productId || !(quantity > 0)) {
    return { error: "Mamul ve miktar zorunludur." as const };
  }

  return {
    body: {
      productId,
      quantity,
      bomId,
      status: VALID_STATUS.has(status) ? status : "PLANNED",
      startDate,
      endDate,
      notes,
    },
  };
}

export async function createEmir(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createProductionOrder(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Üretim emri kaydedilemedi." };
  }

  revalidatePath("/uretim-emri");
}

export async function updateEmir(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateProductionOrder(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Üretim emri güncellenemedi." };
  }

  revalidatePath("/uretim-emri");
}

export async function deleteEmir(id: number) {
  await deleteProductionOrder(id);
  revalidatePath("/uretim-emri");
}

/** @deprecated use createEmir */
export async function createProductionOrderAction(formData: FormData) {
  const result = await createEmir(formData);
  if (result?.error) throw new Error(result.error);
}

/** @deprecated use deleteEmir */
export async function deleteProductionOrderAction(id: number) {
  return deleteEmir(id);
}
