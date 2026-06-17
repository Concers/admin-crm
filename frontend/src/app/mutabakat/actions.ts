"use server";

import { revalidatePath } from "next/cache";
import { allocatePayment, deleteAllocation } from "@/lib/api";

export async function allocateAction(formData: FormData): Promise<void | { error?: string }> {
  const invoiceId = Number(formData.get("invoiceId"));
  const cashFlowId = Number(formData.get("cashFlowId"));
  const amount = Number(formData.get("amount"));
  if (!invoiceId || !cashFlowId || !(amount > 0)) {
    return { error: "Fatura, ödeme ve tutar zorunludur." };
  }
  try {
    await allocatePayment({ invoiceId, cashFlowId, amount });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tahsis başarısız." };
  }
  revalidatePath("/mutabakat");
}

export async function removeAllocationAction(id: number): Promise<void | { error?: string }> {
  try {
    await deleteAllocation(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tahsis silinemedi." };
  }
  revalidatePath("/mutabakat");
}
