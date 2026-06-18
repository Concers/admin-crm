"use server";

import { revalidatePath } from "next/cache";
import { createOrder, deleteOrder, updateOrder, type DocLine } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function parseLines(raw: FormDataEntryValue | null): DocLine[] {
  try {
    const arr = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((l) => ({
        productId: Number(l.productId),
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice) || 0,
      }))
      .filter((l) => l.productId > 0 && l.quantity > 0);
  } catch {
    return [];
  }
}

const VALID_STATUS = new Set(["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"]);

function buildPayload(formData: FormData) {
  const docType = String(formData.get("docType") ?? "").trim();
  const partnerId = Number(formData.get("partnerId"));
  const lines = parseLines(formData.get("lines"));
  const tarih = String(formData.get("tarih") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").trim();
  const notes = String(formData.get("notlar") ?? "").trim() || null;
  const date = tarih ? dateInputToApi(tarih) : undefined;

  if ((docType !== "SALES" && docType !== "PURCHASE") || !partnerId || lines.length === 0) {
    return { error: "Cari, tür ve en az bir kalem zorunludur." as const };
  }

  return {
    body: {
      docType,
      partnerId,
      lines,
      status: VALID_STATUS.has(status) ? status : "DRAFT",
      notes,
      ...(date ? { date } : {}),
    },
  };
}

export async function createSiparis(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createOrder(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sipariş kaydedilemedi." };
  }

  revalidatePath("/belgeler/siparis");
}

export async function updateSiparis(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateOrder(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sipariş güncellenemedi." };
  }

  revalidatePath("/belgeler/siparis");
}

export async function deleteSiparis(id: number) {
  await deleteOrder(id);
  revalidatePath("/belgeler/siparis");
}

/** @deprecated use deleteSiparis */
export async function deleteOrderAction(id: number) {
  return deleteSiparis(id);
}
