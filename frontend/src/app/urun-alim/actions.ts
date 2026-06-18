"use server";

import { revalidatePath } from "next/cache";
import { createPurchase, deletePurchase, updatePurchase } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createAlim(formData: FormData) {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const alimAdeti = num(formData.get("alimAdeti"));
  const date = dateInputToApi(tarih);

  if (!date || !urunAdi || alimAdeti <= 0) return;

  await createPurchase({
    date,
    productName: urunAdi,
    supplierName: String(formData.get("tedarikci") ?? ""),
    quantity: alimAdeti,
    unitPrice: num(formData.get("birimAlimFiyati")),
    vatRate: num(formData.get("kdvOrani"), 0.2),
    paidAmount: num(formData.get("pesinOdenen")),
    shelfLocation: (formData.get("konulanRaf") as string) || null,
    notes: (formData.get("notlar") as string) || null,
  });

  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
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
    await updatePurchase(id, {
      date,
      productName: urunAdi,
      supplierName: String(formData.get("tedarikci") ?? ""),
      quantity: alimAdeti,
      unitPrice: num(formData.get("birimAlimFiyati")),
      vatRate: num(formData.get("kdvOrani"), 0.2),
      paidAmount: num(formData.get("pesinOdenen")),
      shelfLocation: (formData.get("konulanRaf") as string) || null,
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Alım güncellenemedi." };
  }

  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
}

export async function deleteAlim(id: number) {
  await deletePurchase(id);
  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
}
