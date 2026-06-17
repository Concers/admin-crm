"use server";

import { revalidatePath } from "next/cache";
import { createCashFlow } from "@/lib/api";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createOdeme(formData: FormData) {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const ad = String(formData.get("tedarikciAdi") ?? "").trim();
  const tutar = num(formData.get("odenenTutar"));

  const parsed = new Date(tarih);
  if (!tarih || Number.isNaN(parsed.getTime()) || !ad || tutar <= 0) return;

  await createCashFlow({
    date: parsed.toISOString(),
    partnerName: ad,
    type: "PAYMENT",
    amount: tutar,
    notes: (formData.get("notlar") as string) || null,
  });

  revalidatePath("/tedarikci-odeme");
}
