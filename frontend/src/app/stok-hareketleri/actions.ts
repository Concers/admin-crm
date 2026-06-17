"use server";

import { revalidatePath } from "next/cache";
import { createStockMovement } from "@/lib/api";

function trim(val: FormDataEntryValue | null) {
  return typeof val === "string" ? val.trim() : "";
}

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createStockMovementAction(formData: FormData) {
  const productName = trim(formData.get("productName"));
  const type = trim(formData.get("type")) || "IN";
  const quantity = num(formData.get("quantity"));
  const reason = trim(formData.get("reason"));
  if (!productName || quantity <= 0) return;

  await createStockMovement({
    productName,
    type,
    quantity,
    reason: reason || null,
  });
  revalidatePath("/stok-hareketleri");
}
