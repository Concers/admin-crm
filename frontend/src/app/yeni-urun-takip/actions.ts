"use server";

import { revalidatePath } from "next/cache";
import {
  createProductDevelopment,
  deleteProductDevelopment,
  updateProductDevelopment,
} from "@/lib/api";
import { attributesFromForm, legacyPayloadFromForm } from "@/lib/urun-takip-form";

export async function createUrunTakip(formData: FormData): Promise<void | { error?: string }> {
  const attributes = attributesFromForm(formData);
  const body = legacyPayloadFromForm(formData, attributes);

  if (!body.productName) {
    return { error: "Ürün adı zorunludur." };
  }

  try {
    await createProductDevelopment(body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt eklenemedi." };
  }

  revalidatePath("/yeni-urun-takip");
}

export async function updateUrunTakip(id: number, formData: FormData): Promise<void | { error?: string }> {
  const attributes = attributesFromForm(formData);
  const body = legacyPayloadFromForm(formData, attributes);

  if (!body.productName) {
    return { error: "Ürün adı zorunludur." };
  }

  try {
    await updateProductDevelopment(id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt güncellenemedi." };
  }

  revalidatePath("/yeni-urun-takip");
}

export async function deleteUrunTakip(id: number) {
  await deleteProductDevelopment(id);
  revalidatePath("/yeni-urun-takip");
}
