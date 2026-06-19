"use server";

import { revalidatePath } from "next/cache";
import { createPartner, updatePartner, deletePartner, createProduct, updateProduct, deleteProduct, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory, createContact, updateContact, deleteContact, getPartnerContacts } from "@/lib/api";
import { toPartnerType } from "@/lib/partner-types";

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

async function runAction(fn: () => Promise<unknown>): Promise<{ error?: string } | void> {
  try {
    await fn();
    revalidateTanimlama();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "İşlem başarısız oldu." };
  }
}

export async function createTedarikci(formData: FormData) {
  const ad = trim(formData.get("ad"));
  const tip = toPartnerType(trim(formData.get("tip")) || "SUPPLIER");
  const priceTier = trim(formData.get("priceTier")) || null;
  if (!ad) return { error: "Ad gerekli." };
  return runAction(() => createPartner({ name: ad, type: tip, priceTier }));
}

export async function updateTedarikci(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  const tip = toPartnerType(trim(formData.get("tip")) || "SUPPLIER");
  const priceTier = trim(formData.get("priceTier")) || null;
  if (!ad) return { error: "Ad gerekli." };
  return runAction(() => updatePartner(id, { name: ad, type: tip, priceTier }));
}

export async function deleteTedarikci(id: number) {
  return runAction(() => deletePartner(id));
}

export async function createUrun(formData: FormData) {
  const ad = trim(formData.get("ad"));
  const raf = trim(formData.get("raf"));
  if (!ad) return { error: "Ürün adı gerekli." };
  return runAction(() => createProduct({ name: ad, shelfLocation: raf || null }));
}

export async function updateUrun(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  const raf = trim(formData.get("raf"));
  if (!ad) return { error: "Ürün adı gerekli." };
  return runAction(() => updateProduct(id, { name: ad, shelfLocation: raf || null }));
}

export async function deleteUrun(id: number) {
  return runAction(() => deleteProduct(id));
}

export async function createGenelGider(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return { error: "Gider türü gerekli." };
  return runAction(() => createExpenseCategory({ name: ad, scope: "GENERAL" }));
}

export async function updateGenelGider(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return { error: "Gider türü gerekli." };
  return runAction(() => updateExpenseCategory(id, { name: ad }));
}

export async function deleteGenelGider(id: number) {
  return runAction(() => deleteExpenseCategory(id));
}

export async function createUrunGider(formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return { error: "Gider türü gerekli." };
  return runAction(() => createExpenseCategory({ name: ad, scope: "PRODUCT" }));
}

export async function updateUrunGider(id: number, formData: FormData) {
  const ad = trim(formData.get("ad"));
  if (!ad) return { error: "Gider türü gerekli." };
  return runAction(() => updateExpenseCategory(id, { name: ad }));
}

export async function deleteUrunGider(id: number) {
  return runAction(() => deleteExpenseCategory(id));
}

export async function loadPartnerContacts(partnerId: number) {
  return getPartnerContacts(partnerId);
}

export async function createKisi(partnerId: number, formData: FormData) {
  const name = trim(formData.get("name"));
  if (!name) return { error: "Ad gerekli." };
  return runAction(() =>
    createContact(partnerId, {
      name,
      title: trim(formData.get("title")) || null,
      phone: trim(formData.get("phone")) || null,
      email: trim(formData.get("email")) || null,
    })
  );
}

export async function updateKisi(id: number, formData: FormData) {
  const name = trim(formData.get("name"));
  if (!name) return { error: "Ad gerekli." };
  return runAction(() =>
    updateContact(id, {
      name,
      title: trim(formData.get("title")) || null,
      phone: trim(formData.get("phone")) || null,
      email: trim(formData.get("email")) || null,
    })
  );
}

export async function deleteKisi(id: number) {
  return runAction(() => deleteContact(id));
}
