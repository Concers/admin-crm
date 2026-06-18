"use server";

import { revalidatePath } from "next/cache";
import { createQuote, deleteQuote, updateQuote, type DocLine } from "@/lib/api";
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

const VALID_STATUS = new Set(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]);

function buildPayload(formData: FormData) {
  const partnerId = Number(formData.get("partnerId"));
  const lines = parseLines(formData.get("lines"));
  const tarih = String(formData.get("tarih") ?? "").trim();
  const gecerlilik = String(formData.get("gecerlilik") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").trim();
  const notes = String(formData.get("notlar") ?? "").trim() || null;
  const date = tarih ? dateInputToApi(tarih) : undefined;
  const validUntil = gecerlilik ? dateInputToApi(gecerlilik) : null;

  if (!partnerId || lines.length === 0) {
    return { error: "Cari ve en az bir kalem zorunludur." as const };
  }

  return {
    body: {
      partnerId,
      lines,
      status: VALID_STATUS.has(status) ? status : "DRAFT",
      notes,
      validUntil,
      ...(date ? { date } : {}),
    },
  };
}

export async function createTeklif(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createQuote(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Teklif kaydedilemedi." };
  }

  revalidatePath("/belgeler/teklif");
}

export async function updateTeklif(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateQuote(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Teklif güncellenemedi." };
  }

  revalidatePath("/belgeler/teklif");
}

export async function deleteTeklif(id: number) {
  await deleteQuote(id);
  revalidatePath("/belgeler/teklif");
}

/** @deprecated use deleteTeklif */
export async function deleteQuoteAction(id: number) {
  return deleteTeklif(id);
}

/** @deprecated use createTeklif */
export async function createQuoteAction(formData: FormData) {
  const result = await createTeklif(formData);
  if (result?.error) throw new Error(result.error);
}
