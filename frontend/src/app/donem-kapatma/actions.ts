"use server";

import { revalidatePath } from "next/cache";
import { createPeriodLock, deletePeriodLock } from "@/lib/api";
import { friendlyApiError } from "@/lib/action-errors";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function trim(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}

export async function lockPeriod(formData: FormData): Promise<void | { error?: string }> {
  const year = num(formData.get("year"));
  const scope = trim(formData.get("scope"));
  const month = scope === "year" ? null : num(formData.get("month"));
  const note = trim(formData.get("note")) || null;

  if (year < 2000) return { error: "Geçerli bir yıl girin." };
  if (scope !== "year" && (month == null || month < 1 || month > 12)) {
    return { error: "Geçerli bir ay seçin." };
  }

  try {
    await createPeriodLock({ year, month, note });
  } catch (e) {
    return { error: friendlyApiError(e, "Dönem kilitlenemedi.") };
  }
  revalidatePath("/donem-kapatma");
}

export async function unlockPeriod(id: number) {
  await deletePeriodLock(id);
  revalidatePath("/donem-kapatma");
}
