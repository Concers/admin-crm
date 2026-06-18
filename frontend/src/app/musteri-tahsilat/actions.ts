"use server";

import { revalidatePath } from "next/cache";
import { createCashFlow, deleteCashFlow, updateCashFlow } from "@/lib/api";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createTahsilat(formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const ad = String(formData.get("musteriAdi") ?? "").trim();
  const tutar = num(formData.get("tahsilatTutari"));

  const date = dateInputToApi(tarih);
  if (!date || !ad || tutar <= 0) {
    return { error: "Tarih, müşteri ve tutar zorunludur." };
  }

  try {
    await createCashFlow({
      date,
      partnerName: ad,
      type: "COLLECTION",
      amount: tutar,
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tahsilat kaydedilemedi." };
  }

  revalidatePath("/musteri-tahsilat");
  revalidatePath("/");
}

export async function updateTahsilat(id: number, formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const ad = String(formData.get("musteriAdi") ?? "").trim();
  const tutar = num(formData.get("tahsilatTutari"));

  const date = dateInputToApi(tarih);
  if (!date || !ad || tutar <= 0) {
    return { error: "Tarih, müşteri ve tutar zorunludur." };
  }

  try {
    await updateCashFlow(id, {
      date,
      partnerName: ad,
      type: "COLLECTION",
      amount: tutar,
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tahsilat güncellenemedi." };
  }

  revalidatePath("/musteri-tahsilat");
  revalidatePath("/");
}

export async function deleteTahsilat(id: number) {
  await deleteCashFlow(id);
  revalidatePath("/musteri-tahsilat");
  revalidatePath("/");
}
