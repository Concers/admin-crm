"use server";

import { revalidatePath } from "next/cache";
import { createQuote, deleteQuote, type DocLine } from "@/lib/api";

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

export async function createQuoteAction(formData: FormData) {
  const partnerId = Number(formData.get("partnerId"));
  const validUntilRaw = String(formData.get("validUntil") ?? "").trim();
  const lines = parseLines(formData.get("lines"));

  if (!partnerId || lines.length === 0) {
    throw new Error("Geçersiz teklif bilgisi.");
  }

  const validUntil = validUntilRaw ? new Date(validUntilRaw).toISOString() : null;

  await createQuote({ partnerId, validUntil, lines });
  revalidatePath("/belgeler/teklif");
}

export async function deleteQuoteAction(id: number) {
  await deleteQuote(id);
  revalidatePath("/belgeler/teklif");
}
