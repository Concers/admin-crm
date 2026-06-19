"use server";

import { revalidatePath } from "next/cache";
import { createCashFlow, deleteCashFlow, updateCashFlow } from "@/lib/api";
import { friendlyApiError } from "@/lib/action-errors";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function accountIdFromForm(formData: FormData) {
  const raw = String(formData.get("accountId") ?? "").trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export async function createOdeme(formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const ad = String(formData.get("tedarikciAdi") ?? "").trim();
  const tutar = num(formData.get("odenenTutar"));

  const date = dateInputToApi(tarih);
  if (!date || !ad || tutar <= 0) {
    return { error: "Tarih, tedarikçi ve tutar zorunludur." };
  }

  try {
    await createCashFlow({
      date,
      partnerName: ad,
      type: "PAYMENT",
      amount: tutar,
      accountId: accountIdFromForm(formData),
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: friendlyApiError(e, "Ödeme kaydedilemedi.") };
  }

  revalidatePath("/tedarikci-odeme");
  revalidatePath("/kasa-banka");
  revalidatePath("/raporlar/tedarikci");
  revalidatePath("/");
}

export async function updateOdeme(id: number, formData: FormData): Promise<void | { error?: string }> {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const ad = String(formData.get("tedarikciAdi") ?? "").trim();
  const tutar = num(formData.get("odenenTutar"));

  const date = dateInputToApi(tarih);
  if (!date || !ad || tutar <= 0) {
    return { error: "Tarih, tedarikçi ve tutar zorunludur." };
  }

  try {
    await updateCashFlow(id, {
      date,
      partnerName: ad,
      type: "PAYMENT",
      amount: tutar,
      accountId: accountIdFromForm(formData),
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: friendlyApiError(e, "Ödeme güncellenemedi.") };
  }

  revalidatePath("/tedarikci-odeme");
  revalidatePath("/kasa-banka");
  revalidatePath("/raporlar/tedarikci");
  revalidatePath("/");
}

export async function deleteOdeme(id: number) {
  await deleteCashFlow(id);
  revalidatePath("/tedarikci-odeme");
  revalidatePath("/kasa-banka");
  revalidatePath("/raporlar/tedarikci");
  revalidatePath("/");
}
