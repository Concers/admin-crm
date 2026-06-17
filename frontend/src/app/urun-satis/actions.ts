"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale, updateSale } from "@/lib/api";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createSatis(formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const musteriAdi = String(formData.get("musteri") ?? "").trim();
  const satisAdeti = num(formData.get("satisAdeti"));

  const parsed = new Date(tarih);
  if (!tarih || Number.isNaN(parsed.getTime()) || !urunAdi || !musteriAdi || satisAdeti <= 0) {
    return { error: "Tarih, ürün, müşteri ve adet zorunludur." };
  }

  try {
    await createSale({
      date: parsed.toISOString(),
      productName: urunAdi,
      customerName: musteriAdi,
      quantity: satisAdeti,
      unitPrice: num(formData.get("birimSatisFiyati")),
      vatRate: num(formData.get("kdvOrani"), 0.2),
      paidAmount: num(formData.get("pesinOdenen")),
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    // Surface stock/validation messages from the backend to the UI.
    return { error: e instanceof Error ? e.message : "Satış kaydedilemedi." };
  }

  revalidatePath("/urun-satis");
  revalidatePath("/");
}

export async function updateSatis(id: number, formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const urunAdi = String(formData.get("urunAdi") ?? "").trim();
  const musteriAdi = String(formData.get("musteri") ?? "").trim();
  const satisAdeti = num(formData.get("satisAdeti"));

  const parsed = new Date(tarih);
  if (!tarih || Number.isNaN(parsed.getTime()) || !urunAdi || !musteriAdi || satisAdeti <= 0) {
    return { error: "Tarih, ürün, müşteri ve adet zorunludur." };
  }

  try {
    await updateSale(id, {
      date: parsed.toISOString(),
      productName: urunAdi,
      customerName: musteriAdi,
      quantity: satisAdeti,
      unitPrice: num(formData.get("birimSatisFiyati")),
      vatRate: num(formData.get("kdvOrani"), 0.2),
      paidAmount: num(formData.get("pesinOdenen")),
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Satış güncellenemedi." };
  }

  revalidatePath("/urun-satis");
  revalidatePath("/");
}

export async function deleteSatis(id: number) {
  await deleteSale(id);
  revalidatePath("/urun-satis");
  revalidatePath("/");
}
