"use server";

import { revalidatePath } from "next/cache";
import { createShelf, deleteShelf } from "@/lib/api";

export async function addShelf(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!code) return { error: "Raf kodu zorunludur." };

  try {
    await createShelf({
      code,
      ...(location ? { location } : {}),
      ...(notes ? { notes } : {}),
    });
    revalidatePath("/raf-takibi");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Raf eklenemedi." };
  }
}

export async function removeShelf(id: number) {
  try {
    await deleteShelf(id);
    revalidatePath("/raf-takibi");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Raf silinemedi." };
  }
}
