"use server";

import { revalidatePath } from "next/cache";
import { deleteBudgetTarget, upsertBudgetTarget, type BudgetMetric } from "@/lib/api";

export async function saveBudgetTarget(formData: FormData): Promise<{ error?: string } | void> {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const metric = String(formData.get("metric") ?? "") as BudgetMetric;
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!year || month < 1 || month > 12 || amount < 0) {
    return { error: "Yıl, ay ve geçerli tutar girin." };
  }
  if (metric === "EXPENSE_CATEGORY" && !category) {
    return { error: "Kategori bazlı hedef için gider türü seçin." };
  }

  try {
    await upsertBudgetTarget({
      year,
      month,
      metric,
      category: metric === "EXPENSE_CATEGORY" ? category : null,
      amount,
      notes: notes || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Hedef kaydedilemedi." };
  }

  revalidatePath("/raporlar/butce");
}

export async function removeBudgetTarget(id: number) {
  await deleteBudgetTarget(id);
  revalidatePath("/raporlar/butce");
}
