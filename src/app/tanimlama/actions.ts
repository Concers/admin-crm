"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUrunGideri } from "@/lib/calculations";

function trim(val: FormDataEntryValue | null) {
  return typeof val === "string" ? val.trim() : "";
}

function revalidateTanimlama() {
  const paths = [
    "/tanimlama",
    "/gider-girisi",
    "/urun-alim",
    "/urun-satis",
    "/tedarikci-odeme",
    "/musteri-tahsilat",
  ];
  for (const p of paths) revalidatePath(p);
}

async function renameTedarikciRefs(oldAd: string, newAd: string) {
  await prisma.giderGirisi.updateMany({
    where: { tedarikciAdi: oldAd },
    data: { tedarikciAdi: newAd },
  });
  await prisma.urunAlim.updateMany({
    where: { tedarikci: oldAd },
    data: { tedarikci: newAd },
  });
  await prisma.urunSatis.updateMany({
    where: { musteri: oldAd },
    data: { musteri: newAd },
  });
  await prisma.tedarikciOdeme.updateMany({
    where: { tedarikciAdi: oldAd },
    data: { tedarikciAdi: newAd },
  });
  await prisma.musteriTahsilat.updateMany({
    where: { musteriAdi: oldAd },
    data: { musteriAdi: newAd },
  });
  await prisma.yeniUrunTakip.updateMany({
    where: { tedarikci: oldAd },
    data: { tedarikci: newAd },
  });
}

async function renameUrunRefs(oldAd: string, newAd: string) {
  await prisma.giderGirisi.updateMany({
    where: { urunAdi: oldAd },
    data: { urunAdi: newAd },
  });
  await prisma.urunAlim.updateMany({
    where: { urunAdi: oldAd },
    data: { urunAdi: newAd },
  });
  await prisma.urunSatis.updateMany({
    where: { urunAdi: oldAd },
    data: { urunAdi: newAd },
  });
  await prisma.yeniUrunTakip.updateMany({
    where: { urunAdi: oldAd },
    data: { urunAdi: newAd },
  });
}

async function renameGiderTuruRefs(oldAd: string, newAd: string, urunMu: boolean) {
  const rows = await prisma.giderGirisi.findMany({ where: { giderTuru: oldAd } });
  for (const row of rows) {
    const kategoriUrun = isUrunGideri(row.giderKategori);
    if (urunMu === kategoriUrun) {
      await prisma.giderGirisi.update({
        where: { id: row.id },
        data: { giderTuru: newAd },
      });
    }
  }
}

export async function createTedarikci(formData: FormData) {
  const ad = trim(formData.get("ad"));
  const tip = trim(formData.get("tip")) || "TEDARİKÇİ";
  if (!ad) return;
  await prisma.tedarikci.upsert({
    where: { ad },
    create: { ad, tip },
    update: { tip },
  });
  revalidateTanimlama();
}

export async function updateTedarikci(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  const tip = trim(formData.get("tip")) || "TEDARİKÇİ";
  if (!ad) return;
  const existing = await prisma.tedarikci.findUnique({ where: { id } });
  if (!existing) return;
  if (existing.ad !== ad) await renameTedarikciRefs(existing.ad, ad);
  await prisma.tedarikci.update({ where: { id }, data: { ad, tip } });
  revalidateTanimlama();
}

export async function deleteTedarikci(id: number) {
  await prisma.tedarikci.delete({ where: { id } });
  revalidateTanimlama();
}

export async function createUrun(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await prisma.urun.upsert({
    where: { ad },
    create: { ad },
    update: {},
  });
  revalidateTanimlama();
}

export async function updateUrun(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  const existing = await prisma.urun.findUnique({ where: { id } });
  if (!existing) return;
  if (existing.ad !== ad) await renameUrunRefs(existing.ad, ad);
  await prisma.urun.update({ where: { id }, data: { ad } });
  revalidateTanimlama();
}

export async function deleteUrun(id: number) {
  await prisma.urun.delete({ where: { id } });
  revalidateTanimlama();
}

export async function createGenelGider(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await prisma.genelGiderTuru.upsert({
    where: { ad },
    create: { ad },
    update: {},
  });
  revalidateTanimlama();
}

export async function updateGenelGider(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  const existing = await prisma.genelGiderTuru.findUnique({ where: { id } });
  if (!existing) return;
  if (existing.ad !== ad) await renameGiderTuruRefs(existing.ad, ad, false);
  await prisma.genelGiderTuru.update({ where: { id }, data: { ad } });
  revalidateTanimlama();
}

export async function deleteGenelGider(id: number) {
  await prisma.genelGiderTuru.delete({ where: { id } });
  revalidateTanimlama();
}

export async function createUrunGider(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await prisma.urunGiderTuru.upsert({
    where: { ad },
    create: { ad },
    update: {},
  });
  revalidateTanimlama();
}

export async function updateUrunGider(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  const existing = await prisma.urunGiderTuru.findUnique({ where: { id } });
  if (!existing) return;
  if (existing.ad !== ad) await renameGiderTuruRefs(existing.ad, ad, true);
  await prisma.urunGiderTuru.update({ where: { id }, data: { ad } });
  revalidateTanimlama();
}

export async function deleteUrunGider(id: number) {
  await prisma.urunGiderTuru.delete({ where: { id } });
  revalidateTanimlama();
}
