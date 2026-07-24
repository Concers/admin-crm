"use server";

import { revalidatePath } from "next/cache";
import { createForm, deleteForm, updateForm } from "@/lib/api";

export async function createFormAction(kind: string): Promise<{ error?: string; id?: number }> {
  try {
    const form = await createForm({ kind });
    revalidatePath("/formlar");
    return { id: form?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Form oluşturulamadı." };
  }
}

export async function updateFormAction(
  id: number,
  formData: FormData,
): Promise<void | { error?: string }> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Başlık zorunludur." };
  const body = {
    title,
    subtype: String(formData.get("subtype") ?? "").trim() || null,
    status: String(formData.get("status") ?? "DRAFT"),
    partnerId: String(formData.get("partnerId") ?? "").trim() || null,
    body: String(formData.get("body") ?? ""),
  };
  try {
    await updateForm(id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
  revalidatePath(`/formlar/${id}`);
  revalidatePath("/formlar");
}

export async function deleteFormAction(id: number): Promise<void | { error?: string }> {
  try {
    await deleteForm(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Silinemedi." };
  }
  revalidatePath("/formlar");
}
