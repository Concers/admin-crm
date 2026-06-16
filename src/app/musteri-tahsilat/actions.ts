"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDate } from "@/lib/calculations";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createTahsilat(formData: FormData) {
  const tarih = parseDate(formData.get("tarih"));
  const ad = formData.get("musteriAdi") as string;
  const tutar = num(formData.get("tahsilatTutari"));
  if (!tarih || !ad || tutar <= 0) return;
  await prisma.musteriTahsilat.create({
    data: {
      tarih,
      musteriAdi: ad,
      tahsilatTutari: tutar,
      notlar: (formData.get("notlar") as string) || null,
    },
  });
  revalidatePath("/musteri-tahsilat");
}
