"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDate } from "@/lib/calculations";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createOdeme(formData: FormData) {
  const tarih = parseDate(formData.get("tarih"));
  const ad = formData.get("tedarikciAdi") as string;
  const tutar = num(formData.get("odenenTutar"));
  if (!tarih || !ad || tutar <= 0) return;
  await prisma.tedarikciOdeme.create({
    data: {
      tarih,
      tedarikciAdi: ad,
      odenenTutar: tutar,
      notlar: (formData.get("notlar") as string) || null,
    },
  });
  revalidatePath("/tedarikci-odeme");
}
