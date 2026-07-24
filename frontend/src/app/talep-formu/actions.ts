"use server";

import { revalidatePath } from "next/cache";
import { createRequestForm, deleteRequestForm, updateRequestForm } from "@/lib/api";

type Json = Record<string, unknown>;
type LineInput = { productId?: number | null; itemName: string; quantity: number; unit?: string | null; note?: string | null };

export async function createRequestFormAction(body: {
  type: "PRODUCTION" | "PROCUREMENT";
  partnerId: number;
  notes?: string | null;
  lines: LineInput[];
}): Promise<{ error?: string; id?: number }> {
  if (!body.partnerId) return { error: "Cari (üretici/tedarikçi) seçilmelidir." };
  if (!body.lines.length) return { error: "En az bir kalem eklenmelidir." };
  try {
    const form = await createRequestForm(body as unknown as Json);
    revalidatePath("/talep-formu");
    return { id: form?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Talep formu oluşturulamadı." };
  }
}

export async function updateRequestFormAction(
  id: number,
  body: Json,
): Promise<void | { error?: string }> {
  try {
    await updateRequestForm(id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Güncellenemedi." };
  }
  revalidatePath(`/talep-formu/${id}`);
  revalidatePath("/talep-formu");
}

export async function deleteRequestFormAction(id: number): Promise<void | { error?: string }> {
  try {
    await deleteRequestForm(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Silinemedi." };
  }
  revalidatePath("/talep-formu");
}
