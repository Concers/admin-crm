"use server";

import { revalidatePath } from "next/cache";
import { createReturn } from "@/lib/api";

export async function createReturnAction(formData: FormData) {
  const type = String(formData.get("type") ?? "").trim();
  const partnerId = Number(formData.get("partnerId"));
  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (
    (type !== "SALES_RETURN" && type !== "PURCHASE_RETURN") ||
    !partnerId ||
    !productId ||
    quantity <= 0
  ) {
    throw new Error("Geçersiz iade bilgisi.");
  }

  await createReturn({
    type,
    partnerId,
    productId,
    quantity,
    amount: Number.isFinite(amount) ? amount : 0,
    reason: reason || null,
  });
  revalidatePath("/belgeler/iade");
}
