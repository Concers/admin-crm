"use server";

import { revalidatePath } from "next/cache";
import { createInvoice, deleteInvoice, type DocLine } from "@/lib/api";

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

export async function createInvoiceAction(formData: FormData) {
  const docType = String(formData.get("docType") ?? "").trim();
  const partnerId = Number(formData.get("partnerId"));
  const number = String(formData.get("number") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const lines = parseLines(formData.get("lines"));

  if ((docType !== "SALES" && docType !== "PURCHASE") || !partnerId || lines.length === 0) {
    throw new Error("Geçersiz fatura bilgisi.");
  }

  const dueDate = dueDateRaw ? new Date(dueDateRaw).toISOString() : null;

  await createInvoice({
    docType,
    partnerId,
    number: number || null,
    dueDate,
    lines,
  });
  revalidatePath("/belgeler/fatura");
}

export async function deleteInvoiceAction(id: number) {
  await deleteInvoice(id);
  revalidatePath("/belgeler/fatura");
}
