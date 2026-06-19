"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale, updateSale } from "@/lib/api";
import { friendlyApiError } from "@/lib/action-errors";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function salePayload(formData: FormData, date: string) {
  const termRaw = String(formData.get("termDays") ?? "").trim();
  const termDays = termRaw ? num(termRaw) : undefined;
  const currency = String(formData.get("currency") ?? "TRY").trim().toUpperCase() || "TRY";
  const exchangeRate = num(formData.get("exchangeRate"), 1);
  return {
    date,
    productName: String(formData.get("urunAdi") ?? "").trim(),
    customerName: String(formData.get("musteri") ?? "").trim(),
    quantity: num(formData.get("satisAdeti")),
    unitPrice: num(formData.get("birimSatisFiyati")),
    vatRate: num(formData.get("kdvOrani"), 0.2),
    paidAmount: num(formData.get("pesinOdenen")),
    notes: (formData.get("notlar") as string) || null,
    ...(termDays && termDays > 0 ? { termDays } : {}),
    currency,
    exchangeRate: currency === "TRY" ? 1 : exchangeRate,
  };
}

export async function createSatis(formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const musteriAdi = String(formData.get("musteri") ?? "").trim();
  const satisAdeti = num(formData.get("satisAdeti"));

  const date = dateInputToApi(tarih);
  if (!date || !urunAdi || !musteriAdi || satisAdeti <= 0) {
    return { error: "Tarih, ürün, müşteri ve adet zorunludur." };
  }

  try {
    await createSale(salePayload(formData, date));
  } catch (e) {
    return { error: friendlyApiError(e, "Satış kaydedilemedi.") };
  }

  revalidatePath("/urun-satis");
  revalidatePath("/raporlar/urun");
  revalidatePath("/raporlar/musteri");
  revalidatePath("/");
}

export async function updateSatis(id: number, formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const musteriAdi = String(formData.get("musteri") ?? "").trim();
  const satisAdeti = num(formData.get("satisAdeti"));

  const date = dateInputToApi(tarih);
  if (!date || !urunAdi || !musteriAdi || satisAdeti <= 0) {
    return { error: "Tarih, ürün, müşteri ve adet zorunludur." };
  }

  try {
    await updateSale(id, salePayload(formData, date));
  } catch (e) {
    return { error: friendlyApiError(e, "Satış güncellenemedi.") };
  }

  revalidatePath("/urun-satis");
  revalidatePath("/raporlar/urun");
  revalidatePath("/raporlar/musteri");
  revalidatePath("/");
}

export async function deleteSatis(id: number) {
  await deleteSale(id);
  revalidatePath("/urun-satis");
  revalidatePath("/raporlar/urun");
  revalidatePath("/raporlar/musteri");
  revalidatePath("/");
}
