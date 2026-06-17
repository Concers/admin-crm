"use server";

import { revalidatePath } from "next/cache";
import { createCashFlow } from "@/lib/api";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createTahsilat(formData: FormData) {
  const tarih = String(formData.get("tarih") ?? "").trim();
  const ad = String(formData.get("musteriAdi") ?? "").trim();
  const tutar = num(formData.get("tahsilatTutari"));

  const parsed = new Date(tarih);
  if (!tarih || Number.isNaN(parsed.getTime()) || !ad || tutar <= 0) return;

  await createCashFlow({
    date: parsed.toISOString(),
    partnerName: ad,
    type: "COLLECTION",
    amount: tutar,
    notes: (formData.get("notlar") as string) || null,
  });

  revalidatePath("/musteri-tahsilat");
}
