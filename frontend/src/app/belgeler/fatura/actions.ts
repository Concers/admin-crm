"use server";

import { revalidatePath } from "next/cache";
import { createInvoice, deleteInvoice, updateInvoice, type DocLine } from "@/lib/api";
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

const VALID_STATUS = new Set(["DRAFT", "ISSUED", "PAID", "CANCELLED"]);

function buildPayload(formData: FormData) {
  const docType = String(formData.get("docType") ?? "").trim();
  const partnerId = Number(formData.get("partnerId"));
  const lines = parseLines(formData.get("lines"));
  const tarih = String(formData.get("tarih") ?? "").trim();
  const vade = String(formData.get("vade") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT").trim();
  const number = String(formData.get("faturaNo") ?? "").trim() || null;
  const notes = String(formData.get("notlar") ?? "").trim() || null;
  const date = tarih ? dateInputToApi(tarih) : undefined;
  const dueDate = vade ? dateInputToApi(vade) : null;

  if ((docType !== "SALES" && docType !== "PURCHASE") || !partnerId || lines.length === 0) {
    return { error: "Cari, tür ve en az bir kalem zorunludur." as const };
  }

  return {
    body: {
      docType,
      partnerId,
      lines,
      number,
      status: VALID_STATUS.has(status) ? status : "DRAFT",
      notes,
      dueDate,
      ...(date ? { date } : {}),
    },
  };
}

export async function createFatura(formData: FormData): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await createInvoice(payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fatura kaydedilemedi." };
  }

  revalidatePath("/belgeler/fatura");
}

export async function updateFatura(
  id: number,
  formData: FormData
): Promise<void | { error?: string }> {
  const payload = buildPayload(formData);
  if ("error" in payload) return payload;

  try {
    await updateInvoice(id, payload.body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Fatura güncellenemedi." };
  }

  revalidatePath("/belgeler/fatura");
}

export async function deleteFatura(id: number) {
  await deleteInvoice(id);
  revalidatePath("/belgeler/fatura");
}

/** @deprecated use deleteFatura */
export async function deleteInvoiceAction(id: number) {
  return deleteFatura(id);
}

/** @deprecated use createFatura */
export async function createInvoiceAction(formData: FormData) {
  const result = await createFatura(formData);
  if (result?.error) throw new Error(result.error);
}
