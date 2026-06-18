"use server";

import { revalidatePath } from "next/cache";
import {
  createPartner,
  updatePartner,
  deletePartner,
  createProduct,
  updateProduct,
  deleteProduct,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/lib/api";

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

export async function createTedarikci(formData: FormData) {
  const ad = trim(formData.get("ad"));
  const tip = trim(formData.get("tip")) || "SUPPLIER";
  if (!ad) return;
  await createPartner({ name: ad, type: tip });
  revalidateTanimlama();
}

export async function updateTedarikci(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  const tip = trim(formData.get("tip")) || "SUPPLIER";
  if (!ad) return;
  await updatePartner(id, { name: ad, type: tip });
  revalidateTanimlama();
}

export async function deleteTedarikci(id: number) {
  await deletePartner(id);
  revalidateTanimlama();
}

export async function createUrun(formData: FormData) {
  const ad = trim(formData.get("ad"));
  const raf = trim(formData.get("raf"));
  if (!ad) return;
  await createProduct({ name: ad, shelfLocation: raf || null });
  revalidateTanimlama();
}

export async function updateUrun(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  const raf = trim(formData.get("raf"));
  if (!ad) return;
  await updateProduct(id, { name: ad, shelfLocation: raf || null });
  revalidateTanimlama();
}

export async function deleteUrun(id: number) {
  await deleteProduct(id);
  revalidateTanimlama();
}

export async function createGenelGider(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await createExpenseCategory({ name: ad, scope: "GENERAL" });
  revalidateTanimlama();
}

export async function updateGenelGider(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await updateExpenseCategory(id, { name: ad, scope: "GENERAL" });
  revalidateTanimlama();
}

export async function deleteGenelGider(id: number) {
  await deleteExpenseCategory(id);
  revalidateTanimlama();
}

export async function createUrunGider(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await createExpenseCategory({ name: ad, scope: "PRODUCT" });
  revalidateTanimlama();
}

export async function updateUrunGider(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return;
  await updateExpenseCategory(id, { name: ad, scope: "PRODUCT" });
  revalidateTanimlama();
}

export async function deleteUrunGider(id: number) {
  await deleteExpenseCategory(id);
  revalidateTanimlama();
}
