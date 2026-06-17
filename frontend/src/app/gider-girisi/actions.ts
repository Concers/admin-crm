"use server";

import { revalidatePath } from "next/cache";
import { createExpense, deleteExpense, updateExpense } from "@/lib/api";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createGider(formData: FormData) {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const parsed = new Date(tarih);
  if (!tarih || Number.isNaN(parsed.getTime())) return;

  const giderKategori = String(formData.get("giderKategori") ?? "").toUpperCase();
  const scope = giderKategori.includes("ÜRÜN") || giderKategori.includes("URUN") ? "PRODUCT" : "GENERAL";

  await createExpense({
    date: parsed.toISOString(),
    scope,
    category: String(formData.get("giderTuru") ?? ""),
    durationMonths: num(formData.get("periyotAy")) || null,
    productName: (formData.get("urunAdi") as string) || null,
    partnerName: (formData.get("tedarikciAdi") as string) || null,
    totalAmount: num(formData.get("toplamTutar")),
    paidAmount: num(formData.get("pesinOdenen")),
    notes: (formData.get("notlar") as string) || null,
  });

  revalidatePath("/gider-girisi");
  revalidatePath("/");
}

export async function updateGider(id: number, formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const parsed = new Date(tarih);
  if (!tarih || Number.isNaN(parsed.getTime())) {
    return { error: "Geçerli bir tarih giriniz." };
  }

  const giderKategori = String(formData.get("giderKategori") ?? "").toUpperCase();
  const scope = giderKategori.includes("ÜRÜN") || giderKategori.includes("URUN") ? "PRODUCT" : "GENERAL";

  try {
    await updateExpense(id, {
      date: parsed.toISOString(),
      scope,
      category: String(formData.get("giderTuru") ?? ""),
      durationMonths: num(formData.get("periyotAy")) || null,
      productName: (formData.get("urunAdi") as string) || null,
      partnerName: (formData.get("tedarikciAdi") as string) || null,
      totalAmount: num(formData.get("toplamTutar")),
      paidAmount: num(formData.get("pesinOdenen")),
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gider güncellenemedi." };
  }

  revalidatePath("/gider-girisi");
  revalidatePath("/");
}

export async function deleteGider(id: number) {
  await deleteExpense(id);
  revalidatePath("/gider-girisi");
  revalidatePath("/");
}
