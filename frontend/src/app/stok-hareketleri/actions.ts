"use server";

import { revalidatePath } from "next/cache";
import { createStockMovement } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function trim(val: FormDataEntryValue | null) {
  return typeof val === "string" ? val.trim() : "";
}

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const VALID_TYPES = new Set(["IN", "OUT", "ADJUSTMENT", "TRANSFER", "WASTE"]);

export async function createHareket(formData: FormData): Promise<void | { error?: string }> {
  const productName = trim(formData.get("productName"));
  const type = trim(formData.get("type")) || "IN";
  const quantity = num(formData.get("quantity"));
  const reason = trim(formData.get("reason"));
  const notes = trim(formData.get("notlar"));
  const tarih = trim(formData.get("tarih"));
  const warehouseRaw = trim(formData.get("warehouseId"));
  const warehouseId = warehouseRaw ? Number(warehouseRaw) : undefined;
  const date = tarih ? dateInputToApi(tarih) : undefined;

  if (!productName || quantity <= 0) {
    return { error: "Ürün ve miktar zorunludur." };
  }
  if (!VALID_TYPES.has(type)) {
    return { error: "Geçersiz hareket türü." };
  }

  try {
    await createStockMovement({
      productName,
      type,
      quantity,
      reason: reason || null,
      notes: notes || null,
      ...(warehouseId ? { warehouseId } : {}),
      ...(date ? { date } : {}),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Stok hareketi kaydedilemedi." };
  }

  revalidatePath("/stok-hareketleri");
  revalidatePath("/raporlar/stok");
}

/** @deprecated use createHareket */
export async function createStockMovementAction(formData: FormData) {
  const result = await createHareket(formData);
  if (result?.error) throw new Error(result.error);
}
