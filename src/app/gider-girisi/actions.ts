"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calcGiderFields, normalizeGiderKategori, parseDate } from "@/lib/calculations";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createGider(formData: FormData) {
  const tarih = parseDate(formData.get("tarih"));
  if (!tarih) return;
  const pesinOdenen = num(formData.get("pesinOdenen"));
  const periyotAy = num(formData.get("periyotAy")) || null;
  const calc = calcGiderFields({
    tarih,
    periyotAy,
    pesinOdenen,
  });
  await prisma.giderGirisi.create({
    data: {
      tarih,
      giderKategori: normalizeGiderKategori(formData.get("giderKategori")),
      giderTuru: String(formData.get("giderTuru") ?? ""),
      periyotAy,
      urunAdi: (formData.get("urunAdi") as string) || null,
      tedarikciAdi: (formData.get("tedarikciAdi") as string) || null,
      toplamTutar: num(formData.get("toplamTutar")),
      pesinOdenen,
      notlar: (formData.get("notlar") as string) || null,
      ...calc,
    },
  });
  revalidatePath("/gider-girisi");
  revalidatePath("/");
}

export async function deleteGider(id: number) {
  await prisma.giderGirisi.delete({ where: { id } });
  revalidatePath("/gider-girisi");
  revalidatePath("/");
}
