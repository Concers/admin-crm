"use server";

import { revalidatePath } from "next/cache";
import { createPurchase, deletePurchase, updatePurchase } from "@/lib/api";
import { friendlyApiError } from "@/lib/action-errors";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function purchasePayload(formData: FormData, date: string) {
  const termRaw = String(formData.get("termDays") ?? "").trim();
  const termDays = termRaw ? num(termRaw) : undefined;
  const currency = String(formData.get("currency") ?? "TRY").trim().toUpperCase() || "TRY";
  const exchangeRate = num(formData.get("exchangeRate"), 1);
  return {
    date,
    productName: String(formData.get("urunAdi") ?? "").trim(),
    supplierName: String(formData.get("tedarikci") ?? ""),
    quantity: num(formData.get("alimAdeti")),
    unitPrice: num(formData.get("birimAlimFiyati")),
    vatRate: num(formData.get("kdvOrani"), 0.2),
    paidAmount: num(formData.get("pesinOdenen")),
    shelfLocation: (formData.get("konulanRaf") as string) || null,
    notes: (formData.get("notlar") as string) || null,
    ...(termDays && termDays > 0 ? { termDays } : {}),
    currency,
    exchangeRate: currency === "TRY" ? 1 : exchangeRate,
  };
}

export async function createAlim(formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const alimAdeti = num(formData.get("alimAdeti"));
  const date = dateInputToApi(tarih);

  if (!date || !urunAdi || alimAdeti <= 0) {
    return { error: "Tarih, ürün ve adet zorunludur." };
  }

  try {
    await createPurchase(purchasePayload(formData, date));
  } catch (e) {
    return { error: friendlyApiError(e, "Alım kaydedilemedi.") };
  }

  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
  revalidatePath("/raporlar/urun");
  revalidatePath("/raporlar/tedarikci");
}

export async function updateAlim(id: number, formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const alimAdeti = num(formData.get("alimAdeti"));
  const date = dateInputToApi(tarih);

  if (!date || !urunAdi || alimAdeti <= 0) {
    return { error: "Tarih, ürün ve adet zorunludur." };
  }

  try {
    await updatePurchase(id, purchasePayload(formData, date));
  } catch (e) {
    return { error: friendlyApiError(e, "Alım güncellenemedi.") };
  }

  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
  revalidatePath("/raporlar/urun");
  revalidatePath("/raporlar/tedarikci");
}

export async function deleteAlim(id: number) {
  await deletePurchase(id);
  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
  revalidatePath("/raporlar/urun");
  revalidatePath("/raporlar/tedarikci");
}
