"use server";

import { revalidatePath } from "next/cache";
import { createAttachment, deleteAttachment, getAttachments } from "@/lib/api";

export async function loadAttachments(entityName: string, entityId: number) {
  return getAttachments(entityName, entityId);
}

export async function addAttachment(formData: FormData) {
  const entityName = String(formData.get("entityName") ?? "");
  const entityId = Number(formData.get("entityId"));
  const fileName = String(formData.get("fileName") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const mimeType = String(formData.get("mimeType") ?? "").trim();
  const sizeRaw = String(formData.get("size") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!entityName || !entityId || !fileName || !url) {
    return { error: "Dosya adı ve bağlantı zorunludur." };
  }

  try {
    await createAttachment({
      entityName,
      entityId,
      fileName,
      url,
      ...(category ? { category } : {}),
      ...(mimeType ? { mimeType } : {}),
      ...(sizeRaw ? { size: Number(sizeRaw) } : {}),
    });
    revalidatePath("/belgeler/fatura");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ek eklenemedi." };
  }
}

export async function removeAttachment(id: number) {
  try {
    await deleteAttachment(id);
    revalidatePath("/belgeler/fatura");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ek silinemedi." };
  }
}
