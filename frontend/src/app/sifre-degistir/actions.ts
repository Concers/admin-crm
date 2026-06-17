"use server";

import { changePassword } from "@/lib/api";

export async function changePasswordAction(formData: FormData): Promise<void | { error?: string }> {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 6) return { error: "Yeni şifre en az 6 karakter olmalı." };
  if (next !== confirm) return { error: "Yeni şifreler eşleşmiyor." };

  try {
    await changePassword(current, next);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Şifre değiştirilemedi." };
  }
}
