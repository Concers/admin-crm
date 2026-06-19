"use server";

import { revalidatePath } from "next/cache";
import {
  createAccount,
  createCashFlow,
  deleteAccount,
  deleteCashFlow,
  updateAccount,
  updateCashFlow,
} from "@/lib/api";
import { friendlyApiError } from "@/lib/action-errors";
import { dateInputToApi } from "@/lib/dates";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function trim(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}

export async function createHesap(formData: FormData): Promise<void | { error?: string }> {
  const name = trim(formData.get("name"));
  const type = trim(formData.get("type")) || "CASH";
  const currency = trim(formData.get("currency")) || "TRY";
  const openingBalance = num(formData.get("openingBalance"));
  if (!name) return { error: "Hesap adı zorunludur." };

  try {
    await createAccount({ name, type, currency, openingBalance });
  } catch (e) {
    return { error: friendlyApiError(e, "Hesap eklenemedi.") };
  }
  revalidatePath("/kasa-banka");
}

export async function updateHesap(id: number, formData: FormData): Promise<void | { error?: string }> {
  const name = trim(formData.get("name"));
  const type = trim(formData.get("type")) || "CASH";
  const currency = trim(formData.get("currency")) || "TRY";
  const openingBalance = num(formData.get("openingBalance"));
  if (!name) return { error: "Hesap adı zorunludur." };

  try {
    await updateAccount(id, { name, type, currency, openingBalance });
  } catch (e) {
    return { error: friendlyApiError(e, "Hesap güncellenemedi.") };
  }
  revalidatePath("/kasa-banka");
}

export async function deleteHesap(id: number) {
  await deleteAccount(id);
  revalidatePath("/kasa-banka");
}

export async function updateKasaHareket(id: number, formData: FormData): Promise<void | { error?: string }> {
  const date = dateInputToApi(trim(formData.get("tarih")));
  const partnerName = trim(formData.get("cari"));
  const amount = num(formData.get("tutar"));
  const type = trim(formData.get("type")) as "PAYMENT" | "COLLECTION";
  const accountIdRaw = trim(formData.get("accountId"));
  const accountId = accountIdRaw ? Number(accountIdRaw) : null;

  if (!date || !partnerName || amount <= 0 || !type) {
    return { error: "Tarih, cari, tür ve tutar zorunludur." };
  }

  try {
    await updateCashFlow(id, {
      date,
      partnerName,
      type,
      amount,
      accountId,
      notes: (formData.get("notlar") as string) || null,
    });
  } catch (e) {
    return { error: friendlyApiError(e, "Hareket güncellenemedi.") };
  }
  revalidatePath("/kasa-banka");
  revalidatePath("/musteri-tahsilat");
  revalidatePath("/tedarikci-odeme");
}

export async function deleteKasaHareket(id: number) {
  await deleteCashFlow(id);
  revalidatePath("/kasa-banka");
  revalidatePath("/musteri-tahsilat");
  revalidatePath("/tedarikci-odeme");
}
