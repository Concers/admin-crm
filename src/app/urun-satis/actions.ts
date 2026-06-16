"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calcSatisFields, parseDate } from "@/lib/calculations";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createSatis(formData: FormData) {
  const tarih = parseDate(formData.get("tarih"));
  const urunAdi = formData.get("urunAdi") as string;
  const satisAdeti = num(formData.get("satisAdeti"));
  if (!tarih || !urunAdi || satisAdeti <= 0) return;
  const birimSatisFiyati = num(formData.get("birimSatisFiyati"));
  const kdvOrani = num(formData.get("kdvOrani"), 0.2);
  const alimlar = await prisma.urunAlim.findMany({ where: { urunAdi } });
  const alimBirimMaliyeti =
    alimlar.length > 0
      ? alimlar.reduce((s, x) => s + x.birimAlimFiyati, 0) / alimlar.length
      : 0;
  const calc = calcSatisFields({
    birimSatisFiyati,
    satisAdeti,
    kdvOrani,
    alimBirimMaliyeti,
    uretimBirimMaliyeti: 0,
    genelGiderMaliyeti: 0,
    tarih,
  });
  await prisma.urunSatis.create({
    data: {
      tarih,
      urunAdi,
      musteri: String(formData.get("musteri") ?? ""),
      birimSatisFiyati,
      satisAdeti,
      kdvOrani,
      pesinOdenen: num(formData.get("pesinOdenen")) || null,
      hangiRaf: (formData.get("hangiRaf") as string) || null,
      notlar: (formData.get("notlar") as string) || null,
      alimBirimMaliyeti,
      uretimBirimMaliyeti: 0,
      genelGiderMaliyeti: 0,
      ...calc,
    },
  });
  revalidatePath("/urun-satis");
  revalidatePath("/");
}

export async function deleteSatis(id: number) {
  await prisma.urunSatis.delete({ where: { id } });
  revalidatePath("/urun-satis");
}
