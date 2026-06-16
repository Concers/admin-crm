"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calcAlimFields, parseDate } from "@/lib/calculations";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createAlim(formData: FormData) {
  const tarih = parseDate(formData.get("tarih"));
  const urunAdi = formData.get("urunAdi") as string;
  const alimAdeti = num(formData.get("alimAdeti"));
  if (!tarih || !urunAdi || alimAdeti <= 0) return;
  const birimAlimFiyati = num(formData.get("birimAlimFiyati"));
  const kdvOrani = num(formData.get("kdvOrani"), 0.2);
  const calc = calcAlimFields({ birimAlimFiyati, alimAdeti, kdvOrani });
  await prisma.urunAlim.create({
    data: {
      tarih,
      urunAdi,
      tedarikci: String(formData.get("tedarikci") ?? ""),
      birimAlimFiyati,
      alimAdeti,
      kdvOrani,
      pesinOdenen: num(formData.get("pesinOdenen")) || null,
      konulanRaf: (formData.get("konulanRaf") as string) || null,
      notlar: (formData.get("notlar") as string) || null,
      ...calc,
    },
  });
  revalidatePath("/urun-alim");
  revalidatePath("/raporlar/stok");
}

export async function deleteAlim(id: number) {
  await prisma.urunAlim.delete({ where: { id } });
  revalidatePath("/urun-alim");
}
