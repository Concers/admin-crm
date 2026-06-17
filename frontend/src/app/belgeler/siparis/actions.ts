"use server";

import { revalidatePath } from "next/cache";
import { createOrder, deleteOrder, type DocLine } from "@/lib/api";

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

export async function createOrderAction(formData: FormData) {
  const docType = String(formData.get("docType") ?? "").trim();
  const partnerId = Number(formData.get("partnerId"));
  const lines = parseLines(formData.get("lines"));

  if ((docType !== "SALES" && docType !== "PURCHASE") || !partnerId || lines.length === 0) {
    throw new Error("Geçersiz sipariş bilgisi.");
  }

  await createOrder({ docType, partnerId, lines });
  revalidatePath("/belgeler/siparis");
}

export async function deleteOrderAction(id: number) {
  await deleteOrder(id);
  revalidatePath("/belgeler/siparis");
}
